export interface AccessToken {
  /** user id */
  user_id: string

  /** issued at */
  iat: number

  /** expiration time */
  exp: number
}
