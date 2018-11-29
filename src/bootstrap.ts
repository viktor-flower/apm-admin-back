import 'reflect-metadata'
import { CType, IConfig } from './declaration'
import { Container } from 'inversify'
import { CoreContainer } from './container/core'
import { ShellContainer } from './container/shell'
import { InitialDataContainer } from './container/initial-data'
import { DbContainer } from './container/db'
import { PermissionEntity } from './entity/permission'
import { RoleEntity } from './entity/role'
import { UserEntity } from './entity/user'

/**
 * Resolves config.
 *
 * @param configFile
 */
export function resolveConfig (configFile: string | null = null): IConfig {
  if (!configFile) {
    if (process.env.configFile) {
      configFile = process.env.configFile
    } else {
      configFile = 'default.js'
    }
  }

  return require(configFile)
}

/**
 * Creates the start point of the application. The first step on the first layer.
 */
export function bootstrapCore (config: IConfig): Container {
  const container = new Container()
  container.bind<IConfig>(CType.Config).toConstantValue(config)
  container.bind<CoreContainer>(CType.Core).to(CoreContainer).inSingletonScope()
  container.bind<DbContainer>(CType.Db).to(DbContainer).inSingletonScope()

  return container
}

/**
 * Creates the top library layer. The application layers are based on.
 */
export function bootstrapShell (config: IConfig): Container {
  const container: Container = bootstrapCore(config)

  container.bind<PermissionEntity>(CType.Entity.Permission).to(PermissionEntity).inSingletonScope()
  container.bind<RoleEntity>(CType.Entity.Role).to(RoleEntity).inSingletonScope()
  container.bind<UserEntity>(CType.Entity.User).to(UserEntity).inSingletonScope()
  container.bind<ShellContainer>(CType.Shell).to(ShellContainer).inSingletonScope()
  container.bind<InitialDataContainer>(CType.InitialData).to(InitialDataContainer).inSingletonScope()

  return container
}
