import { faker } from '@faker-js/faker'
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
import { randomUUID } from 'node:crypto'

import { generateAccessToken } from '../../helpers/auth.helper'

describe('BoardController/delete (e2e)', () => {
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

  it('/boards (POST) Should delete a board', async () => {
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
      method: 'DELETE',
      path: `/boards/${board.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().message).toBe('the board has been deleted')
  })

  it('/boards (POST) Should return 400 if it receives an invalid board id', async () => {
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
      method: 'DELETE',
      path: `/boards/${id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe('invalid board id')
  })

  it('/boards (POST) Should return 403 if the user do not have delete rights', async () => {
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

    const unauthorizedUser = await prisma.user.create({
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

    const token = generateAccessToken(unauthorizedUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you do not have delete rights')
  })
})
