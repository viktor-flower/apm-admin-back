import { Handler, NextFunction, Request, Response } from 'express'
import { interfaces } from 'inversify-express-utils'
import HttpContext = interfaces.HttpContext

export function permission (permission: string): any {
  return function (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<Function>) {
    const fn = descriptor.value as Handler
    descriptor.value = async (request: Request, response: Response, next: NextFunction) => {
      const context: HttpContext = Reflect.getMetadata(
        'inversify-express-utils:httpcontext',
        request
      )
      const hasAccess = await context.user.isResourceOwner(permission)
      if (hasAccess) {
        return fn.call(target.constructor, request, response)
        // return fn.call(target request, response)
      } else {
        response
          .status(403)
          .send({ error: 'The authenticated user does not have an access to the resource.' })
        return response
      }
    }
  }
}
