import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'

@ApiExcludeController()
@Controller('/')
export class AppController {
  @Get()
  redirectToDocs(@Res() res) {
    res.status(HttpStatus.FOUND).redirect('/docs')
  }
}
