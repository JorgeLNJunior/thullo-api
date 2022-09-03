import { Injectable } from '@nestjs/common'
import { Comment } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { CreateCommentDto } from './dto/createComment.dto'

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new Comment
   * @param cardId The id of the card.
   * @param userId The id of the user.
   * @param dto The data to create a comment.
   * @returns A `Comment` object.
   */
  create(
    cardId: string,
    userId: string,
    dto: CreateCommentDto
  ): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        cardId: cardId,
        userId: userId,
        ...dto
      }
    })
  }

  // findAll() {
  //   return `This action returns all comment`
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} comment`
  // }

  // update(id: number, updateCommentDto: UpdateCommentDto) {
  //   return `This action updates a #${id} comment`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} comment`
  // }
}
