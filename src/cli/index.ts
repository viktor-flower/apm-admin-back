import { inject } from 'inversify'
import { controller, action } from 'inversify-commander-utils'
import { CType } from '../declaration'
import { InitialDataContainer } from '../container/initial-data'
import { ShellContainer } from '../container/shell'

@controller()
class DefaultCliController {

  @inject(CType.Shell)
  shellContainer!: ShellContainer
  @inject(CType.InitialData)
  initialDataContainer!: InitialDataContainer

  @action('initial-data')
  async initialData () {
    await this.initialDataContainer.uploadInitialData()
    await this.shellContainer.dispose()
  }

  @action('uninstall')
  async uninstall () {
    await this.shellContainer.uninstall()
    await this.shellContainer.dispose()
  }
}
