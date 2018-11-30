import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { ShellContainer } from '../../container/shell'
import { CType } from '../../declaration'
import { IRoleData, RoleEntity } from '../../entity/role'
import should from 'should'
import _ from 'lodash'
import { ObjectID } from 'bson'
import { IPermissionData, PermissionEntity } from '../../entity/permission'

describe('Role model', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    const role: IRoleData = {
      name: 'perm_name',
      title: 'Role Title',
      description: 'The description of the role.'
    }

    // Create.
    await roleEntity.create(_.clone(role))
    await roleEntity.create(_.clone(role))
    await roleEntity.create(_.clone(role))
    const roleId = await roleEntity.create(role)
    should(roleId.toHexString().length).above(1)

    // Get.
    const retrievedRole = await roleEntity.get(roleId)
    should((retrievedRole._id as ObjectID)!.toHexString()).equal(roleId.toHexString())
    should(role.name).equal(retrievedRole.name)

    // Save.
    role.name = 'updated'
    await roleEntity.save(role)
    const updatedRRole = await roleEntity.get(roleId)
    should(updatedRRole.name).equal(role.name)

    // Delete.
    await roleEntity.delete(roleId)
    const nullRole = await roleEntity.get(roleId)
    should(nullRole).is.null()

    // The delete event has been fired. @todo

    // List.
    const roles = await roleEntity.list()
    should(roles.length).above(0)
  })

  it('Permission relation', async () => {
    const permissionA: IPermissionData = {
      name: 'perm_name_a',
      title: 'Permission Title A',
      description: 'The description of the permission.'
    }
    const permissionB: IPermissionData = {
      name: 'perm_name_b',
      title: 'Permission Title B',
      description: 'The descriptsion of the permission.'
    }
    const permissionIdA = await permissionEntity.create(permissionA)
    const permissionIdB = await permissionEntity.create(permissionB)
    const role: IRoleData = {
      name: 'perm_name',
      title: 'Role Title*',
      description: 'The description of the role.',
      permissionIds: [permissionIdA, permissionIdB]
    }
    const roleId = await roleEntity.create(role)
    let loadedRole = await roleEntity.get(roleId)
    let foundPermission = (loadedRole.permissionIds as ObjectID[])!.find((_id) => permissionIdA.equals(_id))
    should(foundPermission).not.null()

    // Deletes a permission.
    await permissionEntity.delete(permissionIdA)
    loadedRole = await roleEntity.get(roleId)
    foundPermission = (loadedRole.permissionIds! as ObjectID[]).find((_id) => permissionIdA.equals(_id))
    should(foundPermission).undefined()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})
