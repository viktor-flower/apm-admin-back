import { Container } from 'inversify'
import { CType, IConfig } from './declaration'
import { bootstrapShell, resolveConfig } from './bootstrap'
import { InversifyExpressServer } from 'inversify-express-utils'
import bodyParser from 'body-parser'
import { Application } from 'express'

// Registers controllers.
import './controller/admin'
import './controller/service'
import './controller/anonymouse'
import { IsAuthentiticatedMiddleware } from './middleware/is-authenticated'
import { IsAnonymouseMiddleware } from './middleware/is-anonymouse'
import { AuthenticationContainer } from './container/authentication'

export function bootstrapServer (config: IConfig): Container {
  const container = bootstrapShell(config)

  container.bind<AuthenticationContainer>(CType.Authentication).to(AuthenticationContainer).inSingletonScope()
  container.bind<IsAuthentiticatedMiddleware>(CType.Middleware.IsAuthenticated).to(IsAuthentiticatedMiddleware).inSingletonScope()
  container.bind<IsAnonymouseMiddleware>(CType.Middleware.IsAnonymouse).to(IsAnonymouseMiddleware).inSingletonScope()

  return container
}

// export function tokenProcessor (key: string) {
//   return (request: IAppRequest, response: express.Response, next: Function): void => {
//     if (!request.context) {
//       request.context = new AppContext(request, response);
//     }
//     let Key = key.charAt(0).toUpperCase() + key.slice(1);
//     let str: string = request.get(`${Key}Authorization`);
//     if (!!str) {
//       let authorizationType = str.substr(0, 6);
//       let encryptedToken: string = '';
//       if (authorizationType == 'bearer') {
//         encryptedToken = str.substr(7, str.length - 1);
//         request.context.encryptedToken = encryptedToken;
//         request.context[`${key}TokenData`] = this.coreContainer.decodeToken(encryptedToken);
//       }
//     }
//     next()
//   }
// }

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
