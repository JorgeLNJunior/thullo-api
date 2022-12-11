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

describe('BoardController/removeMember (e2e)', () => {
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

  it('/boards/:id/members/:userId (DELETE) Should remove a member from a board', async () => {
    const ownerUser = await new UserBuilder().persist(prisma)

    const userToBeRemoved = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    await new MemberBuilder()
      .setRole(BoardRole.ADMIN)
      .setUser(ownerUser.id)
      .setBoard(board.id)
      .persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(userToBeRemoved.id)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/members/${userToBeRemoved.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().message).toBe('the member has been removed')
  })

  it('/boards/:id/members/:userId (DELETE) Should return 400 if the user to be added is not a member of the board', async () => {
    const ownerUser = await new UserBuilder().persist(prisma)

    const userToBeRemoved = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    await new MemberBuilder()
      .setRole(BoardRole.ADMIN)
      .setUser(ownerUser.id)
      .setBoard(board.id)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/members/${userToBeRemoved.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe(
      'this user is is not a member of this board'
    )
  })

  it('/boards/:id/members/:userId (DELETE) Should return 403 if it receives a request from a user that is not a member of the board', async () => {
    const ownerUser = await new UserBuilder().persist(prisma)

    const userToBeRemoved = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/members/${userToBeRemoved.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })

  it('/boards/:id/members/:userId (DELETE) Should return 403 if the user is not a board admin', async () => {
    const ownerUser = await new UserBuilder().persist(prisma)

    const userToBeRemoved = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    await new MemberBuilder()
      .setUser(ownerUser.id)
      .setBoard(board.id)
      .persist(prisma)

    await new MemberBuilder()
      .setUser(userToBeRemoved.id)
      .setBoard(board.id)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/members/${userToBeRemoved.id}`,
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
