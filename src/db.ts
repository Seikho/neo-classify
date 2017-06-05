import * as graph from 'neo4j'
import * as assert from 'assert'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '..', '.env')
})

const host = process.env.NEO4J_HOST
const user = process.env.NEO4J_USER
const password = process.env.NEO4J_PASSWORD
const port = process.env.NEO4J_PORT || 7474
const protocol = process.env.NEO4J_PROTOCOL || 'https'

assert(host, 'NEO4J_HOST not set')
assert(user, 'NEO4J_USER not set')
assert(password, 'NEO4J_PASSWORD not set')

const db = new graph.GraphDatabase(`${protocol}://${user}:${password}@${host}:${port}`)

export default db

export function cypher<T>(options: graph.CypherOptions) {
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
