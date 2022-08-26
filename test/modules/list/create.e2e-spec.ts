import { faker } from '@faker-js/faker'
import { ListEntity } from '@modules/list/docs/list.entity'
import { CreateListDto } from '@modules/list/dto/createList.dto'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { BoardBuilder } from '@test/modules/board/builder/board.builder'
import { MemberBuilder } from '@test/modules/member/builder/member.builder'
import { UserBuilder } from '@test/modules/user/builder/user.builder'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'

describe('BoardListController/create (e2e)', () => {
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

  it('/boards/:boardId/lists (POST) Should add a list to a board', async () => {
    const body: CreateListDto = {
      title: faker.lorem.word()
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: `/boards/${board.id}/lists`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(201)
    expect(result.json()).toMatchObject(ListEntity.prototype)
  })

  it('/boards/:boardId/lists (POST) Should return 404 if it receives an invalid board id', async () => {
    const body: CreateListDto = {
      title: faker.lorem.word()
    }
    const id = faker.datatype.uuid()

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: `/boards/${id}/lists`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('board not found')
  })

  it('/boards/:boardId/lists (POST) Should return 400 if title is empty', async () => {
    const body: CreateListDto = {
      title: undefined
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: `/boards/${board.id}/lists`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards/:boardId/lists (POST) Should return 403 if the user is not a board member', async () => {
    const body: CreateListDto = {
      title: faker.lorem.word()
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: `/boards/${board.id}/lists`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })
})
