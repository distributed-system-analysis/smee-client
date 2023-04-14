import Client = require('./client')
import nock = require('nock')

describe('client', () => {
  describe('Client', () => {
    test('verify Client constructor', () => {
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
  })

  describe('createChannel', () => {
    test('returns a new channel', async () => {
      const req = nock('https://smee.io').head('/new').reply(302, '', {
        Location: 'https://smee.io/abc123'
      })

      const channel = await Client.createChannel()
      expect(channel).toEqual('https://smee.io/abc123')
      expect(req.isDone()).toBe(true)
    })
  })
})
