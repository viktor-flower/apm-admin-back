import { bootstrapShell, resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import should = require('should')

describe('Container Shell', () => {
  const config = resolveConfig()
  const container = bootstrapShell(config)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  it('test', () => {
    should(shellContainer.test()).equal('testable')
  })
})
