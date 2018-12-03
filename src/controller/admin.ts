import {controller, httpGet, httpPost, interfaces, request, requestParam, response} from 'inversify-express-utils'

import Controller = interfaces.Controller
import { CType } from '../declaration'
import { inject } from 'inversify'
import { CoreContainer } from '../container/core'
import { UserEntity } from '../entity/user'
import { NextFunction, Request, Response } from 'express'
import {ObjectID} from 'mongodb'

@controller('/admin')
export class AdminController implements Controller {
  constructor (
    @inject(CType.Core)
    private coreContainer: CoreContainer,
    @inject(CType.Entity.User)
    private userEntity: UserEntity
  ) {}

  @httpGet('/user/list')
  private async userList (request: Request, response: Response, next: NextFunction) {
    const list = await this.userEntity.list()
    response.send({ list })
  }

  @httpGet('/user/item/:id')
  private async userItem (@requestParam('id') id: string, @response() response: Response) {
    const user = await this.userEntity.get(new ObjectID(id))
    response.send({ user })
  }

  @httpGet('/user/delete/:id')
  private async userDelete (@requestParam('id') id: string, @response() response: Response) {
    const user = await this.userEntity.delete(new ObjectID(id))
    response.send({ success: true })
  }

  @httpPost('/user/create')
  private async userCreate (@request() request: Request, @response() response: Response) {
    const userId = await this.userEntity.create(request.body)
    response.send({ success: true })
  }

  @httpPost('/user/save')
  private async saveCreate (@request() request: Request, @response() response: Response) {
    await this.userEntity.save(request.body)
    response.send({ success: true })
  }

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
