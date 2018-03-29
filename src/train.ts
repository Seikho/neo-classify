import { Relation } from './types'
import { cypher } from './db'
import slug from './slug'

export async function train(message: string, relations: Relation[]) {
  const msg = slug(message)
  const split = msg.split('-')

  for (const rel of relations) {
    const query = toUpsert(split, rel)
    await cypher(query)
  }
}

function toUpsert(words: string[], relation: Relation) {
  const merges: string[] = []
  const wordIds: string[] = []

  merges.push(`MERGE (doc: Document { words: '${words.join('-')}' })`)

  for (const word of words) {
    const id = `w${merges.length}`
    wordIds.push(id)

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

/**
 * Basically empty the database completely
 */
export function deleteAll() {
  return cypher({
    query: `MATCH nn DETACH DELETE ALL`
  })
}
