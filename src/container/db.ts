import { inject, injectable } from 'inversify'
import { CType, IConfig } from '../declaration'
import { Db, MongoClient } from 'mongodb'

@injectable()
export class DbContainer {
  private db!: Db
  private client!: MongoClient

  constructor (
    @inject(CType.Config)
    private config: IConfig
  ) {}

  async getClient (): Promise<MongoClient> {
    if (this.client) {
      return Promise.resolve(this.client)
    }
    const client = await MongoClient.connect(
      `mongodb://${this.config.db.host}:${this.config.db.port}`,
      {
        useNewUrlParser: true,
        bufferMaxEntries: 0
      }
    )

    return this.client = client
  }

  async getDb (): Promise<Db> {
    if (this.db) {
      return Promise.resolve(this.db)
    }

    let dbConf = this.config.db
    let client: MongoClient = await this.getClient()
    return this.db = client.db(dbConf.name)
  }

  async dispose (): Promise<void> {
    return (await this.getClient()).close()
  }

  test (): string {
    return 'testable'
  }
}
