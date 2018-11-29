import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { ShellContainer } from '../../container/shell'
import { CType } from '../../declaration'
import { IUserData, UserEntity } from '../../entity/user'
import should from 'should'
import _ from 'lodash'

describe('User model', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const UserEntity = container.get<UserEntity>(CType.Entity.User)

  before(async () => {
    await shellContainer.install()
  })

  it('Create/get/update/delete', async () => {
    let user: IUserData = {
      name: 'perm_name',
      title: 'User Title',
      description: 'The description of the user.'
    }

    // Create.
    await UserEntity.create(_.clone(user))
    await UserEntity.create(_.clone(user))
    await UserEntity.create(_.clone(user))
    let userId = await UserEntity.create(user)
    should(userId.toHexString().length).above(1)

    // Get.
    let retrievedUser = await UserEntity.get(userId)
    should(retrievedUser._id!.toHexString()).equal(userId.toHexString())
    should(user.name).equal(retrievedUser.name)

    // Save.
    user.name = 'updated'
    await UserEntity.save(user)
    let updatedRUser = await UserEntity.get(userId)
    should(updatedRUser.name).equal(user.name)

    // Delete.
    await UserEntity.delete(userId)
    let nullUser = await UserEntity.get(userId)
    should(nullUser).is.null()

    // List.
    let users = await UserEntity.list()
    should(users.length).above(0)
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })
})
