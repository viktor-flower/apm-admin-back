import { bootstrapServer, buildApp } from '../../bootstrap-server'
import { resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import request from 'supertest'
import should from 'should'
import {IUserData, UserEntity} from '../../entity/user'
import _ from 'lodash'
import {CoreContainer} from '../../container/core'

describe('Controller Admin', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  let user: IUserData

  before(async () => {
    await shellContainer.install()

    // Create.
    const userId = await userEntity.create({
      name: 'user_name',
      title: 'User Title',
      password: 'a password',
      description: 'The description of the user.'
    })
    user = await userEntity.get(userId)
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  describe('Action get-token', () => {
    it('Right', async () => {
      const response = await request(app)
        .post('/admin/get-token')
        .send({
          name: user.name,
          password: 'a password'
        })
        .expect(200)
      const { token } = response.body
      const tokenData = coreContainer.decodeToken(token)
      should(tokenData.id).equal(user._id!.toHexString())
    })

    it('Wrong', async () => {
      const response = await request(app)
        .post('/admin/get-token')
        .send({
          name: user.name,
          password: 'a password wrongs'
        })
        .expect(403)
    })
  })

  it('Action test', async () => {
    const response = await request(app)
      .get('/admin/test')
      .expect(200)
    should(response.text).equal('test')
  })
})
