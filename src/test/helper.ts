import { PermissionEntity } from '../entity/permission'
import { CType, EAdminPermission } from '../declaration'
import { RoleEntity } from '../entity/role'
import { UserEntity } from '../entity/user'
import { CoreContainer } from '../container/core'
import { Container } from 'inversify'

export async function createUserWithPermissions (container: Container, permissionNames: string[]): Promise<string> {
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const coreContainer = container.get<CoreContainer>(CType.Core)

  const permIds = await Promise.all(permissionNames.map(async (permissionName) => {
    return permissionEntity.create({
      name: permissionName,
      title: 'Permission Title'
    })
  }))
  const roleId = await roleEntity.create({
    name: 'role_name_' + Date.now().valueOf(),
    title: 'Role Title',
    description: 'The description of the role.',
    permissionIds: permIds
  })
  const adminId = await userEntity.create({
    name: 'user_name_' + Date.now().valueOf(),
    password: 'a password',
    description: 'The description of the user.',
    roleIds: [roleId]
  })
  const token = coreContainer.generateToken({
    id: adminId.toHexString(),
    iat: Date.now().valueOf()
  })

  return token
}
