import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'

@Injectable()
export class CanModifyUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const idParameter = request.params.id

    if (user.id !== idParameter)
      throw new ForbiddenException("you don't have access rights")

    return true
  }
}
