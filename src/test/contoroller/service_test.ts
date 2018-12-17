import { bootstrapServer, buildApp } from '../../bootstrap-server'
import { resolveConfig } from '../../bootstrap'
import { CType, EAdminPermission } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import request from 'supertest'
import should from 'should'
import { IUserData, UserEntity } from '../../entity/user'
import { ObjectID } from 'bson'
import { IPermissionData, PermissionEntity } from '../../entity/permission'
import { IRoleData, RoleEntity } from '../../entity/role'
import _ from 'lodash'
import { CoreContainer } from '../../container/core'

describe('Controller Service', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  let userIdA!: ObjectID
  let userIdB!: ObjectID
  let permissionIdA!: ObjectID
  let permissionIdB!: ObjectID
  let permissionIdC!: ObjectID
  let roleIdA!: ObjectID
  let roleIdB!: ObjectID
  let tokenA!: string
  let tokenB!: string

  before(async () => {
    await shellContainer.install()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  before(async () => {
    const permissionA: IPermissionData = {
      name: 'a_perm_name_a',
      title: 'A Permission Title A',
      description: 'The description of the permission.'
    }
    const permissionB: IPermissionData = {
      name: EAdminPermission.FETCH_OWN_ACL,
      title: 'Fetch oen ACL',
      description: 'The descriptsion of the permission.'
    }
    const permissionC: IPermissionData = {
      name: EAdminPermission.FETCH_ANY_ACL,
      title: 'Fetch any ACL',
      description: 'The descriptsion of the permission.'
    }
    permissionIdA = await permissionEntity.create(permissionA)
    permissionIdB = await permissionEntity.create(permissionB)
    permissionIdC = await permissionEntity.create(permissionC)

    const role: IRoleData = {
      name: 'role_name',
      title: 'Role Title',
      description: 'The description of the role.',
      permissionIds: [permissionIdA, permissionIdB, permissionIdC]
    }
    roleIdA = await roleEntity.create(_.clone(role))
    roleIdB = await roleEntity.create({
      ..._.clone(role),
      name: 'role_name_B',
      permissionIds: [permissionIdA]
    })

    const user: IUserData = {
      name: 'user_name',
      password: 'a password',
      roleIds: [roleIdA],
      description: 'The description of the user.'
    }

    // Create.
    userIdA = await userEntity.create({
      ..._.clone(user),
      name: 'user_name_a'
    })
    userIdB = await userEntity.create({
      ..._.clone(user),
      name: 'user_name_b',
      roleIds: [roleIdB]
    })
    tokenA = coreContainer.generateToken({
      id: userIdA.toHexString(),
      iat: Date.now().valueOf()
    })
    tokenB = coreContainer.generateToken({
      id: userIdB.toHexString(),
      iat: Date.now().valueOf()
    })
  })

  describe('Principal', () => {
    it('Anonymous', () => {
      return request(app)
        .get('/service/own-acl')
        .expect(403)
    })

    it('Authenticated without pemission', () => {
      return request(app)
        .get('/service/own-acl')
        .set('Authorization', `bearer ${tokenB}`)
        .expect(403)
    })

    it('Authenticated with permission', async () => {
      const response = await request(app)
        .get('/service/own-acl')
        .set('Authorization', `bearer ${tokenA}`)
        .expect(200)
      const user = response.body
      should(user._id).equal(userIdA.toHexString())
    })
  })

  it('Any ACL', async () => {
    const response = await request(app)
      .get(`/service/acl/${userIdB.toHexString()}`)
      .set('Authorization', `bearer ${tokenA}`)
      .expect(200)
    const user = response.body
    should(user._id).equal(userIdB.toHexString())
  })
})
