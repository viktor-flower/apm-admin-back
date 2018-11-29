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
  const PermissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    let permission: IPermissionData = {
      name: 'perm_name',
      title: 'Permission Title',
      description: 'The description of the permission.'
    }

    // Create.
    await PermissionEntity.create(_.clone(permission))
    await PermissionEntity.create(_.clone(permission))
    await PermissionEntity.create(_.clone(permission))
    let permissionId = await PermissionEntity.create(permission)
    should(permissionId.toHexString().length).above(1)

    // Get.
    let retrievedPermission = await PermissionEntity.get(permissionId)
    should(retrievedPermission._id!.toHexString()).equal(permissionId.toHexString())
    should(permission.name).equal(retrievedPermission.name)

    // Save.
    permission.name = 'updated'
    await PermissionEntity.save(permission)
    let updatedRPermission = await PermissionEntity.get(permissionId)
    should(updatedRPermission.name).equal(permission.name)

    // Delete.
    await PermissionEntity.delete(permissionId)
    let nullPermission = await PermissionEntity.get(permissionId)
    should(nullPermission).is.null()

    // List.
    let permissions = await PermissionEntity.list()
    should(permissions.length).above(0)
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})
