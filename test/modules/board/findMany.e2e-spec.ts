import { randomUUID } from 'node:crypto'

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
import { CreateBoardDto } from '@src/app/http/board/dto/createBoard.dto'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'

describe('BoardController/findMany (e2e)', () => {
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

  it('/boards (GET) Should return a list of boards', async () => {
    const data: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence()
    }

    const user = await prisma.user.create({
      data: {
        name: faker.internet.userName(),
        email: faker.internet.email(randomUUID()),
        password: faker.internet.password(6),
        profileImage: faker.internet.avatar()
      }
    })

    await prisma.board.create({
      data: {
        coverImage: faker.image.image(),
        ownerId: user.id,
        ...data
      }
    })

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'GET',
      path: '/boards',
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()[0]).toMatchObject(BoardEntity.prototype)
  })
})
