import { Injectable, NotFoundException } from '@nestjs/common'
import { Board, List } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { CreateListDto } from './dto/createList.dto'
import { UpdateListDto } from './dto/updateList.dto'

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
      }
    })

    if (lastListByPosition) {
      position = lastListByPosition.position + 1
    } else position = 0

    return this.prisma.list.create({
      data: {
        title: dto.title,
        position: position,
        boardId: boardId
      }
    })
  }

  /**
   * Find a list by id.
   * @param listId The id of the list
   * @returns A `List` object.
   * @throws `NotFoundException`
   */
  async findById(listId: string): Promise<List> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId }
    })
    if (!list) throw new NotFoundException('list not found')

    return list
  }

  /**
   * Find all the lists of a board.
   * @param boardId The id of the board.
   * @returns A list of `List`
   */
  findBoardLists(boardId: string): Promise<List[]> {
    return this.prisma.list.findMany({
      where: { boardId: boardId }
    })
  }

  /**
   * Update a board list.
   * @param boardId The id of the board.
   * @param listId The id of the list.
   * @param dto The data to be updated
   * @returns A `List`object.
   */
  async update(
    boardId: string,
    listId: string,
    dto: UpdateListDto
  ): Promise<List> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: { lists: true }
    })

    const list = board.lists.find((value) => value.id === listId)
    if (!list) throw new NotFoundException('list not found')

    // avoid false value when it receives 0
    if (dto.position || dto.position === 0) {
      const isPositionAlreadyInUse = board.lists.find(
        (value) => value.position === dto.position
      )

      if (isPositionAlreadyInUse) {
        if (list.position > dto.position) {
          await this.prisma.list.updateMany({
            where: {
              boardId: boardId,
              position: {
                gte: dto.position
              }
            },
            data: {
              position: {
                increment: 1
              }
            }
          })
        }
        if (list.position < dto.position) {
          await this.prisma.list.updateMany({
            where: {
              boardId: boardId,
              position: {
                lte: dto.position
              }
            },
            data: {
              position: {
                decrement: 1
              }
            }
          })
        }
      }
    }

    return this.prisma.list.update({
      where: { id: listId },
      data: dto
    })
  }

  /**
   * Delete a list
   * @param listId The id of the list
   */
  async delete(listId: string): Promise<void> {
    await this.prisma.list.delete({
      where: { id: listId }
    })
  }

  /**
   * Find a board by the id of a list.
   * @param listId The id of the list.
   * @returns a `Board` object.
   */
  async findBoardByListId(listId: string): Promise<Board | null> {
    const list = await this.prisma.list.findUnique({
      where: { id: listId }
    })

    const board = await this.prisma.board.findUnique({
      where: { id: list.boardId }
    })

    if (board) return board
    return null
  }
}
