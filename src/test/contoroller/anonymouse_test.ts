import { bootstrapServer, buildApp } from '../../bootstrap-server'
import { resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import request from 'supertest'
import should from 'should'
import { IUserData, UserEntity } from '../../entity/user'
import { CoreContainer } from '../../container/core'

describe('Controller Anonymouse', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  let user: IUserData

  before(async () => {
    await shellContainer.install()

    // Create.
    const userId = await userEntity.create({
      name: 'user_name',
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
        .post('/anonymouse/get-token')
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
        .post('/anonymouse/get-token')
        .send({
          name: user.name,
          password: 'a password wrongs'
        })
        .expect(403)
    })
  })
})
