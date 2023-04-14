#!/usr/bin/env node

import Client from './client'
import { parseCommandLine } from './cmd'

async function runClient ({ source, target }: { source: string, target: string }): Promise<void> {
  if (typeof source !== 'string' || source.length === 0) {
    source = await Client.createChannel()
  }
  const client = new Client({ source, target })
  client.start()
}

let args
try {
  args = parseCommandLine(process.argv)
} catch (err) {
  process.exit(1)
}
void runClient(args)
