export default class HttpError extends Error {
  code = 400

  // lazy calls
  static unauthorized = () => Promise.reject(new HttpError('Unauthorized', 401))
  static notFound = () => Promise.reject(new HttpError('Not found', 404))
  static incorrectPassword = () => Promise.reject(new HttpError('Password incorrect', 400))

  constructor (message, code = 400) {
    super(message)
    this.code = code
    // todo(medet): internally log events
  }

  format () {
    return this.message + this.code
  }
}
