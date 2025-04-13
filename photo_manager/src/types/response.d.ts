export interface ResponseType<T> {
  /**
   * The status code of the response.
   */
  status: number

  /**
   * The data of the response.
   */
  data: T

  /**
   * The message of the response.
   */
  statusText: string
}
