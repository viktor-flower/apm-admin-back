import { Container } from 'inversify'
import { CType, IConfig } from './declaration'
import { bootstrapShell, resolveConfig } from './bootstrap'
import { InversifyExpressServer } from 'inversify-express-utils'
import bodyParser from 'body-parser'
import { Application } from 'express'

// Controllers.
import './controller/admin/permission'
import './controller/admin/role'
import './controller/admin/user'
import './controller/service'
import './controller/anonymouse'

// Middlewares.
import { IsAuthentiticatedMiddleware } from './middleware/is-authenticated'
import { IsAnonymouseMiddleware } from './middleware/is-anonymouse'

// Containers.
import { AuthenticationContainer } from './container/authentication'

export function bootstrapServer (config: IConfig): Container {
  const container = bootstrapShell(config)

  container.bind<AuthenticationContainer>(CType.Authentication).to(AuthenticationContainer).inSingletonScope()
  container.bind<IsAuthentiticatedMiddleware>(CType.Middleware.IsAuthenticated).to(IsAuthentiticatedMiddleware).inSingletonScope()
  container.bind<IsAnonymouseMiddleware>(CType.Middleware.IsAnonymouse).to(IsAnonymouseMiddleware).inSingletonScope()

  return container
}

export function buildApp (container: Container): Application {
  const server = new InversifyExpressServer(container, null, null, null, AuthenticationContainer)
  server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
      extended: true
    }))
    app.use(bodyParser.json())
  })
  return server.build()
}

export function buildListener () {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)

  return () => {
    app.listen(config.server.port, () => {
      console.log(`The server is listening requests on ${config.server.port} port!`)
    })
  }
}
