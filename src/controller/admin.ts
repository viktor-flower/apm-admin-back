import { controller, httpGet, interfaces } from 'inversify-express-utils'

import Controller = interfaces.Controller
import { CType } from '../declaration'
import { inject } from 'inversify'
import { CoreContainer } from '../container/core'

@controller('/admin')
export class AdminController implements Controller {
  constructor (
    @inject(CType.Core)
    private coreContainer: CoreContainer
  ) {}

  @httpGet('/test')
  private test (): string {
    return 'test'
  }
}
