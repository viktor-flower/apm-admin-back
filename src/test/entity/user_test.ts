import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { ShellContainer } from '../../container/shell'
import { CType } from '../../declaration'
import { IUserData, UserEntity } from '../../entity/user'
import should from 'should'
import _ from 'lodash'
import { IRoleData, RoleEntity } from '../../entity/role'
import { ObjectID } from 'bson'
import { CoreContainer } from '../../container/core'
import { IPermissionData, PermissionEntity } from '../../entity/permission'

describe('User model', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)

  let userId: ObjectID

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    const user: IUserData = {
      name: 'user_name',
      password: 'a password',
      description: 'The description of the user.'
    }

    // Create.
    await userEntity.create({
      ..._.clone(user),
      name: 'user_name_a'
    })
    await userEntity.create({
      ..._.clone(user),
      name: 'user_name_b'
    })
    await userEntity.create({
      ..._.clone(user),
      name: 'user_name_c'
    })
    const userId = await userEntity.create(_.clone(user))
    should(userId.toHexString().length).above(1)

    // Get.
    const retrievedUser = await userEntity.get(userId)
    should(retrievedUser._id!.toHexString()).equal(userId.toHexString())
    should(user.name).equal(retrievedUser.name)

    // Save.
    retrievedUser.name = 'updated'
    retrievedUser.password = 'updated'
    await userEntity.save(_.clone(retrievedUser))
    let updatedRUser = await userEntity.get(userId)
    should(updatedRUser.name).equal(retrievedUser.name)

    // Password has to be changed by another method.
    should(updatedRUser.password).not.equal(retrievedUser.password)

    // Sets password.
    await userEntity.setPassword(retrievedUser!._id as ObjectID, 'new password')
    updatedRUser = await userEntity.get(userId)
    const valid = coreContainer.validateHash('new password', updatedRUser.password as string)
    should(valid).equal(true)

    // Delete.
    await userEntity.delete(userId)
    const nullUser = await userEntity.get(userId)
    should(!!nullUser).false()

    // List.
    const users = await userEntity.list()
    should(users.length).above(0)

    // The password field is filtered.
    should(!!users[0].password).false()
  })

  it('Token validation', async () => {
    const user: IUserData = {
      name: 'user_test',
      password: 'testPassword',
      description: 'The description of the user.'
    }
    const userId = await userEntity.create(user)
    const token = await userEntity.generateToken('user_test', 'testPassword')
    should(token.length).above(0)
    const tokenData = coreContainer.decodeToken(token)
    should(userId.toHexString()).equal(tokenData.id)
  })

  it('Role relation', async () => {
    const permIdA = await permissionEntity.create({ name: 'perm_a', title: 'Perm A' })
    const permIdB = await permissionEntity.create({ name: 'perm_b', title: 'Perm B' })
    const permIdC = await permissionEntity.create({ name: 'perm_c', title: 'Perm C' })
    const permIdD = await permissionEntity.create({ name: 'perm_d', title: 'Perm D' })
    const roleA: IRoleData = {
      name: 'role_name_a',
      title: 'Role Title A',
      description: 'The description of the role.',
      permissionIds: [permIdA, permIdB]
    }
    const roleB: IRoleData = {
      name: 'perm_name_b',
      title: 'Role Title B',
      description: 'The descriptsion of the role.',
      permissionIds: [permIdC, permIdD]
    }
    const roleIdA = await roleEntity.create(roleA)
    const roleIdB = await roleEntity.create(roleB)
    const user: IUserData = {
      name: 'user_name',
      password: 'a password',
      description: 'The description of the user.',
      roleIds: [roleIdA, roleIdB]
    }
    userId = await userEntity.create(user)

    // Get full
    const data = await userEntity.getFull(userId)
    const _roleB = data.roles!.find((r: any) => roleIdB.equals(r._id))
    const _permD = _roleB!.permissions!.find((p: any) => permIdD.equals(p._id))
    should(_permD!._id!.equals(permIdD))

    let loadedUser = await userEntity.get(userId)
    let foundUser = (loadedUser.roleIds! as ObjectID[]).find((_id) => roleIdA.equals(_id))
    should(foundUser).not.null()

    // Deletes a role.
    await roleEntity.delete(roleIdA)
    loadedUser = await userEntity.get(userId)
    foundUser = (loadedUser.roleIds! as ObjectID[]).find((_id) => roleIdA.equals(_id))
    should(!!foundUser).false()
  })

  it('getFull', async () => {
    const user = await userEntity.getFull(userId)
    should(!!user).true()
  })

  describe('System', () => {
    const userData: IUserData = {
      name: 'user_system_name',
      system: true,
      description: 'The description of the user.',
      roleIds: []
    }
    let userId: ObjectID

    before(async () => {
      userId = await userEntity.create(_.clone(userData))
    })

    it('Save', async () => {
      let errorInvoked = false
      const loadedUser = await userEntity.get(userId)
      loadedUser.description += 'changed.'
      try {
        await userEntity.save(loadedUser)
      } catch (e) {
        errorInvoked = true
      }
      should(errorInvoked).true()
    })

    it('Delete', async () => {
      let errorInvoked = false
      try {
        await permissionEntity.delete(userId)
      } catch (e) {
        errorInvoked = true
      }
      should(errorInvoked).true()
    })

  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})
