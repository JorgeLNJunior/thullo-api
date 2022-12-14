import { faker } from '@faker-js/faker'
import { ListEntity } from '@http/list/docs/list.entity'
import { UpdateListDto } from '@http/list/dto/updateList.dto'
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

import { generateAccessToken } from '../auth/helpers/auth.helper'

describe('BoardListController/update (e2e)', () => {
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

  it('/boards/:boardId/lists (PATCH) Should update a list', async () => {
    const body: UpdateListDto = {
      title: faker.lorem.word(),
      position: 0
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)
    const list = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(1)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}/lists/${list.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(ListEntity.prototype)
  })

  it('/boards/:boardId/lists (PATCH) Should return 404 if the list does not exist', async () => {
    const body: UpdateListDto = {
      title: faker.lorem.word(),
      position: 0
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}/lists/invalidID`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('list not found')
  })

  it('/boards/:boardId/lists (PATCH) Should return 400 if the title lenght is greater than 30', async () => {
    const body: UpdateListDto = {
      title: faker.datatype.string(31)
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)
    const list = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(1)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}/lists/${list.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards/:boardId/lists (PATCH) Should return 400 if the position value is less than 0', async () => {
    const body: UpdateListDto = {
      position: -1
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)
    const list = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(1)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}/lists/${list.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards/:boardId/lists (PATCH) Should update the position of all other lists when a position changes', async () => {
    const body: UpdateListDto = {
      position: 2 // change the position from 0 to 2
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)

    // create all the lists
    const list = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(0)
      .persist(prisma)
    const { id: secondListId } = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(1)
      .persist(prisma)
    const { id: thirdListId } = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(2)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}/lists/${list.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    // select new positions
    const { position: secondListPosition } = await prisma.list.findUnique({
      where: { id: secondListId }
    }) // should be changed from 1 to 0
    const { position: thirdListPosition } = await prisma.list.findUnique({
      where: { id: thirdListId }
    }) // should be changed from 2 to 1

    expect(result.json().position).toBe(2)
    expect(secondListPosition).toBe(0)
    expect(thirdListPosition).toBe(1)
  })

  it('/boards/:boardId/lists (PATCH) Should return 403 if the user is not a member of the board', async () => {
    const body: UpdateListDto = {
      title: faker.lorem.word(),
      position: 0
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new ListBuilder().setBoard(board.id).persist(prisma)
    const list = await new ListBuilder()
      .setBoard(board.id)
      .setPosition(1)
      .persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/boards/${board.id}/lists/${list.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })
})
