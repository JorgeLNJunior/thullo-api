import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Board, BoardRole, BoardVisibility, Member } from '@prisma/client'
import { UnsplashService } from '@services/unsplash.service'
import { LabelService } from '@src/app/http/label/label.service'
import { PrismaService } from 'nestjs-prisma'

import { AddMemberDto } from './dto/addMember.dto'
import { CreateBoardDto } from './dto/createBoard.dto'
import { UpdateBoardDto } from './dto/update-board.dto'
import { UpdateMemberRoleDto } from './dto/updateRole.dto'
import { FindBoardMembersQuery } from './query/findBoardMembers.query'
import { FindBoardsQuery } from './query/findBoards.query'

@Injectable()
export class BoardService {
  constructor(
    private prisma: PrismaService,
    private unsplash: UnsplashService,
    private labelService: LabelService
  ) {}

  /**
   * Create a Board.
   * @param ownerId The id of the user who wants to create the board.
   * @param dto The data needed to create a board.
   * @returns The created board data.
   */
  async create(ownerId: string, dto: CreateBoardDto): Promise<Board> {
    if (!dto.coverImage) {
      dto.coverImage = await this.unsplash.findRandomBoardCover()
    }

    const board = await this.prisma.board.create({
      data: {
        ownerId: ownerId,
        coverImage: dto.coverImage,
        ...dto
      }
    })

    await this.prisma.member.create({
      data: {
        boardId: board.id,
        userId: ownerId,
        role: BoardRole.ADMIN
      }
    })

    await this.labelService.createDefaultLabels(board.id)

    return board
  }

  /**
   * Find many Boards.
   * @param query A query object to filter Boards.
   * @returns A list of Boards, 20 results by default.
   */
  findMany(
    query: FindBoardsQuery,
    authenticatedUserId: string
  ): Promise<Board[]> {
    return this.prisma.board.findMany({
      where: {
        ownerId: query.ownerId,
        visibility: query.visibility || BoardVisibility.PUBLIC,
        members: {
          every: {
            userId:
              query.visibility === BoardVisibility.PRIVATE
                ? authenticatedUserId
                : undefined
          }
        }
      },
      take: query.take || 20,
      skip: query.skip || 0
    })
  }

  /**
   *
   * @param id The Board id.
   * @returns A Board that matches the received id.
   * @throws `NotFoundException`
   */
  async findById(id: string): Promise<Board> {
    const board = await this.prisma.board.findUnique({
      where: { id: id }
    })

    if (!board) throw new NotFoundException('board not found')

    return board
  }

  /**
   * Update a board data.
   * @param id The board id.
   * @param dto The data to be updated.
   * @returns The updated board.
   */
  update(id: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id: id },
      data: dto
    })
  }

  /**
   * Delete a Board.
   * @param id The id of the Board to be deleted.
   * @throws `BadRequestException` if it receives an invalid board id.
   */
  async delete(id: string) {
    await this.prisma.board.delete({
      where: { id: id }
    })
  }

  /**
   * Find the members of a board.
   * @param boardId The id of the board
   * @returns A list of `Members`.
   */
  async findMembers(boardId: string, query?: FindBoardMembersQuery) {
    return this.prisma.member.findMany({
      where: {
        boardId: boardId,
        role: query.role
      },
      include: {
        user: true
      },
      take: query.take || 20,
      skip: query.skip || 0
    })
  }

  /**
   * Add a new member to a board
   * @param boardId The id of the Board wich the User will be added.
   * @param userId The id of the User to be added to the Board.
   * @param dto The data to add a Member to a Board.
   * @returns The created `Member`object.
   */
  async addMember(
    boardId: string,
    userId: string,
    dto: AddMemberDto
  ): Promise<Member> {
    const isMember = await this.prisma.member.findFirst({
      where: {
        boardId: boardId,
        userId: userId
      }
    })
    if (isMember) {
      throw new BadRequestException([
        'this user is already a member of this board'
      ])
    }

    return this.prisma.member.create({
      data: {
        boardId: boardId,
        userId: userId,
        role: dto.role
      }
    })
  }

  /**
   * Remove a member from a board
   * @param boardId The id of the Board wich the User will be removed.
   * @param userId The id of the User to be removed from the Board.
   */
  async removeMember(boardId: string, userId: string) {
    const isMember = await this.prisma.member.findFirst({
      where: {
        boardId: boardId,
        userId: userId
      }
    })
    if (!isMember) {
      throw new BadRequestException([
        'this user is is not a member of this board'
      ])
    }

    await this.prisma.member.deleteMany({
      where: {
        boardId: boardId,
        userId: userId
      }
    })
  }

  /**
   * Update the role of board member.
   * @param boardId The id of the board.
   * @param userId The id of the user.
   * @param dto The needed data to update the role.
   * @returns The updated `Member` object.
   * @throws `BadRequestException`
   */
  async updateMemberRole(
    boardId: string,
    userId: string,
    dto: UpdateMemberRoleDto
  ): Promise<Member> {
    const isMember = await this.prisma.member.findFirst({
      where: {
        boardId: boardId,
        userId: userId
      }
    })
    if (!isMember) {
      throw new BadRequestException([
        'this user is is not a member of this board'
      ])
    }

    await this.prisma.member.updateMany({
      where: {
        boardId: boardId,
        userId: userId
      },
      data: dto
    })

    return this.prisma.member.findFirst({
      where: {
        boardId: boardId,
        userId: userId
      }
    })
  }
}
