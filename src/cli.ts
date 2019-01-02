import { bootstrapShell, resolveConfig } from './bootstrap'
import { build } from 'inversify-commander-utils'
import commander from 'commander'
import './cli'

const config = resolveConfig()
const container = bootstrapShell(config)
build(commander, container)

commander.parse(process.argv)
