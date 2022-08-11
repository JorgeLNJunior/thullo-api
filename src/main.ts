import helmet from '@fastify/helmet'
import { ConsoleLogger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { useContainer } from 'class-validator'
import { PrismaService } from 'nestjs-prisma'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )
  const prismaService: PrismaService = app.get(PrismaService)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.enableCors()
  app.useLogger(new ConsoleLogger())

  app.register(helmet)

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true
    })
  )

  prismaService.enableShutdownHooks(app)
  app.enableShutdownHooks()

  await app.listen(process.env.APP_PORT || 3000, '0.0.0.0')
}
bootstrap()
