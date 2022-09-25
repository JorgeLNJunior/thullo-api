import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { RefreshDto } from '@modules/auth/dto/refresh.dto'
import { RegisterUserDto } from '@modules/auth/dto/registerUser.dto'
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

describe('AuthController/refresh (e2e)', () => {
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
        whitelist: true
      })
    )

    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('/refresh (POST) Should return an access token', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const user = await prisma.user.create({
      data: {
        profileImage: faker.internet.avatar(),
        ...data
      }
    })

    const refreshToken = generateRefreshToken(user)

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id }
    })

    const body: RefreshDto = {
      refresh_token: refreshToken
    }

    const result = await app.inject({
      method: 'POST',
      path: `/auth/refresh`,
      payload: body
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().access_token).toBeDefined()
  })

  it('/refresh (POST) Should return 400 if it receives an invalid refresh token', async () => {
    const body: RefreshDto = {
      refresh_token: 'invalid-token'
    }

    const result = await app.inject({
      method: 'POST',
      path: `/auth/refresh`,
      payload: body
    })

    expect(result.statusCode).toBe(400)
  })
})
