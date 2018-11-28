export type IDynamicConfig = {
  adminPassword: string
}

export type IConfig = {
  secret: string,
  server: {
    port: number
  },
  db: {
    name: string,
    port: number,
    host: string
  },
  dynamicConfig: IDynamicConfig,
  client: {
    defaultLanguage: string;
  }
}

export const CType = {
  Config: Symbol.for('Config')
}
