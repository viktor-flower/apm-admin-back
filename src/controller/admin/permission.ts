import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  request,
  requestParam,
  response
} from 'inversify-express-utils'

import { CType } from '../../declaration'
import { inject } from 'inversify'
import { CoreContainer } from '../../container/core'
import { PermissionEntity } from '../../entity/permission'
import { NextFunction, Request, Response } from 'express'
import { ObjectID } from 'mongodb'

@controller('/admin/permission')
export class AdminPermissionController extends BaseHttpController {
  @inject(CType.Core)
  private coreContainer!: CoreContainer
  @inject(CType.Entity.Permission)
  private permissionEntity!: PermissionEntity

  @httpGet('/list')
  private async permissionList (request: Request, response: Response, next: NextFunction) {
    const list = await this.permissionEntity.list()
    response.send({ list })
  }

  @httpGet('/item/:id')
  private async permissionItem (@requestParam('id') id: string, @response() response: Response) {
    const permission = await this.permissionEntity.get(new ObjectID(id))
    response.send({ permission })
  }

  @httpGet('/delete/:id')
  private async permissionDelete (@requestParam('id') id: string, @response() response: Response) {
    const success = await this.permissionEntity.delete(new ObjectID(id))
    response.send({ success })
  }

  @httpPost('/create')
  private async permissionCreate (@request() request: Request, @response() response: Response) {
    const { permission } = request.body
    const permissionId = await this.permissionEntity.create(permission)
    response.send({ _id: permissionId.toHexString() })
  }

  @httpPost('/save')
  private async saveCreate (@request() request: Request, @response() response: Response) {
    const { permission } = request.body
    permission._id = new ObjectID(permission._id)
    await this.permissionEntity.save(permission)
    response.send({ success: true })
  }

}
