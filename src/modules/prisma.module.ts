import { Module } from '@nestjs/common'
import { PrismaModule as Prisma } from 'nestjs-prisma'

@Module({
  imports: [Prisma.forRoot({ isGlobal: true })]
})
export class PrismaModule {}
