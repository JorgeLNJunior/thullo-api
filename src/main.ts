import { ConsoleLogger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { useContainer } from 'class-validator'
import { PrismaService } from 'nestjs-prisma'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.enableCors()
  app.useLogger(new ConsoleLogger())

  const prismaService: PrismaService = app.get(PrismaService)

  prismaService.enableShutdownHooks(app)
  app.enableShutdownHooks()

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true
    })
  )

  await app.listen(process.env.APP_PORT || 3000)
}
bootstrap()
