import { bootstrapCore, resolveConfig } from '../../bootstrap'
import { DbContainer } from '../../container/db'
import { CType } from '../../declaration'
import { Db } from 'mongodb'
import should from 'should'

describe('Db container', () => {
  const config = resolveConfig()
  const container = bootstrapCore(config)
  const dbContainer = container.get<DbContainer>(CType.Db)

  it('Db', async () => {
    const db = await dbContainer.getDb()
    should(db).not.null()
    await dbContainer.dispose()
  })
})
