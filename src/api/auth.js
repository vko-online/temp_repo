import { HttpError } from '../lib'

export async function getAuthenticatedUser (ctx) {
  const user = await ctx.user
  if (!user) return HttpError.unauthorized()
  return user
}
