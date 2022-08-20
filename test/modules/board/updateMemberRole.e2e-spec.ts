import { faker } from '@faker-js/faker'
import { MemberEntity } from '@modules/board/docs/member.entity'
import { UpdateMemberRoleDto } from '@modules/board/dto/updateRole.dto'
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

import { generateAccessToken } from '../../helpers/auth.helper'

describe('BoardController/updateMemberRole (e2e)', () => {
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

  it('/boards/:id/members/:userId/roles (PUT) Should update the role of a member', async () => {
    const body: UpdateMemberRoleDto = {
      role: BoardRole.ADMIN
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

    // create the board
    const board = await prisma.board.create({
      data: {
        title: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        coverImage: faker.image.image(),
        ownerId: ownerUser.id
      }
    })

    // add the owner user to th board
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerUser.id,
        role: BoardRole.ADMIN
      }
    })

    // add the user to th board
    await prisma.member.create({
      data: {
        boardId: board.id,
        userId: user.id,
        role: BoardRole.MEMBER
      }
    })

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}/roles`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(200)
    expect(result.json()).toMatchObject(MemberEntity.prototype)
    expect(result.json().role).toBe(BoardRole.ADMIN)
  })
})
