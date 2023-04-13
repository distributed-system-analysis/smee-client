#!/usr/bin/env node

const { Command } = require('commander')
const { version } = require('../package.json')
const Client = require('../client.js')

function parseCommandLine (argv) {
  const program = new Command()

  program
    .version(version, '-v, --version')
    .usage('[options]')
    .option('-u, --url <url>', 'URL of the webhook proxy service. Default: https://smee.io/new')
    .option('-t, --target <target>', 'Full URL (including protocol and path) of the target service the events will forwarded to. Default: http://127.0.0.1:PORT/PATH')
    .option('-p, --port <n>', 'Local HTTP server port', process.env.PORT || 3000)
    .option('-P, --path <path>', 'URL path to post proxied requests to`', '/')
    .parse(argv)

  const options = program.opts()

  let target
  if (options.target) {
    target = options.target
  } else {
    target = `http://127.0.0.1:${options.port}${options.path}`
  }

  return {
    source: options.url,
    target
  }
}

async function runClient ({ source, target }) {
  if (!source) {
    source = await Client.createChannel()
  }

  const client = new Client({ source, target })
  client.start()
}

const args = parseCommandLine(process.argv)
runClient(args)
