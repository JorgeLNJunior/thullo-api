import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from '@nestjs/class-validator'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
@ValidatorConstraint({ async: true })
export class IsEmailAlreadyRegisteredConstraint
  implements ValidatorConstraintInterface
{
  constructor(private prisma: PrismaService) {}

  async validate(email: string): Promise<boolean> {
    const isEmailAlreadyRegistered = await this.prisma.user.findUnique({
      where: { email: email }
    })

    if (isEmailAlreadyRegistered) return false
    return true
  }
  defaultMessage?(): string {
    return 'email already registered'
  }
}

export function IsEmailAlreadyRegistered(options?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [],
      validator: IsEmailAlreadyRegisteredConstraint
    })
  }
}
