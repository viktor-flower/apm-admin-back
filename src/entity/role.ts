import { inject, injectable } from 'inversify'
import { CType, IConfig, IInstallable, IPostDeleteBuilder } from '../declaration'
import { DbContainer } from '../container/db'
import { ObjectID } from 'bson'
import { UpdateWriteOpResult } from 'mongodb'
import * as _ from 'lodash'
import { validator, schemaRules } from '../validator'
import { IPermissionData, PermissionEntity } from './permission'

export interface IRoleData {
  _id?: ObjectID
  name: string
  title: string
  description?: string
  system?: boolean
  permissionIds?: ObjectID[] | string[],
  permissions?: IPermissionData[]
}

export const RoleDataSchema = {
  type: 'object',
  properties: {
    _id: schemaRules.mongoId,
    name: schemaRules.simpleString,
    title: schemaRules.simpleString,
    description: schemaRules.simpleString,
    permissionIds: schemaRules.MongoIds
  },
  required: ['name', 'title', 'permissionIds']
}

@injectable()
export class RoleEntity implements IInstallable {
  private collectionName = 'role'
  private postDeletePB: IPostDeleteBuilder[] = []

  constructor (
    @inject(CType.Config)
    private config: IConfig,
    @inject(CType.Db)
    private dbContainer: DbContainer,
    @inject(CType.Entity.Permission)
    private permissionEntity: PermissionEntity
  ) {
    this.permissionEntity.registerPostDeleteBuilder(async (_id) => {
      await this.clearPermissionId(_id)
    })
  }

  public registerPostDeleteBuilder (builder: IPostDeleteBuilder) {
    this.postDeletePB.push(builder)
  }

  public async clearPermissionId (_id: ObjectID) {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateMany({ }, { $pull: { permissionIds: _id } })
  }

  public async create (role: IRoleData): Promise<ObjectID> {
    const res = validator.validate(role, RoleDataSchema)
    if (!res.valid) throw new Error(_.invokeMap(res.errors, 'toString').join(' '))
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).insertOne(role)

    return result.insertedId
  }

  public async get (_id: ObjectID): Promise<IRoleData> {
    const db = await this.dbContainer.getDb()

    const query = [
      {
        $match: { _id }
      },
      {
        $unwind: {
          path: '$permissionIds',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          localField: 'permissionIds',
          from: 'permission',
          foreignField: '_id',
          as: 'permissions'
        }
      },
      {
        $unwind: {
          path: '$permissions',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          title: { $first: '$title' },
          system: { $first: '$system' },
          permissions: { $push: '$permissions' },
          permissionIds: { $push: '$permissionIds' }
        }
      }
    ]
    const list = await db.collection(this.collectionName).aggregate(query).toArray()

    return list[0] as IRoleData
  }

  public async delete (_id: ObjectID): Promise<boolean> {
    const role = await this.get(_id)
    if (role.system) {
      throw new Error('System role can not be deleted.')
    }
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).deleteOne({ _id })

    return Promise.all(this.postDeletePB.map((builder) => builder(_id)))
      .then(() => !!result.deletedCount && result.deletedCount > 0)
  }

  public async save (updatedRole: IRoleData): Promise<UpdateWriteOpResult> {
    const role = await this.get(updatedRole._id as ObjectID)
    if (role.system) {
      throw new Error('System role can not be edited.')
    }
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateOne({ _id: updatedRole._id }, { $set: updatedRole })
  }

  public async list (): Promise<IRoleData[]> {
    const db = await this.dbContainer.getDb()
    const query = [
      {
        $unwind: {
          path: '$permissionIds',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          localField: 'permissionIds',
          from: 'permission',
          foreignField: '_id',
          as: 'permissions'
        }
      },
      {
        $unwind: {
          path: '$permissions',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          title: { $first: '$title' },
          system: { $first: '$system' },
          permissions: { $push: '$permission' }
        }
      },
      {
        $project: {
          permissionIds: 0
        }
      }
    ]

    return db.collection(this.collectionName).aggregate(query).toArray()
  }

  async install (): Promise<void> {
    const db = await this.dbContainer.getDb()
    await db.createCollection(this.collectionName)
  }

  async uninstall (): Promise<void> {
    const db = await this.dbContainer.getDb()
    await db.dropCollection(this.collectionName)
  }
}
