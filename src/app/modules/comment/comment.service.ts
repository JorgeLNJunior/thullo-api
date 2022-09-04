import { Injectable } from '@nestjs/common'
import { Comment } from '@prisma/client'
import { PrismaService } from 'nestjs-prisma'

import { CreateCommentDto } from './dto/createComment.dto'
import { UpdateCommentDto } from './dto/updateComment.dto'
import { CommentByCardIdQuery } from './query/commentByCardId.query'

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

  /**
   * Find comments by the id of the card.
   * @param cardId The id of the card.
   * @param query Query params.
   * @returns A list of `Comment`
   */
  findByCardId(
    cardId: string,
    query?: CommentByCardIdQuery
  ): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { cardId: cardId, userId: query.userId },
      take: Number(query.take) || 20,
      skip: Number(query.skip) || 0
    })
  }

  /**
   * Update a comment.
   * @param commentId The id of the comment.
   * @param dto The data to be updated.
   * @returns A `Comment` object.
   */
  update(commentId: string, dto: UpdateCommentDto): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: dto
    })
  }

  /**
   * Delete a comment.
   * @param commentId The id of the comment.
   */
  async delete(commentId: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id: commentId }
    })
  }

  /**
   * Check if an user is the author of a comment.
   * @param commentId The id of the comment.
   * @param userId The id of the user
   */
  async isCommentAuthor(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (comment.userId === userId) return true
    return false
  }
}
