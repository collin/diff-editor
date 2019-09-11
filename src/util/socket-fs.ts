import* as io from 'socket.io-client'

type EventName = (
  | "readdir"
  | "readfile"
  | "writefile"
  | "touch"
  | "mv"
  | "rm"
)

type EventId = string

interface OutstandingCall {
  resolve: Function,
  reject: Function,
  callName: EventName,
  args: any[]
}

interface OutstandingCalls {
  // Really want this to be eventid
  [key: string]: OutstandingCall
}

const socket = io.connect(`${window.location.hostname}:3001`)

let _id: number = 0
const id = (): EventId => String(_id++)

const outstandingCalls: OutstandingCalls = {}

function makeCall<ArgType extends any[], ResolveType>
  (callName: EventName, ...args:ArgType):
  Promise<ResolveType>
{
  const eid: EventId = id()

  const promise = new Promise<ResolveType>((resolve, reject) => {
    outstandingCalls[eid] = { resolve, reject, callName, args }
  })
  socket.send(callName, eid, ...args)

  return promise
}

type MessageName = "resolve" | "reject"

socket.on('message', (name: MessageName, eid: EventId, ...args: any[]) => {
  switch (name) {
    case 'resolve':
      try {
        const {resolve, callName} = outstandingCalls[eid]
        switch (callName) {
          case 'readdir':
            resolve(...args as EnhancedStat[])
            break
          case 'readfile':
            resolve(...args as [string])
            break
          case 'writefile':
            resolve()
            break
          case 'touch':
            resolve()
            break
          case 'mv':
            resolve()
            break
          case 'rm':
            resolve()
            break
          default:
            resolve(...args)
        }
      }
      catch (error) {
        console.error('Error while resolving fs event')
        console.error(error)
        console.log(outstandingCalls[eid])
      }
      finally {
        delete outstandingCalls[eid]
      }
      break;
    case 'reject':
      try {
        outstandingCalls[eid].reject(...args)
      }
      catch (error) {
        console.error('Error while rejecting fs event')
        console.error(error)
        console.log(outstandingCalls[eid])
      }
      finally {
        delete outstandingCalls[eid]
      }
      delete outstandingCalls[eid]
      break;
    default:
      throw new Error(`Unexpected case ${name} in socket-fs bridge`)
  }
})

type FilePath = string
type FileContents = string
import * as fs from 'fs-extra'
import * as child_process from 'child_process'

interface EnhancedStat extends fs.Stats {
  name: string,
  isDir: boolean
}

export default {
  readdir: (dirname: FilePath): Promise<EnhancedStat[]> =>
    makeCall<[string], EnhancedStat[]>('readdir', dirname),

  readfile: (filename: FilePath): Promise<string> =>
    makeCall<[string], string>('readfile', filename),

  writefile: (filename: FilePath, content: FileContents): Promise<void> =>
    makeCall<[string, string], void>('writefile', filename, content),

  touch: (filename: FilePath): Promise<void> =>
    makeCall<[string], void>('touch', filename),

  mv: (fromFilename: FilePath, toFilename: FilePath): Promise<void> =>
    makeCall<[string, string], void>('mv', fromFilename, toFilename),

  rm: (filename: FilePath): Promise<void> =>
    makeCall<[string], void>('rm', filename),
}
