import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  interfaces,
  request,
  requestParam,
  response
} from 'inversify-express-utils'

import { CType } from '../../declaration'
import { inject } from 'inversify'
import { CoreContainer } from '../../container/core'
import { UserEntity } from '../../entity/user'
import { NextFunction, Request, Response } from 'express'
import { ObjectID } from 'mongodb'

@controller('/admin/user')
export class AdminUserController extends BaseHttpController {
  @inject(CType.Core)
  private coreContainer!: CoreContainer
  @inject(CType.Entity.User)
  private userEntity!: UserEntity

  @httpGet('/list')
  private async userList (request: Request, response: Response, next: NextFunction) {
    const list = await this.userEntity.list()
    response.send({ list })
  }

  @httpGet('/item/:id')
  private async userItem (@requestParam('id') id: string, @response() response: Response) {
    const user = await this.userEntity.getFull(new ObjectID(id))
    response.send({ user })
  }

  @httpGet('/delete/:id')
  private async userDelete (@requestParam('id') id: string, @response() response: Response) {
    const success = await this.userEntity.delete(new ObjectID(id))
    response.send({ success })
  }

  @httpPost('/create')
  private async userCreate (@request() request: Request, @response() response: Response) {
    const { user } = request.body
    user.roleIds = (user.roleIds as string[]).map((_id) => new ObjectID(_id))
    user.password = 'default password have to be reseted'
    const userId = await this.userEntity.create(user)
    response.send({ _id: userId.toHexString() })
  }

  @httpPost('/save')
  private async saveCreate (@request() request: Request, @response() response: Response) {
    const { user } = request.body
    user._id = new ObjectID(user._id)
    user.roleIds = (user.roleIds as string[]).map((_id) => new ObjectID(_id))
    await this.userEntity.save(user)
    response.send({ success: true })
  }

  @httpPost('/set-password')
  private async setPassword (request: Request, response: Response) {
    const { _id, password } = request.body
    const result = await this.userEntity.setPassword(new ObjectID(_id), password)
    response.send({ success: result })
  }

}
