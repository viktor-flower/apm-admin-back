import {BaseHttpController, controller, httpGet, interfaces, response} from 'inversify-express-utils'
import {Response} from 'express'

import Controller = interfaces.Controller
import { permission } from '../decorator'
import { inject } from 'inversify'
import { AuthenticationContainer } from '../container/authentication'

@controller('/service')
export class ServiceController extends BaseHttpController {
  // @inject('AuthService') private readonly _authService: AuthenticationContainer

  @httpGet('/own-acl')
  @permission('fetch_own_acl')
  private async ownAcl () {
    let h = this.httpContext;
    return this.json(this.httpContext.user.details, 200)
  }

  @httpGet('/acl/:id')
  @permission('fetch_own_acl')
  private acl () {
  }
}
