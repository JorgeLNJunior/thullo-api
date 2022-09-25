import { randomUUID } from 'node:crypto'

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

  it('/boards/:id/members/:userId (DELETE) Should remove a member from a board', async () => {
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const userToBeRemoved = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    // create the board
    const board = await prisma.board.create({
      data: {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    // add the owner user as admin
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.ADMIN
      }
    })

    // add the user to the board
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: userToBeRemoved.id,
        role: BoardRole.MEMBER
      }
    })

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
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const userToBeRemoved = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    // create the board
    const board = await prisma.board.create({
      data: {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    // add the owner user as admin
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.ADMIN
      }
    })

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

  it('/boards/:id/members/:userId (DELETE) Should return 403 if the user is not a member of the board', async () => {
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const userToBeRemoved = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    // create the board
    const board = await prisma.board.create({
      data: {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    // add the user to the board
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: userToBeRemoved.id,
        role: BoardRole.MEMBER
      }
    })

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
    const ownerUser = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    const userToBeRemoved = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    // create the board
    const board = await prisma.board.create({
      data: {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    // add the owner user as member
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.MEMBER
      }
    })

    // add the user to the board
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: userToBeRemoved.id,
        role: BoardRole.MEMBER
      }
    })

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
