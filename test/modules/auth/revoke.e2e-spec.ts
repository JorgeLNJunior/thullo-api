import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { RegisterUserDto } from '@modules/auth/dto/registerUser.dto'
import { RevokeDto } from '@modules/auth/dto/revoke.dto'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'

import { generateRefreshToken } from './helpers/auth.helper'

describe('AuthController/revoke (e2e)', () => {
  let app: NestFastifyApplication
  let prisma: PrismaService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    )
    prisma = app.get(PrismaService)

    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        whitelist: true,
        validatorPackage: require('@nestjs/class-validator'),
        transformerPackage: require('@nestjs/class-transformer')
      })
    )

    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('/revoke (POST) Should revoke an refresh token', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const user = await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...data }
    })

    const refreshToken = generateRefreshToken(user)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id }
    })

    const body: RevokeDto = {
      refresh_token: refreshToken
    }

    const result = await app.inject({
      method: 'POST',
      path: `/auth/revoke`,
      payload: body
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().message).toBe('the token has been revoked')
  })

  it('/revoke (POST) Should return 400 if it receives an not stored refresh token', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const user = await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...data }
    })

    const body: RevokeDto = {
      refresh_token: generateRefreshToken(user)
    }

    const result = await app.inject({
      method: 'POST',
      path: `/auth/revoke`,
      payload: body
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe('token not found')
  })
})
