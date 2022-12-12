import { faker } from '@faker-js/faker'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BoardRole, BoardVisibility } from '@prisma/client'
import { UnsplashService } from '@services/unsplash.service'
import { AppModule } from '@src/app.module'
import { BoardEntity } from '@src/app/http/board/docs/board.entity'
import { UpdateBoardDto } from '@src/app/http/board/dto/update-board.dto'
import { PrismaService } from 'nestjs-prisma'

import { UnsplashServiceMock } from '../../mocks/unsplash.service.mock'
import { generateAccessToken } from '../auth/helpers/auth.helper'
import { MemberBuilder } from '../member/builder/member.builder'
import { UserBuilder } from '../user/builder/user.builder'
import { BoardBuilder } from './builder/board.builder'

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

  it('/boards (PATCH) Should update a board', async () => {
    const body: UpdateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      visibility: BoardVisibility.PUBLIC,
      coverImage:
        'https://images.unsplash.com/photo-1659130933531-ce92ad5f77b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxyYW5kb218fHx8fHx8fHwxNjYxMTA5ODUy&ixlib=rb-1.2.1&q=80&w=1080'
    }

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setRole(BoardRole.ADMIN)
      .setUser(user.id)
      .setBoard(board.id)
      .persist(prisma)

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
