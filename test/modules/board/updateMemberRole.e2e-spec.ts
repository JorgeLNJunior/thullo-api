import { useContainer } from '@nestjs/class-validator'
import { ValidationPipe } from '@nestjs/common'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { Test, TestingModule } from '@nestjs/testing'
import { BoardRole } from '@prisma/client'
import { AppModule } from '@src/app.module'
import { MemberEntity } from '@src/app/http/board/docs/member.entity'
import { UpdateMemberRoleDto } from '@src/app/http/board/dto/updateRole.dto'
import { PrismaService } from 'nestjs-prisma'

import { generateAccessToken } from '../auth/helpers/auth.helper'
import { MemberBuilder } from '../member/builder/member.builder'
import { UserBuilder } from '../user/builder/user.builder'
import { BoardBuilder } from './builder/board.builder'

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

  it('/boards/:id/members/:userId/roles (PUT) Should update the role of a member', async () => {
    const body: UpdateMemberRoleDto = {
      role: BoardRole.ADMIN
    }

    const ownerUser = await new UserBuilder().persist(prisma)

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setRole(BoardRole.ADMIN)
      .setUser(ownerUser.id)
      .setBoard(board.id)
      .persist(prisma)

    await new MemberBuilder()
      .setUser(user.id)
      .setBoard(board.id)
      .persist(prisma)

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

  it('/boards/:id/members/:userId/roles (PUT) Should return 400 if it receives an invalid role', async () => {
    const body: UpdateMemberRoleDto = {
      role: 'ANVALID_ROLE' as any
    }

    const ownerUser = await new UserBuilder().persist(prisma)

    const user = await new UserBuilder().persist(prisma)

    const board = await new BoardBuilder().setOwner(user.id).persist(prisma)

    await new MemberBuilder()
      .setRole(BoardRole.ADMIN)
      .setUser(ownerUser.id)
      .setBoard(board.id)
      .persist(prisma)

    await new MemberBuilder()
      .setUser(user.id)
      .setBoard(board.id)
      .persist(prisma)

    const token = generateAccessToken(ownerUser)

    const result = await app.inject({
      method: 'PUT',
      path: `/boards/${board.id}/members/${user.id}/roles`,
      payload: body,
      headers: {
        authorization: `Bearer ${token}`
      }
    })

    expect(result.statusCode).toBe(400)
  })
})
