import { faker } from '@faker-js/faker'
import { MemberEntity } from '@modules/board/docs/member.entity'
import { AddMemberDto } from '@modules/board/dto/addMember.dto'
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
import { randomUUID } from 'node:crypto'

import { generateAccessToken } from '../auth/helpers/auth.helper'

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

  it('/boards/:id/members/:userId (PUT) Should add a member to a board', async () => {
    const body: AddMemberDto = {
      role: BoardRole.MEMBER
    }

    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

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
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.ADMIN
      }
    })

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
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

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
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.ADMIN
      }
    })

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
    const id = faker.datatype.uuid()

    const ownerUser = await prisma.user.create({
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
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    await prisma.member.create({
      data: {
        userId: ownerUser.id,
        boardId: board.id,
        role: BoardRole.ADMIN
      }
    })

    const token = generateAccessToken(ownerUser)

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

    const user = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

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
        coverImage: faker.image.image(),
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
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

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
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

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
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

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
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.MEMBER
      }
    })

    const token = generateAccessToken(ownerUser)

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
