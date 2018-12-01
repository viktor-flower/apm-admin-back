import { ObjectID } from 'bson'

export type IDynamicConfig = {
  stub: string
}

export type IConfig = {
  secret: string,
  server: {
    port: number
  },
  db: {
    name: string,
    port: number,
    host: string
  },
  dynamicConfig: IDynamicConfig,
  client: {
    stub: string;
  }
}

export interface ITokenData {
  id: string
  iat?: string
}

export const CType = {
  Config: Symbol.for('Config'),
  Core: Symbol.for('Core'),
  Db: Symbol.for('Db'),
  InitialData: Symbol.for('InitialData'),
  Shell: Symbol.for('Shell'),
  Entity: {
    Permission: Symbol.for('Permission'),
    Role: Symbol.for('Role'),
    User: Symbol.for('User')
  }
}

export interface IPostDeleteBuilder {
  (result: ObjectID): void
}

export interface IInstallable {
  install (): Promise<void>,

  uninstall (): Promise<void>
}

export interface IDisposable {
  dispose (): Promise<void>
}

export interface IEntityManager {
}
