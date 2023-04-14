import { Command } from 'commander'
import { VERSION } from './version'

export function parseCommandLine (argv: string[]): { source: string, target: string } {
  const program = new Command()

  program
    .exitOverride()
    .version(VERSION, '-v, --version')
    .usage('[options]')
    .option('-u, --url <url>', 'URL of the webhook proxy service. Default: https://smee.io/new')
    .option('-t, --target <target>', 'Full URL (including protocol and path) of the target service to which the events will forwarded; --port and --path ignored when specified. Default: http://127.0.0.1:3000/')
    .option('-p, --port <n>', 'Local HTTP server port', process.env.PORT ?? '3000')
    .option('-P, --path <path>', 'URL path to post proxied requests to`', '/')
    .parse(argv)

  const options = program.opts()

  let target
  if (typeof options.target === 'string' && options.target.length !== 0) {
    target = options.target
  } else {
    const port: string = options.port
    const path: string = options.path
    target = `http://127.0.0.1:${port}${path}`
  }

  return {
    source: options.url,
    target
  }
}
