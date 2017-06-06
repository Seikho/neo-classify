import slug from './slug'
import getClassifications from './classifications'
import { cypher } from './db'

export async function classify(rawMessage: string) {
    const msg = slug(rawMessage)
    const words = msg.split('-')

    const count = await classifyDocument(words)
    return count
}

type Counts = {
    total: number
    docs: { [cls: string]: { [type: string]: number } }
    relations: { [cls: string]: { [type: string]: number } }
    words: { [word: string]: { [cls: string]: { [type: string]: number } } }
    results: { [cls: string]: { [type: string]: { percent: number, probability: number } } }
}

async function classifyDocument(words: string[]) {
    const total: any = await getTotalWords()
    const classifications = await getClassifications()

    const counts: Counts = {
        total: total[0].count,
        docs: {},
        relations: {},
        words: {},
        results: {}
    }

    for (const cls of Object.keys(classifications)) {
        await getClassification(counts, cls, classifications[cls], words)
    }

    return counts
}

async function getClassification(counts: Counts, cls: string, types: string[], words: string[]) {
    counts.results[cls] = {}
    counts.relations[cls] = {}
    counts.docs[cls] = {}

    for (const type of types) {
        const query =
            `MATCH (:Word)-[r:HAS_ATTR]->(:Attr { type: '${cls}', value: '${type}' })
            RETURN count(r) as count`

        const result = await cypher<Array<{ count: number }>>({ query })
        counts.relations[cls][type] = result[0].count
    }

    for (const type of types) {
        const query =
            `MATCH (:Document)-[r:HAS_ATTR]->(:Attr { type: '${cls}', value: '${type}' })
            RETURN count(r) as count`

        const result = await cypher<Array<{ count: number }>>({ query })
        counts.docs[cls][type] = result[0].count
    }

    for (const word of words) {
        counts.words[word] = {}
        counts.words[word][cls] = {}

        for (const type of types) {
            const query =
                `MATCH (:Word { name: '${word}' })-[r:HAS_ATTR]->(:Attr { type: '${cls}', value: '${type}' })
                RETURN count(r) as count`

            const result = await cypher<Array<{ count: number }>>({ query })
            counts.words[word][cls][type] = result[0].count
        }
    }

    for (const type of types) {
        const t = counts.total
        const p = counts.docs[cls][type] / t

        const tS = counts.relations[cls][type]
        const probs: number[] = []

        counts.results[cls][type] = { percent: 0, probability: 0 }

        for (const word of words) {
            const w = counts.words[word][cls][type]
            probs.push((w + 1) / (tS + t))
        }

        counts.results[cls][type].probability = probs.reduce((prev, curr) => p * curr, p)
    }


    const totalProb = types
        .reduce((prev, curr) => prev + counts.results[cls][curr].probability, 0)

    for (const type of types) {
        const probability = counts.results[cls][type].probability
        counts.results[cls][type].percent = (probability / totalProb) * 100
    }
}

async function getTotalWords() {
    return cypher(`MATCH (w: Word) RETURN count(DISTINCT w.name) as count`)
}

classify('coffee is alright')
    .then(counts => console.log(JSON.stringify(counts, null, 2)))
    .then(() => process.exit(0))