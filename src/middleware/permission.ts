import { interfaces } from 'inversify-express-utils'
import { Request, Response, NextFunction } from 'express'
import HttpContext = interfaces.HttpContext

export const permissionMiddleware = function (permission: string) {
  return async function (request: Request, response: Response, next: NextFunction) {
    const context: HttpContext = Reflect.getMetadata(
      'inversify-express-utils:httpcontext',
      request
    )
    const hasAccess = await context.user.isResourceOwner(permission)
    if (!hasAccess) {
      response
        .status(403)
        .send({ error: 'The authenticated user does not have an access to the resource.' })
    }
    return next()
  }
}
