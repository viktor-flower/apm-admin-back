import { inject, injectable } from 'inversify'
import { data } from '../initial-data'
import { CType } from '../declaration'
import { UserEntity } from '../entity/user'
import { PermissionEntity } from '../entity/permission'
import { RoleEntity } from '../entity/role'
import { ShellContainer } from './shell'

@injectable()
export class InitialDataContainer {
  @inject(CType.Entity.Permission)
  private permissionEntity!: PermissionEntity
  @inject(CType.Entity.Role)
  private roleEntity!: RoleEntity
  @inject(CType.Entity.User)
  private userEntity!: UserEntity
  @inject(CType.Shell)
  private shellContainer!: ShellContainer

  async uploadInitialData () {
    await this.shellContainer.install()
    await Promise.all(data.permisions.map(async (permission: any) => {
      delete permission._id
      return {
        ...permission,
        _id: await this.permissionEntity.create(permission)
      }
    }))
    await Promise.all(data.roles.map(async (role: any) => {
      delete role._id
      role.permissionIds = role.permissionNames.map((name: string) => {
        return data.permisions.find((permission: any) => permission.name === name)!._id
      })
      return {
        ...role,
        _id: await this.roleEntity.create(role)
      }
    }))
    await Promise.all(data.users.map(async (user: any) => {
      delete user._id
      user.roleIds = user.roleNames
        .map((name: string) => {
          return data.roles.find((role: any) => role.name === name)!._id
        })

      return {
        ...user,
        _id: await this.userEntity.create(user)
      }
    }))
  }
}
