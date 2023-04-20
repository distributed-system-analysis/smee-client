<h1 align="center">ARCHIVED - See https://github.com/chmouel/gosmee<h1>
<h2 align="center">smee-client</h2>
<p align="center">Client and CLI for smee.io, a service that delivers webhooks to your local development environment.</p>
<p align="center"><img src="https://github.com/distributed-system-analysis/smee-client/actions/workflows/ci.yml/badge.svg" alt="Build Status"> <a href="https://codecov.io/gh/distributed-system-analysis/smee-client"><img src="https://badgen.net/codecov/c/github/distributed-system-analysis/smee-client" alt="Codecov"></a></p>

<p align="center"><a href="https://github.com/probot/smee.io">Looking for <strong>probot/smee.io</strong>?</a></p>

## Installation

Install the client with:

```
$ npm install -g smee-client
```

## Usage

### CLI

The `smee` command will forward webhooks from smee.io to your local development environment.

```
$ smee
```

Run `smee --help` for usage.

### Node Client

```js
const SmeeClient = require('smee-client')

const smee = new SmeeClient({
  source: 'https://smee.io/abc123',
  target: 'http://localhost:3000/events',
  logger: console
})

const events = smee.start()

// Stop forwarding events
events.close()
```
