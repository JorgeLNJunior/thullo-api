import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { CommentEntity } from '@src/app/http/comment/docs/comment.entity'
import { CommentByCardIdQuery } from '@src/app/http/comment/query/commentByCardId.query'
import { BoardBuilder } from '@test/modules/board/builder/board.builder'
import { MemberBuilder } from '@test/modules/member/builder/member.builder'
import { UserBuilder } from '@test/modules/user/builder/user.builder'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { CardBuilder } from '../card/builder/card.builder'
import { ListBuilder } from '../list/builder/list.builder'
import { CommentBuilder } from './builder/comment.builder'

describe('CommentController/findByCardId (e2e)', () => {
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

  it('/cards/:id/comments (GET) Should return a list of comments', async () => {
    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    const list = await new ListBuilder().setBoard(board.id).persist(prisma)
    const card = await new CardBuilder().setList(list.id).persist(prisma)
    await new CommentBuilder().setCard(card.id).setUser(user.id).persist(prisma)

    const token = generateAccessToken(user)

    const query: CommentByCardIdQuery = {
      userId: user.id,
      take: 10,
      skip: 0
    }

    const result = await app.inject({
      method: 'GET',
      path: `/cards/${card.id}/comments`,
      query: query as any,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(CommentEntity.prototype)
  })

  it('/cards/:id/comments (GET) Should return 403 if the user is not a member of the board', async () => {
    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    const list = await new ListBuilder().setBoard(board.id).persist(prisma)
    const card = await new CardBuilder().setList(list.id).persist(prisma)

    const token = generateAccessToken(user)

    const query: CommentByCardIdQuery = {
      userId: user.id,
      take: 10,
      skip: 0
    }

    const result = await app.inject({
      method: 'GET',
      path: `/cards/${card.id}/comments`,
      query: query as any,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })
})
