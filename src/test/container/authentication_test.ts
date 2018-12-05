import { resolveConfig } from '../../bootstrap'
import { CType, ITokenData } from '../../declaration'
import { CoreContainer } from '../../container/core'
import should from 'should'
import { IUserData, UserEntity } from '../../entity/user'
import _ from 'lodash'
import { ShellContainer } from '../../container/shell'
import { AuthenticationContainer } from '../../container/authentication'
import { bootstrapServer } from '../../bootstrap-server'
import { ObjectID } from 'bson'
const httpMocks = require('node-mocks-http')

describe('Container Authentication', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const authenticationContainer = container.get<AuthenticationContainer>(CType.Authentication)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const userEntity = container.get<UserEntity>(CType.Entity.User)

  it('test', () => {
    should(coreContainer.test()).equal('testable')
  })

  before(async () => {
    await shellContainer.install()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  describe('AuthProvider, Principal', () => {
    let userId!: ObjectID
    let token!: string

    before(async () => {
      const user: IUserData = {
        name: 'user_name',
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
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/',
        headers: {
          Authorization: `bearer ${token}`
        }
      })
      const response = httpMocks.createResponse()
      const principal = await authenticationContainer.getUser(request, response)
      const isAuthenticated = await principal.isAuthenticated()
      should(isAuthenticated).true()
    })

    it('Invalid', async () => {
      const tokenData: ITokenData = {
        id: new ObjectID().toHexString(),
        iat: Date.now().valueOf()
      }
      const token = coreContainer.generateToken(tokenData)
      const request = httpMocks.createRequest({
        method: 'GET',
        url: '/',
        headers: {
          Authorization: `bearer ${token}`
        }
      })
      const response = httpMocks.createResponse()
      const principal = await authenticationContainer.getUser(request, response)
      const isAuthenticated = await principal.isAuthenticated()
      should(isAuthenticated).false()
    })
  })
})
