import { BaseHttpController, controller, httpGet, interfaces, requestParam, response } from 'inversify-express-utils'
import { Request } from 'express'

import Controller = interfaces.Controller
import { permission } from '../decorator'
import { inject } from 'inversify'
import { AuthenticationContainer } from '../container/authentication'
import { CType } from '../declaration'
import { UserEntity } from '../entity/user'
import { ObjectId } from 'bson'

@controller('/service')
export class ServiceController extends BaseHttpController {

  @inject(CType.Entity.User)
  private userEntity!: UserEntity

  @httpGet('/own-acl')
  // @permission('fetch_own_acl')
  private async ownAcl () {
    const hasAccess = await this.httpContext.user.isResourceOwner('fetch_own_acl')
    if (!hasAccess) {
      return this.json({ message: 'Forbidden' }, 403)
    }
    return this.json(this.httpContext.user.details, 200)
  }

  @httpGet('/acl/:_id')
  // @permission('fetch_any_acl')
  private async acl (request: Request) {
    const hasAccess = await this.httpContext.user.isResourceOwner('fetch_any_acl')
    if (!hasAccess) {
      return this.json({ message: 'Forbidden' }, 403)
    }
    const userData = await this.userEntity.getFull(new ObjectId(request.params._id))

    return this.json(userData, 200)
  }
}
