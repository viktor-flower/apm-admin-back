import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { ShellContainer } from '../../container/shell'
import { CType } from '../../declaration'
import { IUserData, UserEntity } from '../../entity/user'
import should from 'should'
import _ from 'lodash'
import { IPermissionData } from '../../entity/permission'
import { IRoleData, RoleEntity } from '../../entity/role'
import { ObjectID } from 'bson'

describe('User model', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const userEntity = container.get<UserEntity>(CType.Entity.User)

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    const user: IUserData = {
      name: 'perm_name',
      title: 'User Title',
      description: 'The description of the user.'
    }

    // Create.
    await userEntity.create(_.clone(user))
    await userEntity.create(_.clone(user))
    await userEntity.create(_.clone(user))
    const userId = await userEntity.create(user)
    should(userId.toHexString().length).above(1)

    // Get.
    const retrievedUser = await userEntity.get(userId)
    should(retrievedUser._id!.toHexString()).equal(userId.toHexString())
    should(user.name).equal(retrievedUser.name)

    // Save.
    user.name = 'updated'
    await userEntity.save(user)
    const updatedRUser = await userEntity.get(userId)
    should(updatedRUser.name).equal(user.name)

    // Delete.
    await userEntity.delete(userId)
    const nullUser = await userEntity.get(userId)
    should(nullUser).is.null()

    // List.
    const users = await userEntity.list()
    should(users.length).above(0)
  })

  it('Role relation', async () => {
    const roleA: IRoleData = {
      name: 'role_name_a',
      title: 'Role Title A',
      description: 'The description of the role.'
    }
    const roleB: IRoleData = {
      name: 'perm_name_b',
      title: 'Role Title B',
      description: 'The descriptsion of the role.'
    }
    const roleIdA = await roleEntity.create(roleA)
    const roleIdB = await roleEntity.create(roleB)
    const user: IUserData = {
      name: 'user_name',
      title: 'User Title*',
      description: 'The description of the user.',
      roleIds: [roleIdA, roleIdB]
    }
    const userId = await userEntity.create(user)
    let loadedUser = await userEntity.get(userId)
    let foundUser = (loadedUser.roleIds! as ObjectID[]).find((_id) => roleIdA.equals(_id))
    should(foundUser).not.null()

    // Deletes a role.
    await roleEntity.delete(roleIdA)
    loadedUser = await userEntity.get(userId)
    foundUser = (loadedUser.roleIds! as ObjectID[]).find((_id) => roleIdA.equals(_id))
    should(foundUser).undefined()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})