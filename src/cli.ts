import commander from 'commander'
import {bootstrapShell, resolveConfig} from './bootstrap'
import {CType} from './declaration'
import {InitialDataContainer} from './container/initial-data'
import {ShellContainer} from './container/shell'

commander
  .command('initial-data')
  .action(async () => {
    const config = resolveConfig()
    const container = bootstrapShell(config)
    const shellContainer = container.get<ShellContainer>(CType.Shell)
    const initialDataContainer = container.get<InitialDataContainer>(CType.InitialData)
    await initialDataContainer.uploadInitialData()
    await shellContainer.dispose()
  })

commander
  .command('uninstall')
  .action(async () => {
    const config = resolveConfig()
    const container = bootstrapShell(config)
    const shellContainer = container.get<ShellContainer>(CType.Shell)
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

commander.parse(process.argv)
