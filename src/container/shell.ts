import { inject, injectable } from 'inversify'
import { CType, IDisposable, IInstallable } from '../declaration'
import { DbContainer } from './db'
import { PermissionEntity } from '../entity/permission'
import { RoleEntity } from '../entity/role'
import { UserEntity } from '../entity/user'

@injectable()
export class ShellContainer implements IInstallable, IDisposable {
  constructor (
    @inject(CType.Db)
    private dbContainer: DbContainer,
    @inject(CType.Entity.Permission)
    private permissionEntity: PermissionEntity,
    @inject(CType.Entity.Role)
    private roleEntity: RoleEntity,
    @inject(CType.Entity.User)
    private userEntity: UserEntity
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
    await this.roleEntity.install()
  }

  async uninstall () {
    // Entity.
    await this.permissionEntity.uninstall()
    await this.roleEntity.uninstall()
  }

}
