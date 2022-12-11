import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { UserBuilder } from './builder/user.builder'

describe('UserController/remove (e2e)', () => {
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

  it('/users (DELETE) Should delete a user', async () => {
    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'DELETE',
      path: `/users/${user.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().message).toBe('The user has been deleted')
  })

  it('/users (DELETE) Should return 400 if the user is is invalid', async () => {
    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    await prisma.user.delete({ where: { id: user.id } })

    const result = await app.inject({
      method: 'DELETE',
      path: `/users/${user.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe('invalid user id')
  })

  it('/users (DELETE) Should return 403 if the user has no access rights', async () => {
    const user = await new UserBuilder().persist(prisma)
    const unauthorizedUser = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(unauthorizedUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/users/${user.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe("you don't have access rights")
  })
})
