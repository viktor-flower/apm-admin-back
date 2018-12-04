import { BaseMiddleware } from 'inversify-express-utils'
import { inject, injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'

@injectable()
export class IsAnonymouseMiddleware extends BaseMiddleware {
  public async handler (
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const isAuthenticated = await this.httpContext.user.isAuthenticated()
    if (isAuthenticated) {
      response
        .status(403)
        .end()
    }
    next()
  }
}
