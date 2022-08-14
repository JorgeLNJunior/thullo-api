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

describe('UserController/findById (e2e)', () => {
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

  it('/users (GET) Should return a user', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(6)
    }

    const user = await prisma.user.create({ data: data })

    const result = await app.inject({
      method: 'GET',
      path: `/users/${user.id}`
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(UserEntity.prototype)
  })

  it('/users (GET) Should return 404 if the user was not found', async () => {
    const id = faker.datatype.uuid()

    const result = await app.inject({
      method: 'GET',
      path: `/users/${id}`
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('user not found')
  })
})