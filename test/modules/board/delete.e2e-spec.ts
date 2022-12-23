import { faker } from '@faker-js/faker'
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
import { MemberBuilder } from '../member/builder/member.builder'
import { UserBuilder } from '../user/builder/user.builder'
import { BoardBuilder } from './builder/board.builder'

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

  it('/boards (DELETE) Should delete a board', async () => {
    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .setRole(BoardRole.ADMIN)
      .persist(prisma)

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

  it('/boards (DELETE) Should return 404 if it receives an invalid board id', async () => {
    const id = faker.datatype.uuid()

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('board not found')
  })

  it('/boards (DELETE) Should return 403 if the user do not have delete rights', async () => {
    const user = await new UserBuilder().persist(prisma)

    const unauthorizedUser = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .setRole(BoardRole.ADMIN)
      .persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(unauthorizedUser.id)
      .setRole(BoardRole.MEMBER)
      .persist(prisma)

    const token = generateAccessToken(unauthorizedUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe(
      'you are not an administrator of this board'
    )
  })
})
