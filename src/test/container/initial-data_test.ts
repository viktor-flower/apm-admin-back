import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import should = require('should')
import { InitialDataContainer } from '../../container/initial-data'
import { UserEntity } from '../../entity/user'
import { ShellContainer } from '../../container/shell'

describe('Container InitialData', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const initialDataContainer = container.get<InitialDataContainer>(CType.InitialData)
  const userEntity = container.get<UserEntity>(CType.Entity.User)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  before(async () => {
    await shellContainer.install()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  it('Upload Initial Data', async () => {
    await initialDataContainer.uploadInitialData()
    const users = await userEntity.list()
    should(users.length).above(0)
  })
})
