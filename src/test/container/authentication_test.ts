import { resolveConfig } from '../../bootstrap'
import { ANONYMOUSE_ROLE, AUTHENTOCATED_ROLE, CType, ITokenData } from '../../declaration'
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

  let authenticatedPermissionId!: ObjectID
  let anonymousePermissionId!: ObjectID
  let authenticatedRoleId!: ObjectID
  let anonymouseRoleId!: ObjectID

  it('test', () => {
    should(coreContainer.test()).equal('testable')
  })

  before(async () => {
    await shellContainer.install()
  })

  before(async () => {
    anonymousePermissionId = await permissionEntity.create({
      name: 'anonymouse_permission',
      title: 'Anonymouse permission.',
      description: 'The descriptsion of the permission.'
    })
    anonymouseRoleId = await roleEntity.create({
      name: ANONYMOUSE_ROLE,
      title: 'Anonymouse role',
      system: true,
      description: 'The description of the role.',
      permissionIds: [ anonymousePermissionId ]
    })
    authenticatedPermissionId = await permissionEntity.create({
      name: 'authenticated_permission',
      title: 'Authenticated permission.',
      description: 'The descriptsion of the permission.'
    })
    authenticatedRoleId = await roleEntity.create({
      name: AUTHENTOCATED_ROLE,
      title: 'Authenticated role',
      system: true,
      description: 'The description of the role.',
      permissionIds: [ authenticatedPermissionId ]
    })
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
      roleId = await roleEntity.create({ ...role })

      const user: IUserData = {
        name: 'user_name',
        password: 'a password',
        roleIds: [roleId],
        description: 'The description of the user.'
      }

      // Create.
      userId = await userEntity.create({
        ...user,
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
      let errorInvoked = false
      try {
        await authenticationContainer.getUser(request, response)
      } catch (e) {
        errorInvoked = true
        should(e.message).equal('The has not been found that corresponds to token.')
      }
      should(errorInvoked).true()
    })

    describe('Prinicipal', () => {
      it('Authenticated', async () => {
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
        let hasAccess = await principal.isResourceOwner('a_perm_name_a')
        should(hasAccess).true()
        hasAccess = await principal.isResourceOwner('a_perm_name_c')
        should(hasAccess).false()

        // Checks that it contains a permission from Authenticated role.
        hasAccess = await principal.isResourceOwner('authenticated_permission')
        should(hasAccess).true()
      })

      it('Anonymouse', async () => {
        const request = httpMocks.createRequest({
          method: 'GET',
          url: '/'
        })
        const response = httpMocks.createResponse()
        const principal = await authenticationContainer.getUser(request, response)
        const isAuthenticated = await principal.isAuthenticated()
        should(isAuthenticated).false()
        let hasAccess = await principal.isResourceOwner('a_perm_name_a')
        should(hasAccess).false()
        hasAccess = await principal.isResourceOwner('anonymouse_permission')
        should(hasAccess).true()
      })
    })
  })
})
