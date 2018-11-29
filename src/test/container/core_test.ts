import { bootstrapCore, resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import { CoreContainer } from '../../container/core'
import should = require('should')

describe('Container Core', () => {
  const config = resolveConfig()
  const container = bootstrapCore(config)
  const coreContainer = container.get<CoreContainer>(CType.Core)

  it('test', () => {
    should(coreContainer.test()).equal('testable')
  })
})
