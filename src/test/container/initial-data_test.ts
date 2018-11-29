import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import should = require('should')
import { InitialDataContainer } from '../../container/initial-data'

describe('Container InitialData', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const initialDataContainer = container.get<InitialDataContainer>(CType.InitialData)

  it('test', () => {
    should(initialDataContainer.test()).equal('testable')
  })
})
