import { PartialType } from '@nestjs/swagger'

import { CreateListDto } from './createList.dto'

export class UpdateListDto extends PartialType(CreateListDto) {}
