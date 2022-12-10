import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from '@nestjs/class-validator'
import { Injectable } from '@nestjs/common'
import { UnsplashService } from '@services/unsplash.service'

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUnsplashImageUrlConstraint
  implements ValidatorConstraintInterface
{
  constructor(private unsplash: UnsplashService) {}

  async validate(url: string): Promise<boolean> {
    const isValid = await this.unsplash.isUnsplashImageUrl(url)
    return isValid
  }
  defaultMessage?(): string {
    return '$property should be a valid unsplash image url'
  }
}

export function IsUnsplashImageUrl(options?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: options,
      constraints: [],
      validator: IsUnsplashImageUrlConstraint
    })
  }
}
