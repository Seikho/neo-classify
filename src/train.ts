import db, { cypher } from './db'
import inputs from '../training'
import slug from './slug'

export default async function train() {
    for (const input of inputs) {
        const msg = slug(input.message)
        const split = msg.split('-')
        for (const rel of input.relations) {
            const query = toUpsert(split, rel)

            try {
                await cypher(query)
            } catch (ex) {
                console.log(ex.message || ex)
                throw ex
            }
        }
        console.log(`Added '${msg}'`)
    }
}

function toUpsert(words: string[], relation: Relation) {

    const merges: string[] = []
    const wordIds: string[] = []

    merges.push(`MERGE (doc: Document { words: '${words.join('-')}' })`)

    for (const word of words) {
        const id = `w${merges.length}`
        wordIds.push(id)

        const wordValue = `${id}Word`

        // Each word in our vocabulary is unique
        merges.push(`MERGE (${id}: Word { name: '${word}' })`)
    }

    relation.tags.forEach((tag, index) => {
        const id = `t${index}`

        // We do want distinct class nodes.
        // E.g. 'sentiment:positive' Relation node should only occur once
        merges.push(`MERGE (${id}: Attr { value: '${tag}', type: '${relation.type}' })`)

        for (const wordId of wordIds) {

            // We intentionally recreate a new relationship every time we need a relationship
            // Bayes is highly dependant on the number of times a relationship is observed
            merges.push(`CREATE (${wordId})-[:HAS_ATTR]->(${id})`)
        }

        merges.push(`CREATE (doc)-[:HAS_ATTR]->(${id})`)
    })

    const query = merges.join('\n')

    return {
        query
    }
}

function deleteAll() {
    return cypher({
        query: `MATCH nn DETACH DELETE ALL`
    })
}

deleteAll()
    .then(train)
    .then(() => process.exit(0))