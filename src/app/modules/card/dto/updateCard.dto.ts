import { PartialType } from '@nestjs/swagger'

import { CreateCardDto } from './createCard.dto'

export class UpdateCardDto extends PartialType(CreateCardDto) {}
