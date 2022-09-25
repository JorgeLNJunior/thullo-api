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
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'

describe('BoardController/findById (e2e)', () => {
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

  it('/boards (GET) Should return a board', async () => {
    const data: CreateBoardDto = {
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

    const board = await prisma.board.create({
      data: {
        coverImage: faker.image.image(),
        ownerId: user.id,
        ...data
      }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: `/boards/${board.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(BoardEntity.prototype)
  })

  it('/boards (GET) Should return 404 if the board was not found', async () => {
    const id = faker.datatype.uuid()

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
      method: 'GET',
      path: `/boards/${id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('board not found')
  })
})
