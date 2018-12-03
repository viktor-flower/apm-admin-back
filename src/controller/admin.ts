import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils'

import Controller = interfaces.Controller
import { CType } from '../declaration'
import { inject } from 'inversify'
import { CoreContainer } from '../container/core'
import { UserEntity } from '../entity/user'
import { NextFunction, Request, Response } from 'express'

@controller('/admin')
export class AdminController implements Controller {
  constructor (
    @inject(CType.Core)
    private coreContainer: CoreContainer,
    @inject(CType.Entity.User)
    private userEntity: UserEntity
  ) {}

  @httpGet('/test')
  private test (): string {
    return 'test'
  }

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
        .send('')
    }
  }
}
