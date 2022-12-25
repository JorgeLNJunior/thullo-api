import { MemberEntity } from '@http/board/docs/member.entity'
import { FindBoardsQuery } from '@http/board/query/findBoards.query'
import { LabelEntity } from '@http/label/docs/label.entity'
import { ListEntity } from '@http/list/docs/list.entity'
import { UserEntity } from '@http/user/docs/user.entity'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { Board, BoardVisibility } from '@prisma/client'
import { AppModule } from '@src/app.module'
import { BoardEntity } from '@src/app/http/board/docs/board.entity'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { LabelBuilder } from '../label/builder/label.builder'
import { ListBuilder } from '../list/builder/list.builder'
import { MemberBuilder } from '../member/builder/member.builder'
import { UserBuilder } from '../user/builder/user.builder'
import { BoardBuilder } from './builder/board.builder'

describe('BoardController/findMany (e2e)', () => {
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

  it('/boards (GET) Should return a list of public boards', async () => {
    const user = await new UserBuilder().persist(prisma)

    await new BoardBuilder().setOwner(user.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: '/boards',
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(BoardEntity.prototype)
    expect(result.json()[0].visibility).toBe(BoardVisibility.PUBLIC)
  })

  it('/boards (GET) Should return a list of private boards', async () => {
    const query: FindBoardsQuery = {
      visibility: BoardVisibility.PRIVATE
    }

    const user = await new UserBuilder().persist(prisma)

    await new BoardBuilder()
      .setOwner(user.id)
      .setVisibility(BoardVisibility.PRIVATE)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: '/boards',
      headers: {
        authorization: `Bearer ${token}`
      },
      query: query as any
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(BoardEntity.prototype)
    expect(result.json()[0].visibility).toBe(BoardVisibility.PRIVATE)
  })

  it('/boards (GET) Should return a list of boards with children', async () => {
    const query: FindBoardsQuery = {
      owner: true,
      labels: true,
      lists: true,
      members: true
    }

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new LabelBuilder().setBoard(board.id).persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: '/boards',
      headers: {
        authorization: `Bearer ${token}`
      },
      query: query as any
    })

    expect(result.statusCode).toBe(200)
    expect(
      result.json().find((v: Board) => v.id === board.id).owner
    ).toMatchObject(UserEntity.prototype)
    expect(
      result.json().find((v: Board) => v.id === board.id).labels[0]
    ).toMatchObject(LabelEntity.prototype)
    expect(
      result.json().find((v: Board) => v.id === board.id).lists[0]
    ).toMatchObject(ListEntity.prototype)
    expect(
      result.json().find((v: Board) => v.id === board.id).members[0]
    ).toMatchObject(MemberEntity.prototype)
  })
})
