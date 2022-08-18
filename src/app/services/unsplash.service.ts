import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class UnsplashService {
  constructor() {
    this.axios = axios.create({
      baseURL: 'https://unsplash.com/napi'
    })
  }

  private readonly logger = new Logger(UnsplashService.name)
  private axios: AxiosInstance

  /**
   *
   * @returns a random unsplash image with squarish orientation and 400px width.
   */
  async findRandomUserAvatar(): Promise<string> {
    try {
      const response = await this.axios.get('/photos/random', {
        params: {
          orientation: 'squarish'
        }
      })
      return response.data.urls.small
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
