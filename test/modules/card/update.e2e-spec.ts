import { faker } from '@faker-js/faker'
import { CardEntity } from '@modules/card/docs/card.entity'
import { UpdateCardDto } from '@modules/card/dto/updateCard.dto'
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
import { ListBuilder } from '../list/builder/list.builder'
import { CardBuilder } from './builder/card.builder'

describe('CardController/update (e2e)', () => {
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

  it('/lists/:id/cards (PATCH) Should update a card', async () => {
    const body: UpdateCardDto = {
      title: faker.lorem.word(),
      description: faker.lorem.paragraph(),
      position: 1
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    await new MemberBuilder()
      .setBoard(board.id)
      .setUser(user.id)
      .persist(prisma)
    const list = await new ListBuilder().setBoard(board.id).persist(prisma)
    const card = await new CardBuilder().setList(list.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/lists/${list.id}/cards/${card.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(CardEntity.prototype)
  })

  it('/lists/:id/cards (PATCH) Should return 403 if the user is not a member of the board', async () => {
    const body: UpdateCardDto = {
      title: faker.lorem.word(),
      description: faker.lorem.paragraph(),
      position: 1
    }

    const user = await new UserBuilder().persist(prisma)
    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)
    const list = await new ListBuilder().setBoard(board.id).persist(prisma)
    const card = await new CardBuilder().setList(list.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'PATCH',
      path: `/lists/${list.id}/cards/${card.id}`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(403)
    expect(result.json().message).toBe('you are not a member of this board')
  })
})
