import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils'

import Controller = interfaces.Controller
import { CType } from '../declaration'
import { NextFunction, Request, Response } from 'express'
import { inject } from 'inversify'
import { UserEntity } from '../entity/user'

@controller('/anonymouse', CType.Middleware.IsAnonymouse)
export class AnonymouseController implements Controller {

  @inject(CType.Entity.User)
  private userEntity!: UserEntity

  @httpPost('/get-token')
  private async getToken (request: Request, response: Response, next: NextFunction) {
    const { name, password } = request.body
    const token = await this.userEntity.generateToken(name, password)
    if (token) {
      response
        .status(200)
        .send({ token })
    } else {
      response.status(403)
        .send({ error: 'Token has not been generated.' })
    }
  }
}
