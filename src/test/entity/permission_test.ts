import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { ShellContainer } from '../../container/shell'
import { CType } from '../../declaration'
import { IPermissionData, PermissionEntity } from '../../entity/permission'
import should from 'should'
import _ from 'lodash'

describe('Permission model', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    const permission: IPermissionData = {
      name: 'perm_name',
      title: 'Permission Title',
      description: 'The description of the permission.'
    }

    // Create.
    await permissionEntity.create(_.clone(permission))
    await permissionEntity.create(_.clone(permission))
    await permissionEntity.create(_.clone(permission))
    const permissionId = await permissionEntity.create(permission)
    should(permissionId.toHexString().length).above(1)

    // Get.
    const retrievedPermission = await permissionEntity.get(permissionId)
    should(retrievedPermission._id!.toHexString()).equal(permissionId.toHexString())
    should(permission.name).equal(retrievedPermission.name)

    // Save.
    permission.name = 'updated'
    await permissionEntity.save(permission)
    const updatedRPermission = await permissionEntity.get(permissionId)
    should(updatedRPermission.name).equal(permission.name)

    // Delete.
    await permissionEntity.delete(permissionId)
    const nullPermission = await permissionEntity.get(permissionId)
    should(nullPermission).is.null()

    // List.
    const permissions = await permissionEntity.list()
    should(permissions.length).above(0)
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})
