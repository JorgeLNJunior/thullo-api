import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { Board, BoardRole, Member } from '@prisma/client'
import { UnsplashService } from '@services/unsplash.service'
import { PrismaService } from 'nestjs-prisma'

import { AddMemberDto } from './dto/addMember.dto'
import { CreateBoardDto } from './dto/createBoard.dto'
import { FindBoardsQuery } from './query/findBoards.query'

@Injectable()
export class BoardService {
  constructor(
    private prisma: PrismaService,
    private unsplash: UnsplashService
  ) {}

  /**
   * Create a Board.
   * @param ownerId The id of the user who wants to create the board.
   * @param dto The data needed to create a board.
   * @returns The created board data.
   */
  async create(ownerId: string, dto: CreateBoardDto): Promise<Board> {
    const coverImage = await this.unsplash.findRandomBoardCover()

    const board = await this.prisma.board.create({
      data: {
        ownerId: ownerId,
        coverImage: coverImage,
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

    return board
  }

  /**
   * Find many Boards.
   * @param query A query object to filter Boards.
   * @returns A list of Boards, 20 results by default.
   */
  findMany(query: FindBoardsQuery): Promise<Board[]> {
    return this.prisma.board.findMany({
      where: {
        ownerId: query.ownerId
      },
      take: Number(query.take) || 20,
      skip: Number(query.skip) || 0
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

  // update(id: number, updateBoardDto: UpdateBoardDto) {
  //   return `This action updates a #${id} board`
  // }

  /**
   * Delete a Board.
   * @param id The id of the Board to be deleted.
   * @throws `BadRequestException` if it receives an invalid board id.
   */
  async delete(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: id }
    })
    if (!board) throw new BadRequestException(['invalid board id'])

    await this.prisma.board.delete({
      where: { id: id }
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
    dto?: AddMemberDto
  ): Promise<Member> {
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
    await this.prisma.member.deleteMany({
      where: {
        boardId: boardId,
        userId: userId
      }
    })
  }
}
