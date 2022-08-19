import { Injectable, NotFoundException } from '@nestjs/common'
import { Board } from '@prisma/client'
import { UnsplashService } from '@services/unsplash.service'
import { PrismaService } from 'nestjs-prisma'

import { CreateBoardDto } from './dto/createBoard.dto'

@Injectable()
export class BoardService {
  constructor(
    private prima: PrismaService,
    private unsplash: UnsplashService
  ) {}

  /**
   *
   * @param ownerId
   * @param dto
   * @returns the created board data.
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

  // findAll() {
  //   return `This action returns all board`
  // }

  /**
   *
   * @param id
   * @returns a board that matches the received id.
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
