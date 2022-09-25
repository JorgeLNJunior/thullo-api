import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { BoardEntity } from '@modules/board/docs/board.entity'
import { CreateBoardDto } from '@modules/board/dto/createBoard.dto'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { UnsplashService } from '@services/unsplash.service'
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'

import { UnsplashServiceMock } from '../../mocks/unsplash.service.mock'
import { generateAccessToken } from '../auth/helpers/auth.helper'

describe('BoardController/create (e2e)', () => {
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

  it('/boards (POST) Should create a board', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence()
    }

    const user = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(201)
    expect(result.json()).toMatchObject(BoardEntity.prototype)
  })

  it('/boards (POST) Should return 400 if the title length is more than 30', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.paragraph(),
      description: faker.lorem.sentence()
    }

    const user = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards (POST) Should return 400 if the description length is more than 1500', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.paragraphs(10)
    }

    const user = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })
})
