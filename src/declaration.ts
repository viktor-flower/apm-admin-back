export type IDynamicConfig = {
  stub: string
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
    stub: string;
  }
}

export const CType = {
  Config: Symbol.for('Config'),
  Core: Symbol.for('Core')
}
