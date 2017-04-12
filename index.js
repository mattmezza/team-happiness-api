const Hapi = require('hapi')
const levelup = require('level')
const normalDb = levelup('./db', {
  createIfMissing: true,
  errorIfExists: false,
  valueEncoding: {
    encode: JSON.stringify,
    decode: JSON.parse
  }
})
const db = require('then-levelup')(normalDb)

const server = new Hapi.Server()
server.connection({ port: 8888, host: '0.0.0.0' })

const isTeamValid = (team) => ['corsi.it'].indexOf(team) >= 0

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, reply) => {
      if (!isTeamValid(request.params.name)) {
        return reply({msg: 'team is not valid'}).code(400)
      }
      db.get(request.params.name).then((val) => {
        const bad = val.bad || 0
        const meh = val.meh || 0
        const great = val.great || 0
        const tot = bad + meh + great
        const badPercent = tot === 0 ? 0 : Math.round(bad * 100 / tot)
        const mehPercent = tot === 0 ? 0 : Math.round(meh * 100 / tot)
        const greatPercent = tot === 0 ? 0 : Math.round(great * 100 / tot)
        const r = {
          bad, meh, great, tot, badPercent, mehPercent, greatPercent
        }
        reply(r).code(200).header('Access-Control-Allow-Origin', '*')
      }).catch((err) => {
        reply({msg: err.message}).code(500)
      }) 
    }
})

server.route({
    method: 'PUT',
    path: '/{name}/{feeling}',
    handler: function (request, reply) {
      if (!isTeamValid(request.params.name)) {
        return reply({msg: 'team is not valid'}).code(400)
      }
      db.get(request.params.name).then((status) => {
        const what = request.params.feeling
        status[what] = status[what] + 1
        db.put(request.params.name, status).then((err) => {
          reply().code(200).header('Access-Control-Allow-Origin', '*')
        }) 
      }).catch((err) => {
        const what = request.params.feeling
        db.put(request.params.name, {
          bad: (what === 'bad' ? 1 : 0),
          meh: (what === 'meh' ? 1 : 0),
          great: (what === 'great' ? 1 : 0)
        }).then((err) => {
          reply({msg: 'DB initialized'})
        }).catch((err) => {
          reply({msg: err.message}).code(500)
        })
      })
    }
})

server.route({
    method: 'OPTIONS',
    path: '/{name}/{feeling}',
    handler: function (request, reply) {
      return reply()
        .code(200)
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'PUT')
    }
})

server.start((err) => {
  if (err) throw err
  console.log(`Server running at: ${server.info.uri}`)
})