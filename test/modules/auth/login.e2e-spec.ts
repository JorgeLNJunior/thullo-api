import { faker } from '@faker-js/faker'
import { LoginDto } from '@modules/auth/dto/login.dto'
import { RegisterUserDto } from '@modules/auth/dto/registerUser.dto'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BcryptService } from '@services/bcrypt.service'
import { AppModule } from '@src/app.module'
import { useContainer } from 'class-validator'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

describe('AuthController/login (e2e)', () => {
  let app: NestFastifyApplication
  let prisma: PrismaService
  let bcrypt: BcryptService

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter()
    )
    prisma = app.get(PrismaService)
    bcrypt = app.get(BcryptService)

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

  it('/login (POST) Should return an access and refresh token', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const hash = await bcrypt.hash(data.password)

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hash
      }
    })

    const body: LoginDto = {
      email: data.email,
      password: data.password
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/login',
      payload: body
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().access_token).toBeDefined()
    expect(result.json().refresh_token).toBeDefined()
  })

  it('/login (POST) Should return 400 if the email is not registered', async () => {
    const body: LoginDto = {
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/login',
      payload: body
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe('email not registered')
  })

  it("/login (POST) Should return 401 if the password don't match", async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(randomUUID()),
      password: faker.internet.password(6)
    }

    const hash = await bcrypt.hash(data.password)

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hash
      }
    })

    const body: LoginDto = {
      email: data.email,
      password: 'invalid-password'
    }

    const result = await app.inject({
      method: 'POST',
      path: '/auth/login',
      payload: body
    })

    expect(result.statusCode).toBe(401)
    expect(result.json().message).toBe('invalid password')
  })
})
