import 'reflect-metadata'
import { CType, IConfig } from './declaration'
import { Container } from 'inversify'
import { CoreContainer } from './container/core'

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
  let container = new Container()
  container.bind<IConfig>(CType.Config).toConstantValue(config)
  container.bind<CoreContainer>(CType.Core).to(CoreContainer).inSingletonScope()
    // container.bind<DbContainer>(CType.Db).to(DbContainer).inSingletonScope()
    // container.bind<KeyObjDbContainer>(CType.KeyObjDb).to(KeyObjDbContainer).inSingletonScope()
    // container.bind<DynamicConfigMemento>(CType.Memento.DynamicConfig).to(DynamicConfigMemento).inSingletonScope()

  return container
}
