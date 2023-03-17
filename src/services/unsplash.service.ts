import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import axios, { AxiosError, AxiosInstance } from 'axios'

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
   * Find a random unsplash image to be used as user profile image.
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
      if (error instanceof AxiosError) {
        this.logger.error(error.response.data.errors)
      }
      throw new InternalServerErrorException()
    }
  }

  /**
   * Find a random unsplash image to be used as board cover.
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
      if (error instanceof AxiosError) {
        this.logger.error(error.response.data.errors)
      }
      throw new InternalServerErrorException()
    }
  }

  /**
   * Verify if a given url is a valid unsplash image url.
   * @param url The url to be verified.
   * @returns `true` if the url is a valid unsplash image, `false` if not.
   */
  isUnsplashImageUrl(url: string): boolean {
    return url.startsWith('https://images.unsplash.com/photo-')
  }
}
