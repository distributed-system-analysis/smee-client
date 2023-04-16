import Client = require('./client')
import nock = require('nock')
import EventSource from 'eventsource'
import flushPromises = require('flush-promises')

jest.mock('eventsource', () => {
  return jest.fn().mockImplementation((urlArg) => {
    return {
      addEventListener: jest.fn(),
      url: urlArg
    }
  })
})

describe('Client', () => {
  test('verify Client constructor behaviors', () => {
    let src: string = 'http://this.example.com/'
    let tgt: string = 'http://that.example.com'
    let opts = { source: src, target: tgt }

    const client = new Client(opts)

    expect(client.source).toBe(src)
    expect(client.target).toBe(tgt)

    src = 'bad src url'
    opts = { source: src, target: tgt }

    expect(() => new Client(opts)).toThrow()

    src = 'http://good.example.com'
    tgt = 'bad tgt url'
    opts = { source: src, target: tgt }

    expect(() => new Client(opts)).toThrow()
  })

  test('verify .start() method behaviors', () => {
    const src: string = 'http://src.example.com/'
    const tgt: string = 'http://tgt.example.com'
    const opts = { source: src, target: tgt }

    const client = new Client(opts)
    client.start()

    expect(EventSource).toHaveBeenCalledTimes(1)
    expect(client.events.addEventListener).toHaveBeenCalledTimes(3)
  })

  test('verify .onmessage() method behaviors', async () => {
    const srcHost: string = 'src.example.com'
    const tgtHost: string = 'tgt.example.com'
    const tgtUrl: string = `http://${tgtHost}/web-hook`

    const req = nock(`http://${tgtHost}`).post('/web-hook').query({ foo: 'bar', then: 'now' }).reply(200, 'Posted')

    // We "receive" messages from src/channel5 and post to ${tgtUrl}.
    const opts = { source: `http://${srcHost}/channel5`, target: tgtUrl }
    const client = new Client(opts)

    // Message that will be "received".
    const msg = { data: `{"query": {"foo": "bar", "then": "now"}, "host": "${srcHost}", "body": "payload", "key1": "one", "key2": "two"}` }

    // "Receive" the message.
    client.onmessage(msg)

    // Ensure all POST operations complete before test ends.
    await flushPromises()
    await flushPromises()

    expect(req.isDone()).toBe(true)
  })

  test('createChannel returns a new channel', async () => {
    const req = nock('https://smee.io').head('/new').reply(302, '', {
      Location: 'https://smee.io/abc123'
    })

    const channel = await Client.createChannel()
    expect(channel).toEqual('https://smee.io/abc123')
    expect(req.isDone()).toBe(true)
  })
})
