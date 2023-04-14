import cmd = require('./cmd')

describe('commander', (): void => {
  const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation((): boolean => false)

  afterEach(() => {
    writeSpy.mockClear()
  })

  test('when -h or --help given', () => {
    const doIt = (s: string) => () => cmd.parseCommandLine(['node', 'smee', s])
    expect(doIt('--help')).toThrow('(outputHelp)')
    expect(doIt('-h')).toThrow('(outputHelp)')
  })

  test('when only -p or --port given', () => {
    let args = cmd.parseCommandLine(['node', 'smee', '-p', '42'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('http://127.0.0.1:42/')

    args = cmd.parseCommandLine(['node', 'smee', '--port', '42'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('http://127.0.0.1:42/')
  })

  test('when -P or --path given', () => {
    let args = cmd.parseCommandLine(['node', 'smee', '-P', '/forty-two'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('http://127.0.0.1:3000/forty-two')

    args = cmd.parseCommandLine(['node', 'smee', '--path', '/forty-two'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('http://127.0.0.1:3000/forty-two')
  })

  test('when -p and -P given', () => {
    const args = cmd.parseCommandLine(['node', 'smee', '-p', '42', '-P', '/forty-two'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('http://127.0.0.1:42/forty-two')
  })

  test('when -t or --target given', () => {
    let args = cmd.parseCommandLine(['node', 'smee', '-t', 'https://target.example.com:42/forty-two'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('https://target.example.com:42/forty-two')

    args = cmd.parseCommandLine(['node', 'smee', '--target', 'https://target.example.com:42/forty-two'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('https://target.example.com:42/forty-two')
  })

  test('when -t, -p and -P given', () => {
    const args = cmd.parseCommandLine(['node', 'smee', '-t', 'https://target.example.com:42/forty-two', '-p', '43', '-P', '/forty-three'])

    expect(args.source).toBeUndefined()
    expect(args.target).toEqual('https://target.example.com:42/forty-two')
  })

  test('when specify --url', () => {
    let args = cmd.parseCommandLine(['node', 'smee', '-u', 'https://example.com/forty-two'])

    expect(args.source).toEqual('https://example.com/forty-two')
    expect(args.target).toEqual('http://127.0.0.1:3000/')

    args = cmd.parseCommandLine(['node', 'smee', '--url', 'https://example.com/forty-two'])

    expect(args.source).toEqual('https://example.com/forty-two')
    expect(args.target).toEqual('http://127.0.0.1:3000/')
  })

  test('when -u, -p and -P given', () => {
    const args = cmd.parseCommandLine(['node', 'smee', '-u', 'https://example.com/forty-two', '-p', '43', '-P', '/forty-three'])

    expect(args.source).toEqual('https://example.com/forty-two')
    expect(args.target).toEqual('http://127.0.0.1:43/forty-three')
  })

  test('when -u and -t given', () => {
    const args = cmd.parseCommandLine(['node', 'smee', '-u', 'https://example.com/forty-two', '-t', 'https://target.example.com:43/forty-three'])

    expect(args.source).toEqual('https://example.com/forty-two')
    expect(args.target).toEqual('https://target.example.com:43/forty-three')
  })
})
