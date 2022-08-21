import { faker } from '@faker-js/faker'
import { BoardEntity } from '@modules/board/docs/board.entity'
import { UpdateBoardDto } from '@modules/board/dto/update-board.dto'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BoardRole } from '@prisma/client'
import { UnsplashService } from '@services/unsplash.service'
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

import { generateAccessToken } from '../../helpers/auth.helper'
import { UnsplashServiceMock } from '../../mocks/unsplash.service.mock'

describe('BoardController/update (e2e)', () => {
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

  it('/boards (PATCH) Should update a board', async () => {
    const body: UpdateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      coverImage:
        'https://images.unsplash.com/photo-1659130933531-ce92ad5f77b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxyYW5kb218fHx8fHx8fHwxNjYxMTA5ODUy&ixlib=rb-1.2.1&q=80&w=1080'
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
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        coverImage: faker.image.unsplash.imageUrl(),
        ownerId: user.id
      }
    })

    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: user.id,
        role: BoardRole.ADMIN
      }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(BoardEntity.prototype)
  })
})
