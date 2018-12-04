import { controller, httpGet, interfaces } from 'inversify-express-utils'

import Controller = interfaces.Controller
import { CType } from '../declaration'

@controller('/anonymouse', CType.Middleware.IsAnonymouse)
export class AnonymouseController implements Controller {

  @httpGet('/test')
  private test (): string {
    return 'test'
  }
}
