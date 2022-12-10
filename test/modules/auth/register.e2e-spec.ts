import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { UnsplashService } from '@services/unsplash.service'
import { AppModule } from '@src/app.module'
import { RegisterUserDto } from '@src/app/http/auth/dto/registerUser.dto'
import { UserEntity } from '@src/app/http/user/docs/user.entity'
import { PrismaService } from 'nestjs-prisma'

import { UnsplashServiceMock } from '../../mocks/unsplash.service.mock'

describe('AuthController/register (e2e)', () => {
  let app: NestFastifyApplication
  let prisma: PrismaService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(UnsplashService)
      .useClass(UnsplashServiceMock)
      .compile()

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

  it('/register (POST) Should register an user', async () => {
    const body: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/register',
      payload: body
    })

    expect(result.statusCode).toBe(201)
    expect(result.json()).toMatchObject(UserEntity.prototype)
  })

  it('/register (POST) Should return 400 if a name is not provided', async () => {
    const body: RegisterUserDto = {
      name: undefined, // requires a name
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/register',
      payload: body
    })

    expect(result.statusCode).toBe(400)
  })

  it('/register (POST) Should return 400 if a valid email is not provided', async () => {
    const body: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.lorem.lines(1), // requires a valid email address
      password: faker.internet.password(6)
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/register',
      payload: body
    })

    expect(result.statusCode).toBe(400)
  })

  it('/register (POST) Should return 400 if the email is already registered', async () => {
    const body: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    await prisma.user.create({
      data: { profileImage: faker.internet.avatar(), ...body }
    })

    const result = await app.inject({
      method: 'POST',
      path: '/auth/register',
      payload: body
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message).toContain('email already registered')
  })

  it('/register (POST) Should return 400 if a valid password is not provided', async () => {
    const body: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(5) // requires a min length of 6
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/register',
      payload: body
    })

    expect(result.statusCode).toBe(400)
  })
})
