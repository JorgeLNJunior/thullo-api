import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { MemberWithUserEntity } from '@modules/board/docs/memberWithUser.entity'
import { FindBoardMembersQuery } from '@modules/board/query/findBoardMembers.query'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BoardRole } from '@prisma/client'
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'

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

  it('/boards (GET) Should return a list of members', async () => {
    const query: FindBoardMembersQuery = {
      role: BoardRole.MEMBER,
      take: '1',
      skip: '0'
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
        title: faker.lorem.words(2),
        description: faker.lorem.sentence()
      }
    })

    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: user.id,
        role: BoardRole.MEMBER
      }
    })

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
