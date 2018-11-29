import { inject, injectable } from 'inversify'
import { CType, IConfig } from '../declaration'

@injectable()
export class CoreContainer {
  constructor (
    @inject(CType.Config)
    private config: IConfig
  ) {}

  test (): string {
    return 'testable'
  }
}
