import { bootstrapServer, buildApp } from '../../../bootstrap-server'
import { resolveConfig } from '../../../bootstrap'
import { CType, EAdminPermission } from '../../../declaration'
import { ShellContainer } from '../../../container/shell'
import request from 'supertest'
import should from 'should'
import { IRoleData, RoleEntity } from '../../../entity/role'
import _ from 'lodash'
import { ObjectID } from 'bson'
import { createUserWithPermissions } from '../../helper'

describe('Controller Admin role', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const roleEntity = container.get<RoleEntity>(CType.Entity.Role)
  const shellContainer = container.get<ShellContainer>(CType.Shell)
  let token: string

  before(async () => {
    await shellContainer.install()
    token = await createUserWithPermissions(container, [EAdminPermission.MANAGE_ROLES])
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  describe('CRUD role', () => {
    let roleId: ObjectID

    before(async () => {
      const role: IRoleData = {
        name: 'role_name',
        title: 'Role Title',
        description: 'The description of the role.',
        permissionIds: []
      }

      // Create.
      await roleEntity.create({
        ..._.clone(role),
        name: 'role_name_a'
      })
      await roleEntity.create({
        ..._.clone(role),
        name: 'role_name_b'
      })
      await roleEntity.create({
        ..._.clone(role),
        name: 'role_name_c'
      })
    })

    it('Create', async () => {
      const roleData: IRoleData = {
        name: 'test_role_name',
        title: 'Role Title',
        description: 'The description of the role.',
        permissionIds: []
      }
      const response = await request(app)
        .post('/admin/role/create')
        .set('Authorization', `bearer ${token}`)
        .send({ role: roleData })
        .expect(200)
      should(response.body['_id']).not.undefined()
      roleId = new ObjectID(response.body['_id'])
      const role = await roleEntity.get(roleId)
      should(role._id!.equals(roleId)).true()
    })

    it('Get', async () => {
      const response = await request(app)
        .get(`/admin/role/item/${roleId.toHexString()}`)
        .set('Authorization', `bearer ${token}`)
        .expect(200)
      should(response.body['role']['_id']).equal(roleId.toHexString())
    })

    it('Update', async () => {
      const role = await roleEntity.get(roleId)
      role.name = 'updated'
      const response = await request(app)
        .post(`/admin/role/save`)
        .set('Authorization', `bearer ${token}`)
        .send({ role })
        .expect(200)
      const loadedRole = await roleEntity.get(roleId)
      should(role.name).equal(loadedRole.name)
    })

    it('Delete', async () => {
      const role = await roleEntity.get(roleId)
      role.name = 'updated'
      const response = await request(app)
        .get(`/admin/role/delete/${roleId.toHexString()}`)
        .set('Authorization', `bearer ${token}`)
        .expect(200)
      should(response.body['success']).true()
      const loadedRole = await roleEntity.get(roleId)
      should(loadedRole).is.undefined()
    })

  })
})
