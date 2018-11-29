import { inject, injectable } from 'inversify'
import { CType, IDisposable, IInstallable } from '../declaration'
import { DbContainer } from './db'
import { PermissionEntity } from '../entity/permission'

@injectable()
export class ShellContainer implements IInstallable, IDisposable {
  constructor (
    @inject(CType.Db)
    private dbContainer: DbContainer,
    @inject(CType.Entity.Permission)
    private permissionEntity: PermissionEntity
  ) {}

  test () {
    return 'testable'
  }

  async dispose (): Promise<void> {
    await this.dbContainer.dispose()
  }

  async install (): Promise<void> {
    // Entity.
    await this.permissionEntity.install()
  }

  async uninstall () {
    // Entity.
    await this.permissionEntity.uninstall()
  }

}
