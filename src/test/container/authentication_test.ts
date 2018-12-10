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
import { IPermissionData, PermissionEntity } from '../../entity/permission'
import { IRoleData, RoleEntity } from '../../entity/role'
const httpMocks = require('node-mocks-http')

describe('Container Authentication', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const authenticationContainer = container.get<AuthenticationContainer>(CType.Authentication)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
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
    let permissionIdA!: ObjectID
    let permissionIdB!: ObjectID
    let roleId!: ObjectID
    let token!: string

    before(async () => {
      const permissionA: IPermissionData = {
        name: 'a_perm_name_a',
        title: 'A Permission Title A',
        description: 'The description of the permission.'
      }
      const permissionB: IPermissionData = {
        name: 'a_perm_name_b',
        title: 'A Permission Title B',
        description: 'The descriptsion of the permission.'
      }
      permissionIdA = await permissionEntity.create(permissionA)
      permissionIdB = await permissionEntity.create(permissionB)

      const role: IRoleData = {
        name: 'role_name',
        title: 'Role Title',
        description: 'The description of the role.',
        permissionIds: [permissionIdA, permissionIdB]
      }
      roleId = await roleEntity.create(_.clone(role))

      const user: IUserData = {
        name: 'user_name',
        password: 'a password',
        roleIds: [roleId],
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

    it('Principal', async () => {
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
      let hasAccess = await principal.isResourceOwner('a_perm_name_a')
      should(hasAccess).true()
      hasAccess = await principal.isResourceOwner('a_perm_name_c')
      should(hasAccess).false()
    })
  })
})
