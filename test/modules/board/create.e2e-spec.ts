import { faker } from '@faker-js/faker'
import { BoardEntity } from '@http/board/docs/board.entity'
import { CreateBoardDto } from '@http/board/dto/createBoard.dto'
import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BoardVisibility } from '@prisma/client'
import { AppModule } from '@src/app.module'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { UserBuilder } from '../user/builder/user.builder'

describe('BoardController/create (e2e)', () => {
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

  it('/boards (POST) Should create a public board', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      visibility: BoardVisibility.PUBLIC
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(201)
    expect(result.json()).toMatchObject(BoardEntity.prototype)
    expect(result.json().visibility).toBe(BoardVisibility.PUBLIC)
  })

  it('/boards (POST) Should create a private board', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      visibility: BoardVisibility.PRIVATE
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(201)
    expect(result.json()).toMatchObject(BoardEntity.prototype)
    expect(result.json().visibility).toBe(BoardVisibility.PRIVATE)
  })

  it('/boards (POST) Should return 400 if the title length is more than 30', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.paragraph(),
      description: faker.lorem.sentence()
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards (POST) Should return 400 if the description length is more than 1500', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.paragraphs(10)
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards (POST) Should return 400 if the title is not provided', async () => {
    const body: CreateBoardDto = {
      title: undefined,
      description: faker.lorem.sentence()
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards (POST) Should return 400 if the description is not provided', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.word(),
      description: undefined
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards (POST) Should return 400 if coverImage is not a unsplash url', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      coverImage: 'http://invalid-unsplash.com'
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })

  it('/boards (POST) Should return 400 if it receives an invalid visibility', async () => {
    const body: CreateBoardDto = {
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      visibility: 'INVALID' as any
    }

    const user = await new UserBuilder().persist(prisma)

    const token = generateAccessToken(user)

    const result = await app.inject({
      method: 'POST',
      path: '/boards',
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })
})
