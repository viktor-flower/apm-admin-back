import { controller, httpGet, interfaces } from 'inversify-express-utils'

import Controller = interfaces.Controller

@controller('/service')
export class ServiceController implements Controller {

  @httpGet('/test')
  private test (): string {
    return 'test'
  }
}
