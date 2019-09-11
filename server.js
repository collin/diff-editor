if (!process.env.DIFF_EDITOR_ROOT) {
  console.log("You MUST specify a `DIFF_EDITOR_ROOT` environment variable for the editor.")
  process.exit(1)
}
const express = require("express")

const app = require('express')();
const server = require('http').Server(app);

const fs = require('fs').promises
const path = require('path')
const volleyball = require('volleyball')
app.use(function (req, res, next) {
  const origin = req.get('origin');
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
})
app.use(volleyball)

const connectIO = require('socket.io')
const sockets = connectIO(server)

app.use(express.static(path.join(__dirname, "public")))

const Bundler = require("parcel-bundler")
const entrypoint = path.join(__dirname, "src","index.html")
const parcelOptions = {}
const bundler = new Bundler(entrypoint, parcelOptions)
app.use(bundler.middleware())

function validatePath (pathname) {
  if (pathname.match(/\.\./)) {
    throw new Error(`Illegal path (found .. in submitted path): "${pathname}".`)
  }
  // FIXME: ensure paths are in ./src
  return true
}

function joinPath (pathname) {
  console.log(path.join(process.env.DIFF_EDITOR_ROOT, pathname))
  return path.join(process.env.DIFF_EDITOR_ROOT, pathname)
}

const child_process = require('child_process')
function execPromise (cmd, options) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, options, (err, stdout, stderr) => {
      if (error) { reject(err) }
      else { resolve(stdout) }
    })
  })
}

sockets.on('connection', aSocket => {
  console.log(aSocket.id + ' connected')
  const api = {
    readdir: async (eid, pathname) => {
      const items = await fs.readdir(joinPath(pathname))
      const stats = await Promise.all(items.map(async item => {

        const stat = await fs.stat(joinPath(path.join(pathname, item)))
        return {
          name: path.join(pathname, item),
          isDir: stat.isDirectory(),
          ...stat
        }
      }))
      aSocket.send('resolve', eid, stats)
      return
    },
    readfile: async (eid, pathname) => {
      aSocket.send('resolve', eid, await fs.readFile(joinPath(pathname), 'utf-8'))
    },
    writefile: async (eid, pathname, fileData) => {
      aSocket.send('resolve', eid, await fs.writeFile(joinPath(pathname), fileData))
    },
    touch: async (eid, pathname) => {
      aSocket.send('resolve', eid, await child_process.exec('touch', [joinPath(pathname)]))
    },
    mv: async (eid, oldPathname, newPathname) => {
      aSocket.send('resolve', eid, await child_process.exec('mv', [joinPath(oldPathname), joinPath(newPathname)]))
    },
    rm: async (eid, pathname) => {
      aSocket.send('resolve', eid, await fs.unlink(joinPath(pathname)))
    }
  }

  aSocket.on('message', async (callName, eid, ...args) => {
    console.log("GOT MESSAGE", callName, eid, args)
    try {
      await api[callName](eid, ...args)
    }
    catch (error) {
      aSocket.send('reject', eid, error.message)
    }
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})
