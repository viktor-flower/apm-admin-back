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
  iat?: number
}

export const CType = {
  Config: Symbol.for('Config'),
  Core: Symbol.for('Core'),
  Authentication: Symbol.for('Authentication'),
  Db: Symbol.for('Db'),
  InitialData: Symbol.for('InitialData'),
  Shell: Symbol.for('Shell'),
  Entity: {
    Permission: Symbol.for('Permission'),
    Role: Symbol.for('Role'),
    User: Symbol.for('User')
  },
  Middleware: {
    IsAuthenticated: Symbol.for('IsAuthenticated'),
    IsAnonymouse: Symbol.for('IsAnonymouse'),
    Permission: Symbol.for('MiddlewarePermission')
  }
}

export enum ESystemRole {
  ANONYMOUSE = 'SYSTEM:ANONYMOUSE',
  AUTHENTICATED = 'SYSTEM:AUTHENTICATED',
  ADMINISTER = 'SYSTEM:ADMINISTER'
}

export enum EAdminPermission {
  LOGIN = 'ADMIN:LOGIN',
  ADMIN_SERVICE_ACCESS = 'ADMIN:ADMIN_SERVICE_ACCESS',
  MANAGE_PERMISSIONS = 'ADMIN:MANAGE_PERMISSIONS',
  MANAGE_ROLES = 'ADMIN:MANAGE_ROLES',
  MANAGE_USERS = 'ADMIN:MANAGE_USERS',
  FETCH_OWN_ACL = 'SERVICE:FETCH_OWN_ACL',
  FETCH_ANY_ACL = 'SERVICE:FETCH_ANY_ACL'
}

export const ANONYMOUSE_ROLE = ESystemRole.ANONYMOUSE
export const AUTHENTOCATED_ROLE = ESystemRole.AUTHENTICATED

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
