import { inject, injectable } from 'inversify'
import { CType, IConfig, ITokenData } from '../declaration'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

@injectable()
export class CoreContainer {
  constructor (
    @inject(CType.Config)
    private config: IConfig
  ) {}

  test (): string {
    return 'testable'
  }

  generateHash (word: string): string {
    return bcrypt.hashSync(word, bcrypt.genSaltSync(8))
  }

  validateHash (word: string, hash: string): boolean {
    return bcrypt.compareSync(word, hash)
  }

  generateToken (data: ITokenData): string {
    return jwt.sign(data, this.config.secret)
  }

  decodeToken (token: string): ITokenData {
    return jwt.verify(token, this.config.secret) as ITokenData
  }
}
