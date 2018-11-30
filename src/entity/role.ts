import { inject, injectable } from 'inversify'
import { CType, IConfig, IInstallable, IPostDeleteBuilder } from '../declaration'
import { DbContainer } from '../container/db'
import { ObjectID } from 'bson'
import { DeleteWriteOpResultObject, UpdateWriteOpResult } from 'mongodb'
import * as _ from 'lodash'
import { validator, schemaRules } from '../validator'
import { PermissionEntity } from './permission'

export interface IRoleData {
  _id?: ObjectID | string
  name: string
  title: string
  description?: string
  permissionIds?: ObjectID[] | string[]
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
  required: ['name', 'title']
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

    return db.collection(this.collectionName).findOne({ _id })
  }

  public async delete (_id: ObjectID): Promise<DeleteWriteOpResultObject> {
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).deleteOne({ _id })

    return Promise.all(this.postDeletePB.map((builder) => builder(_id)))
      .then(() => result)
  }

  public async save (post: IRoleData): Promise<UpdateWriteOpResult> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateOne({ _id: post._id }, { $set: post })
  }

  public async list (): Promise<IRoleData[]> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).aggregate([
      {
        $sort: { date: -1 }
      }
    ]).toArray()
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