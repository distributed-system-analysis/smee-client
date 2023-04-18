import validator from 'validator'
import EventSource from 'eventsource'
import request from 'superagent'
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
  }

  static async createChannel (): Promise<string> {
    return await request.head('https://smee.io/new').redirects(0).catch((err) => {
      return err.response.headers.location
    })
  }

  onmessage (msg: any): void {
    // Capture the current time stamp before doing anything else
    let ts = new Date()

    let data: any
    try {
      data = JSON.parse(msg.data)
    } catch (err) {
      this.logger.error(ts, 'ERROR: bad msg', err, msg)
      return
    }

    // Remove the body from the data object so it won't get copied among all the
    // other keys below.
    const body = data.body
    delete data.body

    // To help understand the behavior of the client, we pull out the various
    // GitHub headers to provide the same information displayed on the GitHub
    // Webhooks page for a configured web-hook.
    const delivery: string = data['x-github-delivery']
    const event: string = data['x-github-event']
    let action: string

    if (body.action === undefined) {
      let payload: any
      try {
        payload = JSON.parse(body.payload)
      } catch (err) {
        this.logger.error(ts, 'ERROR: bad payload', err, 'body: ', body)
        return
      }
      action = payload.action
    } else {
      action = body.action
    }
    this.logger.info(ts, `${delivery} ${event}.${action} -- Received`)

    // Construct the new target URL with merged query parameters.
    const target = new url.URL(this.target)
    const mergedQuery = Object.assign(target, data.query)
    target.search = querystring.stringify(mergedQuery)
    delete data.query

    // Remove the host header, leaving it causes issues with SNI and TLS
    // verification.
    delete data.host

    const req = request.post(url.format(target))
    ts = new Date()
    this.logger.info(
      ts, `${delivery} ${event}.${action} -- Forwarding ${req.method} ${req.url}`
    )

    Object.keys(data).forEach(key => {
      void req.set(key, data[key])
    })

    req.send(body)
      .then((res) => {
        ts = new Date()
        this.logger.info(ts, `${delivery} ${event}.${action} -- SUCCESS: ${req.method} ${req.url} - ${res.status}`)
      })
      .catch((err) => {
        ts = new Date()
        this.logger.error(ts, `${delivery} ${event}.${action} -- ERROR: ${req.method} ${req.url}`, err)
      })
  }

  onopen (): void {
    this.logger.info('Connected', this.source)
  }

  onerror (err: any): void {
    this.logger.error(`Failed to connect to ${this.source}`, err)
  }

  start (): EventSource {
    const events = new EventSource(this.source)

    if (events.url !== this.source) {
      this.logger.error(
        `The event source object is using the wrong URL: using ${events.url}, expected ${this.source}`
      )
      process.exit(1)
    }

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
