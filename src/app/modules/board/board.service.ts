import { Injectable, NotFoundException } from '@nestjs/common'
import { Board } from '@prisma/client'
import { UnsplashService } from '@services/unsplash.service'
import { PrismaService } from 'nestjs-prisma'

import { CreateBoardDto } from './dto/createBoard.dto'
import { FindBoardsQuery } from './query/findBoards.query'

@Injectable()
export class BoardService {
  constructor(
    private prima: PrismaService,
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

    return this.prima.board.create({
      data: {
        ownerId: ownerId,
        coverImage: coverImage,
        ...dto
      }
    })
  }

  /**
   * Find many Boards.
   * @param query A query object to filter Boards.
   * @returns A list of Boards, 20 results by default.
   */
  findMany(query: FindBoardsQuery): Promise<Board[]> {
    return this.prima.board.findMany({
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
    const board = await this.prima.board.findUnique({
      where: { id: id }
    })

    if (!board) throw new NotFoundException('board not found')

    return board
  }

  // update(id: number, updateBoardDto: UpdateBoardDto) {
  //   return `This action updates a #${id} board`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} board`
  // }
}
