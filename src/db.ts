import { GraphDatabase, CypherOptions } from 'neo4j'
export { connection, configure, cypher }

export type Connection =
  | string
  | {
      host: string
      user: string
      password: string
      port?: string
      protocol?: string
    }

const host = process.env.NEO4J_HOST
const user = process.env.NEO4J_USER
const password = process.env.NEO4J_PASSWORD
const port = process.env.NEO4J_PORT || 7474
const protocol = process.env.NEO4J_PROTOCOL || 'http'

let connectionString =
  process.env.NEO4J_CONNECTION_STRING || `${protocol}://${user}:${password}@${host}:${port}`

let _db: GraphDatabase | undefined

const connection = {
  get db() {
    if (!_db) {
      _db = new GraphDatabase(connectionString)
    }
    return _db
  }
}

function configure(connection?: Connection) {
  if (!connection) {
    return
  }

  if (typeof connection === 'string') {
    connectionString = connection
    return
  }
  const { host, user, password, port = 7474, protocol = 'http' } = connection
  connectionString = `${protocol}://${user}:${password}@${host}:${port}`
}

function cypher<T>(options: CypherOptions) {
  const db = connection.db

  const promise = new Promise<T>((resolve, reject) => {
    db.cypher(options, (err, result) => {
      if (err) {
        return reject(err)
      }

      resolve(result)
    })
  })

  return promise
}
