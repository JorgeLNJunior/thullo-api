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
          orientation: 'squarish',
          content_filter: 'high'
        }
      })
      return response.data.urls.small
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }

  /**
   *
   * @returns a random unsplash image with landscape orientation and 1080px width.
   */
  async findRandomBoardCover(): Promise<string> {
    try {
      const response = await this.axios.get('/photos/random', {
        params: {
          orientation: 'landscape',
          content_filter: 'high'
        }
      })
      return response.data.urls.regular
    } catch (error) {
      this.logger.error(error.message, error.stack)
      throw new InternalServerErrorException()
    }
  }
}
