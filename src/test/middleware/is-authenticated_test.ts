import should from 'should'
import { ObjectID } from 'bson'
import { IUserData, UserEntity } from '../../entity/user'
import _ from 'lodash'
import { CType, ITokenData } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import { resolveConfig } from '../../bootstrap'
import { bootstrapServer, buildApp } from '../../bootstrap-server'
import { CoreContainer } from '../../container/core'
import { cleanUpMetadata, controller, httpGet, interfaces } from 'inversify-express-utils'
import Controller = interfaces.Controller
import request from 'supertest'
import { Application } from 'express'

describe('Middleware IsAuthenticated', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  let app!: Application
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  let userId!: ObjectID
  let token!: string

  before(async () => {
    await shellContainer.install()
  })

  before(() => {
    cleanUpMetadata()
    @controller('/test', CType.Middleware.IsAuthenticated)
    class TTestController implements Controller {
      @httpGet('/test')
      private test (): string {
        return 'test'
      }
    }
    app = buildApp(container)
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
    cleanUpMetadata()
  })

  before(async () => {
    const user: IUserData = {
      name: 'user_name',
      title: 'User Title',
      password: 'a password',
      description: 'The description of the user.'
    }

    // Create.
    userId = await userEntity.create({
      ..._.clone(user),
      name: 'user_name_a'
    })
    const tokenData: ITokenData = {
      id: userId.toHexString(),
      iat: Date.now().valueOf()
    }
    token = coreContainer.generateToken(tokenData)
  })

  it('Valid', async () => {

    const response = await request(app)
      .get('/test/test')
      .set('Authorization', `bearer ${token}`)
      .expect(200)
    should(response.text).equal('test')
  })

  it('Invalid', async () => {
    await request(app)
      .get('/test/test')
      .expect(403)
  })
})
