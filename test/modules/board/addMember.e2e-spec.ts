import { faker } from '@faker-js/faker'
import { MemberEntity } from '@http/board/docs/member.entity'
import { AddMemberDto } from '@http/board/dto/addMember.dto'
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

describe('BoardController/addMember (e2e)', () => {
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

  it('/boards/:id/members/:userId (PUT) Should add a member to a board', async () => {
    const body: AddMemberDto = {
      role: BoardRole.MEMBER
    }

    const ownerUser = await new UserBuilder().persist(prisma)

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(ownerUser.id)
      .setRole(BoardRole.ADMIN)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(MemberEntity.prototype)
  })

  it('/boards/:id/members/:userId (PUT) Should return 400 if it receives a invalid role', async () => {
    const ownerUser = await new UserBuilder().persist(prisma)

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(ownerUser.id)
      .setRole(BoardRole.ADMIN)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}`,
      payload: { role: 'invalid-role' },
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards/:id/members/:userId (PUT) Should return 404 if it receives an invalid user id', async () => {
    const { id } = new UserBuilder().build()

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .setRole(BoardRole.ADMIN)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('user not found')
  })

  it('/boards/:id/members/:userId (PUT) Should return 404 if it receives an invalid board id', async () => {
    const id = faker.datatype.uuid()

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${id}/members/${user.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('board not found')
  })

  it('/boards/:id/members/:userId (PUT) Should return 400 if the user is already a member of the board', async () => {
    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .setRole(BoardRole.ADMIN)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
    expect(result.json().message[0]).toBe(
      'this user is already a member of this board'
    )
  })

  it('/boards/:id/members/:userId (PUT) Should return 403 if it receives a request from a user that is not a member of the board', async () => {
    const ownerUser = await new UserBuilder().persist(prisma)

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder()
      .setOwner(ownerUser.id)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })

  it('/boards/:id/members/:userId (PUT) Should return 403 if it receives a request from a user that is not a board admin', async () => {
    const user = await new UserBuilder().persist(prisma)

    const userToBeAdded = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)

    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(userToBeAdded.id)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}`,
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
