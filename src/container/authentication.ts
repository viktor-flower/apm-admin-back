import { inject, injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'
import { interfaces } from 'inversify-express-utils'
import AuthProvider = interfaces.AuthProvider
import Principal = interfaces.Principal
import { IUserData, UserEntity } from '../entity/user'
import { ANONYMOUSE_ROLE, AUTHENTOCATED_ROLE, CType } from '../declaration'
import { CoreContainer } from './core'
import { ObjectID } from 'bson'
import { IRoleData, RoleEntity } from '../entity/role'

class UserPrincipal implements interfaces.Principal {
  public details: IUserData
  public constructor (details: any) {
    this.details = details
  }

  public isAuthenticated (): Promise<boolean> {
    return Promise.resolve(!!this.details && !!this.details._id)
  }

  public async isResourceOwner (resourceId: any): Promise<boolean> {
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
  @inject(CType.Entity.Role)
  private roleEntity!: RoleEntity

  private anonymouseRole!: IRoleData
  private authenticatedRole!: IRoleData

  public async getAnonymouseRole (): Promise<IRoleData> {
    if (this.anonymouseRole) {
      return this.anonymouseRole
    }
    this.anonymouseRole = await this.roleEntity.getByName(ANONYMOUSE_ROLE)

    return this.anonymouseRole
  }

  public async getAuthenticatedRole (): Promise<IRoleData> {
    if (this.authenticatedRole) {
      return this.authenticatedRole
    }
    this.authenticatedRole = await this.roleEntity.getByName(AUTHENTOCATED_ROLE)

    return this.authenticatedRole
  }

  public async getUser (
    request: Request,
    response: Response,
    next?: NextFunction
  ): Promise<Principal> {
    const str = request.get(`Authorization`)
    if (!str) {
      const anonymouseRole = await this.getAnonymouseRole()
      const details: IUserData = {
        name: ANONYMOUSE_ROLE,
        roles: [ anonymouseRole ]
      }

      // Anonymouse.
      return new UserPrincipal(details)
    }
    const authorizationType = str.substr(0, 6)
    if (authorizationType !== 'bearer') {
      return new UserPrincipal(null)
    }
    const encryptedToken = str.substr(7, str.length - 1)
    const tokenData = this.coreContainer.decodeToken(encryptedToken)
    const user = await this.userEntity.getFull(new ObjectID(tokenData.id))
    if (!user) {
      throw new Error('The has not been found that corresponds to token.')
    }

    // Attaches to all authenticated users the role - Authenticated.
    user.roles!.push(await this.getAuthenticatedRole())

    return new UserPrincipal(user)
  }

}
