import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { BoardBuilder } from '@test/modules/board/builder/board.builder'
import { ListBuilder } from '@test/modules/list/builder/list.builder'
import { MemberBuilder } from '@test/modules/member/builder/member.builder'
import { UserBuilder } from '@test/modules/user/builder/user.builder'
import { PrismaService } from 'nestjs-prisma'
import { randomUUID } from 'node:crypto'

import { generateAccessToken } from '../auth/helpers/auth.helper'

describe('BoardListController/delete (e2e)', () => {
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

  it('/lists (DELETE) Should delete a list', async () => {
    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    const list = await new ListBuilder().setBoard(board.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/lists/${list.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json().message).toBe('the list has been deleted')
  })

  it('/lists (DELETE) Should return 403 if the user is not a member of the board', async () => {
    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    const list = await new ListBuilder().setBoard(board.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/lists/${list.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })

  it('/lists (DELETE) Should return 404 if the list was not found', async () => {
    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    const id = randomUUID()

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'DELETE',
      path: `/boards/${board.id}/lists/${id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('list not found')
  })
})
