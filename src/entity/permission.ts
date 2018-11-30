import { inject, injectable } from 'inversify'
import { CType, IConfig, IInstallable, IPostDeleteBuilder } from '../declaration'
import { DbContainer } from '../container/db'
import { ObjectID } from 'bson'
import { DeleteWriteOpResultObject, UpdateWriteOpResult } from 'mongodb'
import * as _ from 'lodash'
import { validator, schemaRules } from '../validator'

export interface IPermissionData {
  _id?: ObjectID
  name: string
  title: string
  description: string
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

  public async delete (_id: ObjectID): Promise<DeleteWriteOpResultObject> {
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).deleteOne({ _id })

    return Promise.all(this.postDeletePB.map((builder) => builder(_id)))
      .then(() => result)
  }

  public async save (post: IPermissionData): Promise<UpdateWriteOpResult> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateOne({ _id: post._id }, { $set: post })
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
