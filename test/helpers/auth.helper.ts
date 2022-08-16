import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'

import { JWT_ACCESS_TOKEN_SECRET } from '../config/envVars'

export function generateAccessToken(user: User) {
  return new JwtService({
    secret: JWT_ACCESS_TOKEN_SECRET
  }).sign({ user_id: user.id })
}
