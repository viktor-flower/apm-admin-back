import should from 'should'
import { UserEntity } from '../../entity/user'
import { CType } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import { resolveConfig } from '../../bootstrap'
import { bootstrapServer, buildApp } from '../../bootstrap-server'
import { CoreContainer } from '../../container/core'
import { cleanUpMetadata, controller, httpGet, interfaces } from 'inversify-express-utils'
import Controller = interfaces.Controller
import request from 'supertest'
import { Application } from 'express'
import { RoleEntity } from '../../entity/role'
import { PermissionEntity } from '../../entity/permission'
import { permissionMiddleware } from '../../middleware/permission'

describe('Middleware Permission', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  let app!: Application
  const coreContainer = container.get<CoreContainer>(CType.Core)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  let tokenAB!: string
  let tokenCD!: string

  before(async () => {
    await shellContainer.install()
  })

  before(() => {
    cleanUpMetadata()
    @controller('/test', permissionMiddleware('perm_a'))
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
    const permIdA = await permissionEntity.create({ name: 'perm_a', title: 'Perm A' })
    const permIdB = await permissionEntity.create({ name: 'perm_b', title: 'Perm B' })
    const permIdC = await permissionEntity.create({ name: 'perm_c', title: 'Perm C' })
    const permIdD = await permissionEntity.create({ name: 'perm_d', title: 'Perm D' })
    const roleIdA = await roleEntity.create({
      name: 'role_name_a',
      title: 'Role Title A',
      description: 'The description of the role.',
      permissionIds: [permIdA, permIdB]
    })
    const roleIdB = await roleEntity.create({
      name: 'perm_name_b',
      title: 'Role Title B',
      description: 'The descriptsion of the role.',
      permissionIds: [permIdC, permIdD]
    })
    const userIdAB = await userEntity.create({
      name: 'user_name_ab',
      password: 'a password',
      description: 'The description of the user.',
      roleIds: [roleIdA, roleIdB]
    })
    const userIdCD = await userEntity.create({
      name: 'user_name_cd',
      password: 'a password',
      description: 'The description of the user.'
    })
    tokenAB = coreContainer.generateToken({
      id: userIdAB.toHexString(),
      iat: Date.now().valueOf()
    })
    tokenCD = coreContainer.generateToken({
      id: userIdCD.toHexString(),
      iat: Date.now().valueOf()
    })
  })

  it('Valid', async () => {

    const response = await request(app)
      .get('/test/test')
      .set('Authorization', `bearer ${tokenAB}`)
      .expect(200)
    should(response.text).equal('test')
  })

  it('Invalid', async () => {
    await request(app)
      .get('/test/test')
      .set('Authorization', `bearer ${tokenCD}`)
      .expect(403)
  })
})
