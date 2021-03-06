import { inject, injectable } from 'inversify'
import { CType, EAdminPermission, IConfig, IInstallable, IPostDeleteBuilder } from '../declaration'
import { DbContainer } from '../container/db'
import { ObjectID } from 'bson'
import { UpdateWriteOpResult } from 'mongodb'
import * as _ from 'lodash'
import { validator, schemaRules } from '../validator'

export interface IPermissionData {
  _id?: ObjectID
  name: string | EAdminPermission
  title: string,
  system?: boolean
  description?: string
}

export const PermissionDataSchema = {
  type: 'object',
  properties: {
    _id: schemaRules.mongoId,
    name: schemaRules.simpleString,
    title: schemaRules.simpleString,
    description: schemaRules.simpleString
  },
  required: ['name', 'title']
}

@injectable()
export class PermissionEntity implements IInstallable {
  private collectionName = 'permission'
  private postDeletePB: IPostDeleteBuilder[] = []

  @inject(CType.Config)
  protected config!: IConfig
  @inject(CType.Db)
  protected dbContainer!: DbContainer

  public async create (permission: IPermissionData): Promise<ObjectID> {
    const res = validator.validate(permission, PermissionDataSchema)
    if (!res.valid) throw new Error(_.invokeMap(res.errors, 'toString').join(' '))
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).insertOne(permission)

    return result.insertedId
  }

  public registerPostDeleteBuilder (builder: IPostDeleteBuilder) {
    this.postDeletePB.push(builder)
  }

  public async get (_id: ObjectID): Promise<IPermissionData> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).findOne({ _id })
  }

  public async delete (_id: ObjectID): Promise<boolean> {
    const permission = await this.get(_id)
    if (permission.system) {
      throw new Error('System permission can not be deleted.')
    }
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).deleteOne({ _id })

    return Promise.all(this.postDeletePB.map((builder) => builder(_id)))
      .then(() => !!result.deletedCount && result.deletedCount > 0)
  }

  public async save (updatedPermission: IPermissionData): Promise<UpdateWriteOpResult> {
    const permission = await this.get(updatedPermission._id as ObjectID)
    if (permission.system) {
      throw new Error('System permission can not be edited.')
    }
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateOne({ _id: updatedPermission._id }, { $set: updatedPermission })
  }

  public async list (): Promise<IPermissionData[]> {
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
