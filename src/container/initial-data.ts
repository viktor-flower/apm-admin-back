import { injectable } from 'inversify'

@injectable()
export class InitialDataContainer {
  test (): string {
    return 'testable'
  }
}
