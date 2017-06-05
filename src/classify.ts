import { cypher } from './db'
import slug from './slug'

export async function classify(rawMessage: string) {
    const msg = slug(rawMessage)
    const words = msg.split('-')

    const count = await getSentiment(words)
    console.log(count)
}

async function getSentiment(words: string[]) {
    const total: any = await getTotalWords()
    const sentiments = await cypher<Array<{ value: string }>>({
        query:
        `MATCH (sentiment: Attr { type: 'sentiment' })
        RETURN DISTINCT sentiment.value as value`
    })

    type Counts = {
        total: number
        docs: { [sentiment: string]: number }
        relations: { [sentiment: string]: number }
        words: { [word: string]: { [sentiment: string]: number } }
        results: { [sentiment: string]: { percent: number, probability: number } }
    }

    const counts: Counts = {
        total: total[0].count,
        docs: {},
        relations: {},
        words: {},
        results: {}
    }

    for (const sentiment of sentiments) {
        const query =
            `MATCH (:Word)-[r:HAS_ATTR]->(:Attr { type: 'sentiment', value: '${sentiment.value}' })
            RETURN count(r) as count`

        const result = await cypher<Array<{ count: number }>>({ query })
        counts.relations[sentiment.value] = result[0].count
    }

    for (const sentiment of sentiments) {
        const query =
            `MATCH (:Document)-[r:HAS_ATTR]->(:Attr { type: 'sentiment', value: '${sentiment.value}' })
            RETURN count(r) as count`

        const result = await cypher<Array<{ count: number }>>({ query })
        counts.docs[sentiment.value] = result[0].count
    }

    for (const word of words) {
        counts.words[word] = {}

        for (const sentiment of sentiments) {
            const query =
                `MATCH (:Word { name: '${word}' })-[r:HAS_ATTR]->(:Attr { type: 'sentiment', value: '${sentiment.value}' })
                RETURN count(r) as count`

            const result = await cypher<Array<{ count: number }>>({ query })
            counts.words[word][sentiment.value] = result[0].count
        }
    }

    for (const sentiment of sentiments) {
        const t = counts.total
        const p = counts.docs[sentiment.value] / t

        const tS = counts.relations[sentiment.value]
        const probs: number[] = []

        counts.results[sentiment.value] = { percent: 0, probability: 0 }

        for (const word of words) {
            const w = counts.words[word][sentiment.value]
            probs.push((w + 1) / (tS + t))
        }

        counts.results[sentiment.value].probability = probs.reduce((prev, curr) => p * curr, p)
    }

    const totalProb = Object
        .keys(counts.results)
        .reduce((prev, curr) => prev + counts.results[curr].probability, 0)
    
    for (const sentiment of sentiments) {
        counts.results[sentiment.value].percent = (counts.results[sentiment.value].probability / totalProb) * 100
    }

    return counts
}

async function getTotalWords() {
    return cypher(`MATCH (w: Word) RETURN count(DISTINCT w.name) as count`)
}

classify('coffee is alright')