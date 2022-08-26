import { faker } from '@faker-js/faker'
import { ListEntity } from '@modules/list/docs/list.entity'
import { UpdateListDto } from '@modules/list/dto/updateList.dto'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { BoardBuilder } from '@test/builders/board.builder'
import { ListBuilder } from '@test/builders/list.builder'
import { MemberBuilder } from '@test/builders/member.builder'
import { UserBuilder } from '@test/builders/user.builder'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../../helpers/auth.helper'

describe('ListController/update (e2e)', () => {
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
})
