import { validator, schemaRules } from '../validator'
import should from 'should'
import { ObjectID } from 'mongodb'

export const dataSchema = {
  type: 'object',
  properties: {
    name: schemaRules.simpleString,
    title: schemaRules.simpleString,
    id: {
      type: 'object',
      instanceOf: ObjectID
    }
  },
  required: ['name', 'title']
}

describe('Validator', () => {
  describe('InstanceOf property', () => {
    it('Wrong', () => {
      const wrongData = {
        name: 'Name',
        title: 'Title',
        id: 'simple string'
      }
      const res = validator.validate(wrongData, dataSchema)
      should(res.valid).false()
    })

    it('Right', () => {
      const rightData = {
        name: 'Name',
        title: 'Title',
        id: new ObjectID()
      }
      const res = validator.validate(rightData, dataSchema)
      should(res.valid).true()
    })
  })
})
