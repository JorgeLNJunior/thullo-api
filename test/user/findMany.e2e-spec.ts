import { faker } from '@faker-js/faker'
import { RegisterUserDto } from '@modules/auth/dto/registerUser.dto'
import { UserEntity } from '@modules/user/docs/user.entity'
import { FindUsersQuery } from '@modules/user/query/FindUsersQuery'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { useContainer } from 'class-validator'
import { PrismaService } from 'nestjs-prisma'

describe('UserController/findMany (e2e)', () => {
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

  it('/users (GET) Should return a list of users', async () => {
    const data: RegisterUserDto = {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(6)
    }
    const query: FindUsersQuery = {
      email: data.email,
      name: data.name,
      take: '1',
      skip: '0'
    }

    await prisma.user.create({ data: data })

    const result = await app.inject({
      method: 'GET',
      path: `/users`,
      query: query as any
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(UserEntity.prototype)
  })
})