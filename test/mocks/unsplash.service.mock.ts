export class UnsplashServiceMock {
  async findRandomUserAvatar(): Promise<string> {
    return 'https://images.unsplash.com/photo-1659308965904-b6a5df82e9e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxyYW5kb218fHx8fHx8fHwxNjYwOTQ3MDQ4&ixlib=rb-1.2.1&q=80&w=400'
  }
  async findRandomBoardCover(): Promise<string> {
    return 'https://images.unsplash.com/photo-1659412321527-8cddf2458faa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMjA3fDB8MXxyYW5kb218fHx8fHx8fHwxNjYwOTQ3MDcz&ixlib=rb-1.2.1&q=80&w=1080'
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isUnsplashImageUrl(url: string): Promise<boolean> {
    return true
  }
}
