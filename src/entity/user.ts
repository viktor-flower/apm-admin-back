import { CType, IConfig, IInstallable } from '../declaration'
import { inject, injectable } from 'inversify'
import { DbContainer } from '../container/db'
import { ObjectID } from 'bson'
import { UpdateWriteOpResult } from 'mongodb'
import * as _ from 'lodash'
import { validator, schemaRules } from '../validator'
import { RoleEntity } from './role'
import { CoreContainer } from '../container/core'

export interface IUserData {
  _id?: ObjectID
  name: string,
  password: string,
  description: string
  roleIds?: ObjectID[] | string[]
}

export const UserDataSchema = {
  type: 'object',
  properties: {
    _id: schemaRules.mongoId,
    name: schemaRules.simpleString,
    password: schemaRules.simpleString,
    description: schemaRules.simpleString,
    roleIds: schemaRules.MongoIds
  },
  required: ['name']
}

@injectable()
export class UserEntity implements IInstallable {
  private collectionName = 'user'

  constructor (
    @inject(CType.Config)
    protected config: IConfig,
    @inject(CType.Core)
    protected coreContainer: CoreContainer,
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
    user.password = this.coreContainer.generateHash(user.password)
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).insertOne(user)

    return result.insertedId
  }

  public async getFull (_id: ObjectID): Promise<any> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).aggregate([
      {
        $match: { _id }
      },
      {
        $unwind: '$roleIds'
      },
      {
        $lookup: {
          localField: 'roleIds',
          from: 'role',
          foreignField: '_id',
          as: 'role'
        }
      },
      {
        $unwind: {
          path: '$role',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          localField: 'role.permissionIds',
          from: 'permission',
          foreignField: '_id',
          as: 'role.permissions'
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          roles: { $push: '$role' }
        }
      },
      {
        $project: {
          'roles.permissionIds': 0
        }
      }
    ])
      .toArray()
  }

  public async get (_id: ObjectID): Promise<IUserData> {
    const db = await this.dbContainer.getDb()

    const array = await db.collection(this.collectionName).aggregate<IUserData>([
      {
        $match: { _id }
      },
      {
        $unwind: {
          path: '$roleIds',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          localField: 'roleIds',
          from: 'role',
          foreignField: '_id',
          as: 'roles'
        }
      },
      {
        $unwind: {
          path: '$roles',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          description: { $first: '$description' },
          roles: { $push: '$roles' },
          roleIds: { $push: '$roleIds' }
        }
      }
    ])
      .toArray()

    return array[0]
  }

  public async getByName (name: string): Promise<IUserData> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).findOne({ name })
  }

  public async delete (_id: ObjectID): Promise<boolean> {
    const db = await this.dbContainer.getDb()
    const result = await db.collection(this.collectionName).deleteOne({ _id })

    return !!result.deletedCount && result.deletedCount > 0
  }

  public async save (user: IUserData): Promise<UpdateWriteOpResult> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).updateOne({ _id: user._id }, { $set: user })
  }

  public async generateToken (name: string, password: string): Promise<string> {
    const user = await this.getByName(name)
    if (!user) {
      return ''
    }
    const isValid: boolean = this.coreContainer.validateHash(password, user.password)
    if (isValid) {
      return this.coreContainer.generateToken({ id: user!._id!.toString(), iat: (Date.now().valueOf() / 1000) })
    } else {
      return ''
    }
  }

  public async list (): Promise<IUserData[]> {
    const db = await this.dbContainer.getDb()

    return db.collection(this.collectionName).aggregate([
      {
        $sort: { date: -1 }
      },
      {
        $project: { password: 0 }
      },
      {
        $lookup: {
          localField: 'roleIds',
          from: 'role',
          foreignField: '_id',
          as: 'roles'
        }
      },
      {
        $project: {
          roleIds: 0
        }
      }
    ]).toArray()
  }

  async install (): Promise<void> {
    const db = await this.dbContainer.getDb()
    await db.createCollection(this.collectionName)
    await db.collection(this.collectionName).createIndex({ name: 1 }, { unique: true })
  }

  async uninstall (): Promise<void> {
    const db = await this.dbContainer.getDb()
    await db.dropCollection(this.collectionName)
  }
}
