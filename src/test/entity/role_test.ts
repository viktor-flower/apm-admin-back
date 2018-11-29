import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { ShellContainer } from '../../container/shell'
import { CType } from '../../declaration'
import { IRoleData, RoleEntity } from '../../entity/role'
import should from 'should'
import _ from 'lodash'
import { ObjectID } from 'bson'

describe('Role model', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const RoleEntity = container.get<RoleEntity>(CType.Entity.Role)

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    let role: IRoleData = {
      name: 'perm_name',
      title: 'Role Title',
      description: 'The description of the role.'
    }

    // Create.
    await RoleEntity.create(_.clone(role))
    await RoleEntity.create(_.clone(role))
    await RoleEntity.create(_.clone(role))
    let roleId = await RoleEntity.create(role)
    should(roleId.toHexString().length).above(1)

    // Get.
    let retrievedRole = await RoleEntity.get(roleId)
    should((retrievedRole._id as ObjectID)!.toHexString()).equal(roleId.toHexString())
    should(role.name).equal(retrievedRole.name)

    // Save.
    role.name = 'updated'
    await RoleEntity.save(role)
    let updatedRRole = await RoleEntity.get(roleId)
    should(updatedRRole.name).equal(role.name)

    // Delete.
    await RoleEntity.delete(roleId)
    let nullRole = await RoleEntity.get(roleId)
    should(nullRole).is.null()

    // List.
    let roles = await RoleEntity.list()
    should(roles.length).above(0)
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})
