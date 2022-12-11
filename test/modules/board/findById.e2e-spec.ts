import { faker } from '@faker-js/faker'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@src/app.module'
import { BoardEntity } from '@src/app/http/board/docs/board.entity'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { UserBuilder } from '../user/builder/user.builder'
import { BoardBuilder } from './builder/board.builder'

describe('BoardController/findById (e2e)', () => {
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

  it('/boards (GET) Should return a board', async () => {
    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: `/boards/${board.id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(BoardEntity.prototype)
  })

  it('/boards (GET) Should return 404 if the board was not found', async () => {
    const id = faker.datatype.uuid()

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: `/boards/${id}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(404)
    expect(result.json().message).toBe('board not found')
  })
})
