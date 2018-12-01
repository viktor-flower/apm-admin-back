import { bootstrapCore, resolveConfig } from '../../bootstrap'
import { CType, ITokenData } from '../../declaration'
import { CoreContainer } from '../../container/core'
import should from 'should'

describe('Container Core', () => {
  const config = resolveConfig()
  const container = bootstrapCore(config)
  const coreContainer = container.get<CoreContainer>(CType.Core)

  it('test', () => {
    should(coreContainer.test()).equal('testable')
  })

  it('Generate/validate hash', () => {
    const word = 'adminPassword'
    const hash = coreContainer.generateHash(word)
    const isCorresponded = coreContainer.validateHash(word, hash)
    should(isCorresponded).is.true()
  })

  it('Generate/decode token', () => {
    const tokenData: ITokenData = {
      id: '+id+'
    }
    const token = coreContainer.generateToken(tokenData)
    const decodedData = coreContainer.decodeToken(token)
    should(tokenData.id).equal(decodedData.id)
  })

})
