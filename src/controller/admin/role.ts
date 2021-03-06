import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  request,
  requestParam,
  response
} from 'inversify-express-utils'

import { CType, EAdminPermission } from '../../declaration'
import { inject } from 'inversify'
import { CoreContainer } from '../../container/core'
import { RoleEntity } from '../../entity/role'
import { NextFunction, Request, Response } from 'express'
import { ObjectID } from 'mongodb'
import { permissionMiddleware } from '../../middleware/permission'

@controller('/admin/role', permissionMiddleware(EAdminPermission.MANAGE_ROLES))
export class AdminRoleController extends BaseHttpController {
  @inject(CType.Core)
  private coreContainer!: CoreContainer
  @inject(CType.Entity.Role)
  private roleEntity!: RoleEntity

  @httpGet('/list')
  private async roleList (request: Request, response: Response, next: NextFunction) {
    const list = await this.roleEntity.list()
    response.send({ list })
  }

  @httpGet('/item/:id')
  private async roleItem (@requestParam('id') id: string, @response() response: Response) {
    const role = await this.roleEntity.get(new ObjectID(id))
    response.send({ role })
  }

  @httpGet('/delete/:id')
  private async roleDelete (@requestParam('id') id: string, @response() response: Response) {
    const success = await this.roleEntity.delete(new ObjectID(id))
    response.send({ success })
  }

  @httpPost('/create')
  private async roleCreate (@request() request: Request, @response() response: Response) {
    const { role } = request.body
    role.permissionIds = (role.permissionIds as string[]).map((_id) => new ObjectID(_id))
    const roleId = await this.roleEntity.create(role)
    response.send({ _id: roleId.toHexString() })
  }

  @httpPost('/save')
  private async saveCreate (@request() request: Request, @response() response: Response) {
    const { role } = request.body
    role._id = new ObjectID(role._id)
    role.permissionIds = (role.permissionIds as string[]).map((_id) => new ObjectID(_id))
    await this.roleEntity.save(role)
    response.send({ success: true })
  }

}
