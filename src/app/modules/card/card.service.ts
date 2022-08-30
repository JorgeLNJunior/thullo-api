import { Injectable } from '@nestjs/common'
import { Card } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { CreateCardDto } from './dto/createCard.dto'
import { UpdateCardDto } from './dto/updateCard.dto'

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

  /**
   * Update a card.
   * @param cardId The if of the card.
   * @param dto The data to be updated.
   * @returns A `Card` object.
   */
  async update(cardId: string, dto: UpdateCardDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId }
    })

    const allCardsFromList = await this.prisma.card.findMany({
      where: { listId: card.listId },
      orderBy: { position: 'desc' }
    })

    // avoid false value when it receives 0
    if (dto.position || dto.position === 0) {
      const isPositionAlreadyInUse = allCardsFromList.find(
        (value) => value.position === dto.position
      )

      if (isPositionAlreadyInUse) {
        if (card.position > dto.position) {
          await this.prisma.card.updateMany({
            where: {
              listId: card.listId,
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
        if (card.position < dto.position) {
          await this.prisma.card.updateMany({
            where: {
              listId: card.listId,
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

    return this.prisma.card.update({
      where: { id: cardId },
      data: dto
    })
  }

  /**
   * Delete a card.
   * @param cardId The id of the card
   */
  async delete(cardId: string) {
    await this.prisma.card.delete({
      where: { id: cardId }
    })
  }
}
