import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class BcryptService {
  /**
   * @param plainPassword
   * @returns The password hash.
   */
  async hash(plainPassword: string) {
    return bcrypt.hash(plainPassword, 10)
  }

  /**
   * @param plainPassword
   * @param hash
   * @returns `true` if it match, `false` if it doesn't match.
   */
  async compare(plainPassword: string, hash: string) {
    return bcrypt.compare(plainPassword, hash)
  }
}
