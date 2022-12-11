import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BoardRole } from '@prisma/client'
import { AppModule } from '@src/app.module'
import { MemberWithUserEntity } from '@src/app/http/board/docs/memberWithUser.entity'
import { FindBoardMembersQuery } from '@src/app/http/board/query/findBoardMembers.query'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { MemberBuilder } from '../member/builder/member.builder'
import { UserBuilder } from '../user/builder/user.builder'
import { BoardBuilder } from './builder/board.builder'

describe('BoardController/findMembers (e2e)', () => {
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

  it('/boards (GET) Should return a list of members', async () => {
    const query: FindBoardMembersQuery = {
      role: BoardRole.MEMBER,
      take: 1,
      skip: 0
    }

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: `/boards/${board.id}/members`,
      query: query as any,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(MemberWithUserEntity.prototype)
  })
})
