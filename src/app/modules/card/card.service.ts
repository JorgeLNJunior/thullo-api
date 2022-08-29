import { Injectable } from '@nestjs/common'
import { Card } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { CreateCardDto } from './dto/createCard.dto'

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new Card
   * @param listId The id of the list.
   * @param dto The data to create a card.
   * @returns A `Card` object.
   */
  async create(listId: string, dto: CreateCardDto): Promise<Card> {
    let position = 0

    const lastCardByPosition = await this.prisma.card.findFirst({
      where: {
        listId: listId
      },
      orderBy: {
        position: 'desc'
      }
    })

    if (lastCardByPosition) {
      position = lastCardByPosition.position + 1
    }

    return this.prisma.card.create({
      data: {
        listId: listId,
        position: position,
        ...dto
      }
    })
  }

  // findAll() {
  //   return `This action returns all card`
  // }

  // findOne(id: string) {
  //   return `This action returns a #${id} card`
  // }

  // update(id: string, updateCardDto: UpdateCardDto) {
  //   return `This action updates a #${id} card`
  // }

  // remove(id: string) {
  //   return `This action removes a #${id} card`
  // }
}
