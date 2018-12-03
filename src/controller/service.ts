import { controller, httpGet, interfaces } from 'inversify-express-utils'

import Controller = interfaces.Controller

@controller('/service')
export class ServiceController implements Controller {
  constructor (
  ) {}

  @httpGet('/test')
  private test (): string {
    return 'test'
  }
}
