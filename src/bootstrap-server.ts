import { Container } from 'inversify'
import { IConfig } from './declaration'
import { bootstrapShell, resolveConfig } from './bootstrap'
import './controller/admin'
import { InversifyExpressServer } from 'inversify-express-utils'
import bodyParser from 'body-parser'
import { Application } from 'express'

export function bootstrapServer (config: IConfig): Container {
  const container: Container = bootstrapShell(config)

  return container
}

export function buildApp (container: Container): Application {
  const server = new InversifyExpressServer(container)
  server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
      extended: true
    }))
    app.use(bodyParser.json())
  })
  const app = server.build()

  return app
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
