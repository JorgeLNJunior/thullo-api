import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { RegisterUserDto } from '@modules/auth/dto/registerUser.dto'
import { UserEntity } from '@modules/user/docs/user.entity'
import { UpdateUserDto } from '@modules/user/dto/updateUser.dto'
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

describe('UserController/update (e2e)', () => {
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

  it('/users (PATCH) Should update a user', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }
    const body: UpdateUserDto = {
      name: faker.internet.userName()
    }

    const user = await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...data }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/users/${user.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(UserEntity.prototype)
  })

  it('/users (PATCH) Should return 400 if the user is is invalid', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }
    const body: UpdateUserDto = {
      name: faker.internet.userName()
    }

    const user = await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...data }
    })

    const token = generateAccessToken(user)

    await prisma.user.delete({ where: { id: user.id } })

    const result = await app.inject({
      method: 'PATCH',
      path: `/users/${user.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe('invalid user id')
  })

  it('/users (PATCH) Should return 403 if the user has no access rights', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }
    const unauthorizedUserdata: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }
    const body: UpdateUserDto = {
      name: faker.internet.userName()
    }

    const user = await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...data }
    })
    const unauthorizedUser = await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...unauthorizedUserdata }
    })

    const token = generateAccessToken(unauthorizedUser)

    const result = await app.inject({
      method: 'PATCH',
      path: `/users/${user.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe("you don't have access rights")
  })
})
