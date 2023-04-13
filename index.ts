import validator from 'validator'
import EventSource from 'eventsource'
import superagent from 'superagent'
import url from 'url'
import querystring from 'querystring'

type Severity = 'info' | 'error'

interface Options {
  source: string
  target: string
  logger?: Pick<Console, Severity>
}

class Client {
  source: string
  target: string
  logger: Pick<Console, Severity>
  events!: EventSource

  constructor ({ source, target, logger = console }: Options) {
    this.source = source
    this.target = target
    this.logger = logger

    if (!validator.isURL(this.source)) {
      throw new Error(`The provided source URL, '${this.source}', is invalid.`)
    }

    if (!validator.isURL(this.target)) {
      throw new Error(`The provided target URL, '${this.target}', is invalid.`)
    }

    if (this.logger === undefined) {
      throw new Error('A logger must be provided.')
    }
  }

  static async createChannel (): Promise<string> {
    return await superagent.head('https://smee.io/new').redirects(0).catch((err) => {
      return err.response.headers.location
    })
  }

  onmessage (msg: any): void {
    const data = JSON.parse(msg.data)

    const target = new url.URL(this.target)
    const mergedQuery = Object.assign(target, data.query)
    target.search = querystring.stringify(mergedQuery)

    delete data.query

    // Remove the host header, leaving it causes issues with SNI and TLS verification
    delete data.host

    const req = superagent.post(url.format(target)).send(data.body)

    delete data.body

    Object.keys(data).forEach(key => {
      void req.set(key, data[key])
    })

    req.end((err, res) => {
      if (typeof err === 'string' && err.length !== 0) {
        this.logger.error(err)
      } else {
        this.logger.info(`${req.method} ${req.url} - ${res.status}`)
      }
    })
  }

  onopen (): void {
    this.logger.info('Connected', this.events.url)
  }

  onerror (err: any): void {
    this.logger.error(err)
  }

  start (): EventSource {
    const events = new EventSource(this.source);

    // Reconnect immediately
    (events as any).reconnectInterval = 0 // This isn't a valid property of EventSource

    events.addEventListener('message', this.onmessage.bind(this))
    events.addEventListener('open', this.onopen.bind(this))
    events.addEventListener('error', this.onerror.bind(this))

    this.logger.info(`Forwarding ${this.source} to ${this.target}`)
    this.events = events

    return events
  }
}

export = Client
