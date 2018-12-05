import { bootstrapServer, buildApp } from '../../../bootstrap-server'
import { resolveConfig } from '../../../bootstrap'
import { CType } from '../../../declaration'
import { ShellContainer } from '../../../container/shell'
import request from 'supertest'
import should from 'should'
import { IPermissionData, PermissionEntity } from '../../../entity/permission'
import _ from 'lodash'
import { ObjectID } from 'bson'

describe('Controller Admin permission', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const permissionEntity = container.get<PermissionEntity>(CType.Entity.Permission)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  before(async () => {
    await shellContainer.install()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  describe('CRUD permission', () => {
    let permissionId: ObjectID

    before(async () => {
      const permission: IPermissionData = {
        name: 'permission_name',
        title: 'Permission Title',
        description: 'The description of the permission.'
      }

      // Create.
      await permissionEntity.create({
        ..._.clone(permission),
        name: 'permission_name_a'
      })
      await permissionEntity.create({
        ..._.clone(permission),
        name: 'permission_name_b'
      })
      await permissionEntity.create({
        ..._.clone(permission),
        name: 'permission_name_c'
      })
    })

    it('Create', async () => {
      const permissionData: IPermissionData = {
        name: 'test_permission_name',
        title: 'Permission Title',
        description: 'The description of the permission.'
      }
      const response = await request(app)
        .post('/admin/permission/create')
        .send({ permission: permissionData })
        .expect(200)
      should(response.body['_id']).not.undefined()
      permissionId = new ObjectID(response.body['_id'])
      const permission = await permissionEntity.get(permissionId)
      should(permission._id!.equals(permissionId)).true()
    })

    it('Get', async () => {
      const response = await request(app)
        .get(`/admin/permission/item/${permissionId.toHexString()}`)
        .expect(200)
      should(response.body['permission']['_id']).equal(permissionId.toHexString())
    })

    it('Update', async () => {
      const permission = await permissionEntity.get(permissionId)
      permission.name = 'updated'
      const response = await request(app)
        .post(`/admin/permission/save`)
        .send({ permission })
        .expect(200)
      const loadedPermission = await permissionEntity.get(permissionId)
      should(permission.name).equal(loadedPermission.name)
    })

    it('Delete', async () => {
      const permission = await permissionEntity.get(permissionId)
      permission.name = 'updated'
      const response = await request(app)
        .get(`/admin/permission/delete/${permissionId.toHexString()}`)
        .expect(200)
      should(response.body['success']).true()
      const loadedPermission = await permissionEntity.get(permissionId)
      should(loadedPermission).is.null()
    })

  })
})
