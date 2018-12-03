import { bootstrapServer, buildApp } from '../../bootstrap-server'
import { resolveConfig } from '../../bootstrap'
import { CType } from '../../declaration'
import { ShellContainer } from '../../container/shell'
import request from 'supertest'
import should from 'should'

describe('Controller Admin', () => {
  const config = resolveConfig()
  const container = bootstrapServer(config)
  const app = buildApp(container)
  const shellContainer = container.get<ShellContainer>(CType.Shell)

  before(async () => {
    await shellContainer.install()
  })

  after(async () => {
    await shellContainer.uninstall()
    await shellContainer.dispose()
  })

  it('Action test', async () => {
    const response = await request(app)
      .get('/admin/test')
      .expect(200)
    should(response.text).equal('test')
  })
})
