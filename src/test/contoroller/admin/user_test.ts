import { bootstrapServer, buildApp } from '../../../bootstrap-server'
import { resolveConfig } from '../../../bootstrap'
import { CType } from '../../../declaration'
import { ShellContainer } from '../../../container/shell'
import request from 'supertest'
import should from 'should'
import { IUserData, UserEntity } from '../../../entity/user'
import _ from 'lodash'
import { ObjectID } from 'bson'
import { CoreContainer } from '../../../container/core'

describe('Controller Admin user', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  before(async () => {
    await shellContainer.install()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  describe('CRUD user', () => {
    let userId: ObjectID

    before(async () => {
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
    })

    it('Create', async () => {
      const userData: IUserData = {
        name: 'test_user_name',
        password: 'a password',
        description: 'The description of the user.',
        roleIds: []
      }
      const response = await request(app)
        .post('/admin/user/create')
        .send({ user: userData })
        .expect(200)
      should(response.body['_id']).not.undefined()
      userId = new ObjectID(response.body['_id'])
      const user = await userEntity.get(userId)
      should(user._id!.equals(userId)).true()
    })

    it('Get', async () => {
      const response = await request(app)
        .get(`/admin/user/item/${userId.toHexString()}`)
        .expect(200)
      should(response.body['user']['_id']).equal(userId.toHexString())
    })

    it('Update', async () => {
      const user = await userEntity.get(userId)
      user.name = 'updated'
      const response = await request(app)
        .post(`/admin/user/save`)
        .send({ user })
        .expect(200)
      const loadedUser = await userEntity.get(userId)
      should(user.name).equal(loadedUser.name)
    })

    it('Set password', async () => {
      const password = 'some new password'
      const response = await request(app)
        .post(`/admin/user/set-password`)
        .send({ _id: userId, password })
        .expect(200)
      should(response.body.success).true()
      const loadedUser = await userEntity.get(userId)
      const valid = coreContainer.validateHash(password, loadedUser.password)
      should(valid).equal(true)
    })

    it('Delete', async () => {
      const user = await userEntity.get(userId)
      user.name = 'updated'
      const response = await request(app)
        .get(`/admin/user/delete/${userId.toHexString()}`)
        .expect(200)
      should(response.body['success']).true()
      const loadedUser = await userEntity.get(userId)
      should(!!loadedUser).is.false()
    })

  })
})
