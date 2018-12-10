import { inject, injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'
import { interfaces } from 'inversify-express-utils'
import AuthProvider = interfaces.AuthProvider
import Principal = interfaces.Principal
import { IUserData, UserEntity } from '../entity/user'
import { CType } from '../declaration'
import { CoreContainer } from './core'
import { ObjectID } from 'bson'

class UserPrincipal implements interfaces.Principal {
  public details: IUserData
  public constructor (details: any) {
    this.details = details
  }

  public isAuthenticated (): Promise<boolean> {
    return Promise.resolve(!!this.details && !!this.details._id)
  }

  public async isResourceOwner (resourceId: any): Promise<boolean> {
    const isAuthenticated = await this.isAuthenticated()
    if (!isAuthenticated) {
      return Promise.resolve(false)
    }
    const permissionNames: string[] = []
    this.details!.roles!.forEach((role) => {
      role!.permissions!.forEach((permission) => {
        permissionNames.push(permission.name)
      })
    })
    const hasAccess = permissionNames.indexOf(resourceId) > -1

    return Promise.resolve(hasAccess)
  }

  public isInRole (role: string): Promise<boolean> {
    return Promise.resolve(role === 'admin')
  }

}

@injectable()
export class AuthenticationContainer implements AuthProvider {

  @inject(CType.Core)
  private coreContainer!: CoreContainer
  @inject(CType.Entity.User)
  private userEntity!: UserEntity

  public async getUser (
    request: Request,
    response: Response,
    next?: NextFunction
  ): Promise<Principal> {
    const str = request.get(`Authorization`)
    if (!str) {
      return new UserPrincipal(null)
    }
    const authorizationType = str.substr(0, 6)
    if (authorizationType !== 'bearer') {
      return new UserPrincipal(null)
    }
    const encryptedToken = str.substr(7, str.length - 1)
    const tokenData = this.coreContainer.decodeToken(encryptedToken)
    const user = await this.userEntity.getFull(new ObjectID(tokenData.id))

    return new UserPrincipal(user)
  }
}
