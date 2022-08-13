import { faker } from '@faker-js/faker'
import { RegisterUserDto } from '@modules/auth/dto/registerUser.dto'
import { UserEntity } from '@modules/user/docs/user.entity'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { useContainer } from 'class-validator'
import { PrismaService } from 'nestjs-prisma'

describe('AuthController/register (e2e)', () => {
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

  it('/register (POST) Should register an user', async () => {
    const body: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(),
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
      email: faker.internet.email(),
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
      email: faker.internet.email(),
      password: faker.internet.password(6)
    }

    await prisma.user.create({ data: body })

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
      email: faker.internet.email(),
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
