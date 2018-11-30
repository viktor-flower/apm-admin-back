import { CType, IConfig, IInstallable } from '../declaration'
import { inject, injectable } from 'inversify'
import { DbContainer } from '../container/db'
import { ObjectID } from 'bson'
import { DeleteWriteOpResultObject, UpdateWriteOpResult } from 'mongodb'
import * as _ from 'lodash'
import { validator, schemaRules } from '../validator'
import { RoleEntity } from './role'

export interface IUserData {
  _id?: ObjectID
  name: string
  title: string
  description: string
  roleIds?: ObjectID[] | string[]
}

export const UserDataSchema = {
  type: 'object',
  properties: {
    _id: schemaRules.mongoId,
    name: schemaRules.simpleString,
    title: schemaRules.simpleString,
    description: schemaRules.simpleString,
    roleIds: schemaRules.MongoIds
  },
  required: ['name', 'title']
}

@injectable()
export class UserEntity implements IInstallable {
  private collectionName = 'user'

  constructor (
    @inject(CType.Config)
    protected config: IConfig,
    @inject(CType.Db)
    protected dbContainer: DbContainer,
    @inject(CType.Entity.Role)
    protected roleEntity: RoleEntity
  ) {
    this.roleEntity.registerPostDeleteBuilder(async (_id) => {
      await this.clearRoleId(_id)
    })
  }

  public async clearRoleId (_id: ObjectID) {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateMany({ }, { $pull: { roleIds: _id } })
  }

  public async create (user: IUserData): Promise<ObjectID> {
    const res = validator.validate(user, UserDataSchema)
    if (!res.valid) throw new Error(_.invokeMap(res.errors, 'toString').join(' '))
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).insertOne(user)

    return result.insertedId
  }

  public async get (_id: ObjectID): Promise<IUserData> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).findOne({ _id })
  }

  public async delete (_id: ObjectID): Promise<DeleteWriteOpResultObject> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).deleteOne({ _id })
  }

  public async save (post: IUserData): Promise<UpdateWriteOpResult> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateOne({ _id: post._id }, { $set: post })
  }

  public async list (): Promise<IUserData[]> {
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
