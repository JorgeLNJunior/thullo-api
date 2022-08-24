import { Injectable } from '@nestjs/common'
import { List } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { CreateListDto } from './dto/createList.dto'

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new list.
   * @param boardId The id of the board.
   * @param dto The needed data to create a list.
   * @returns A `List`object.
   */
  async create(boardId: string, dto: CreateListDto): Promise<List> {
    let position: number

    const lastListByPosition = await this.prisma.list.findFirst({
      where: {
        boardId: boardId
      },
      orderBy: {
        position: 'desc'
      },
      take: 1
    })

    if (lastListByPosition && lastListByPosition.position) {
      position = lastListByPosition.position + 1
    } else position = 1

    return this.prisma.list.create({
      data: {
        title: dto.title,
        position: position,
        boardId: boardId
      }
    })
  }

  /**
   * Find all the lists of a board.
   * @param boardId The id of the board.
   * @returns A list of `List`
   */
  findBoardLists(boardId: string) {
    return this.prisma.list.findMany({
      where: { boardId: boardId }
    })
  }

  // update(id: number, updateListDto: UpdateListDto) {
  //   return `This action updates a #${id} list`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} list`
  // }
}
