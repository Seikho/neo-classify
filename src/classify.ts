import slug from './slug'
import getClassifications from './classifications'
import { cypher } from './db'
import { Classification } from './types'

export async function classify(rawMessage: string) {
  const msg = slug(rawMessage)
  const words = msg.split('-')

  const count = await classifyDocument(words)
  return count
}

async function classifyDocument(words: string[]) {
  const total: any = await getTotalWords()
  const classifications = await getClassifications()

  const result: Classification = {
    total: total[0].count,
    docs: {},
    relations: {},
    words: {},
    results: {}
  }

  for (const cls of Object.keys(classifications)) {
    await getClassification(result, cls, classifications[cls], words)
  }

  return result
}

async function getClassification(
  counts: Classification,
  type: string,
  tags: string[],
  words: string[]
) {
  counts.results[type] = {}
  counts.relations[type] = {}
  counts.docs[type] = {}

  for (const tag of tags) {
    const query = `MATCH (:Word)-[r:HAS_ATTR]->(:Attr { type: '${type}', value: '${tag}' })
            RETURN count(r) as count`

    const result = await cypher<Array<{ count: number }>>({ query })
    counts.relations[type][tag] = result[0].count
  }

  for (const tag of tags) {
    const query = `MATCH (:Document)-[r:HAS_ATTR]->(:Attr { type: '${type}', value: '${tag}' })
            RETURN count(r) as count`

    const result = await cypher<Array<{ count: number }>>({ query })
    counts.docs[type][tag] = result[0].count
  }

  for (const word of words) {
    counts.words[word] = {}
    counts.words[word][type] = {}

    for (const tag of tags) {
      const query = `MATCH (:Word { name: '${word}' })-[r:HAS_ATTR]->(:Attr { type: '${type}', value: '${tag}' })
                RETURN count(r) as count`

      const result = await cypher<Array<{ count: number }>>({ query })
      counts.words[word][type][tag] = result[0].count
    }
  }

  for (const tag of tags) {
    const t = counts.total
    const p = counts.docs[type][tag] / t

    const tS = counts.relations[type][tag]
    const probs: number[] = []

    counts.results[type][tag] = { percent: 0, probability: 0 }

    for (const word of words) {
      const w = counts.words[word][type][tag]
      probs.push((w + 1) / (tS + t))
    }

    counts.results[type][tag].probability = probs.reduce((_prev, curr) => p * curr, p)
  }

  const totalProb = tags.reduce((prev, tag) => prev + counts.results[type][tag].probability, 0)

  for (const tag of tags) {
    const probability = counts.results[type][tag].probability
    counts.results[type][tag].percent = probability / totalProb * 100
  }
}

async function getTotalWords() {
  return cypher({ query: `MATCH (w: Word) RETURN count(DISTINCT w.name) as count` })
}
