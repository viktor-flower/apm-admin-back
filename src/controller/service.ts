import { BaseHttpController, controller, httpGet, interfaces, requestParam, response } from 'inversify-express-utils'
import { Request } from 'express'

import Controller = interfaces.Controller
import { permission } from '../decorator'
import { inject } from 'inversify'
import { AuthenticationContainer } from '../container/authentication'
import { CType, EAdminPermission } from '../declaration'
import { UserEntity } from '../entity/user'
import { ObjectId } from 'bson'

@controller('/service')
export class ServiceController extends BaseHttpController {

  @inject(CType.Entity.User)
  private userEntity!: UserEntity

  @httpGet('/own-acl')
  @permission(EAdminPermission.FETCH_OWN_ACL)
  private async ownAcl () {
    return this.json(this.httpContext.user.details, 200)
  }

  @httpGet('/acl/:_id')
  @permission(EAdminPermission.FETCH_ANY_ACL)
  private async acl (request: Request) {
    const userData = await this.userEntity.getFull(new ObjectId(request.params._id))

    return this.json(userData, 200)
  }
}
