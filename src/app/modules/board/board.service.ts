import { Injectable } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'
import { PrismaService } from 'nestjs-prisma'

import { CreateBoardDto } from './dto/createBoard.dto'

@Injectable()
export class BoardService {
  constructor(
    private prima: PrismaService,
    private unsplash: UnsplashService
  ) {}

  async create(ownerId: string, dto: CreateBoardDto) {
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

  // findOne(id: number) {
  //   return `This action returns a #${id} board`
  // }

  // update(id: number, updateBoardDto: UpdateBoardDto) {
  //   return `This action updates a #${id} board`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} board`
  // }
}
