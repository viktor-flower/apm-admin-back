import { Validator, SchemaError, Schema, Options, SchemaContext, CustomProperty, ValidatorResult } from 'jsonschema'
import { ObjectID } from 'mongodb'

export let validator = new Validator()

export interface IInstanceOfSchema extends Schema {
  instanceOf: any
}

validator.attributes.instanceOf = (instance: any, schema: Schema, options: Options, ctx: SchemaContext): string | ValidatorResult => {
  if (!instance || schema.type !== 'object' || !(schema as IInstanceOfSchema).instanceOf) {
    return ''
  }

  const correspondTo = instance instanceof (schema as IInstanceOfSchema).instanceOf
  if (!correspondTo) {
    return `Instance type does not corespond to ${(schema as IInstanceOfSchema).instanceOf}`
  }

  return ''
}

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
  MongoId: {
    type: 'object',
    instanceOf: ObjectID
  },
  mongoIds: {
    type: 'array',
    items: {
      type: 'string',
      pattern: mongoIdRegStr
    }
  },
  MongoIds: {
    type: 'array',
    items: {
      type: 'object',
      instanceOf: ObjectID
    }
  }
}
