import { Validator } from 'jsonschema'

export let validator = new Validator()

export const mongoIdRegStr = '^[a-f\\d]{24}$'

export const schemaRules = {
  simpleString: {
    type: 'string',
    maxLengtth: 255
  },
  mongoId: {
    type: 'string',
    pattern: mongoIdRegStr
  },
  mongoIds: {
    type: 'array',
    items: {
      type: 'string',
      pattern: mongoIdRegStr
    }
  }
}
