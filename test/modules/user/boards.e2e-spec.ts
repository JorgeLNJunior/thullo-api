import { BoardEntity } from '@modules/board/docs/board.entity'
import { FindUserBoardsQuery } from '@modules/user/query/FindUserBoardsQuery'
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
import { BoardBuilder } from '../board/builder/board.builder'
import { MemberBuilder } from '../member/builder/member.builder'
import { UserBuilder } from './builder/user.builder'

describe('UserController/boards (e2e)', () => {
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

  it('/users/:id/boards (GET) Should return a list of boards', async () => {
    const query: FindUserBoardsQuery = {
      rule: 'MEMBER',
      take: 10,
      skip: 0
    }

    const user = await new UserBuilder().persist(prisma)
    const boardOwner = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder()
      .setOwner(boardOwner.id)
      .persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: `/users/${user.id}/boards`,
      query: query as any,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(BoardEntity.prototype)
  })

  it('/users/:id/boards (GET) Should return all user boards', async () => {
    const query: FindUserBoardsQuery = {
      rule: 'OWNER',
      take: 10,
      skip: 0
    }

    const user = await new UserBuilder().persist(prisma)
    await new BoardBuilder().setOwner(user.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: `/users/${user.id}/boards`,
      query: query as any,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(BoardEntity.prototype)
  })
})
