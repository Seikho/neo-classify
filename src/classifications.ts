import { cypher } from './db'

export default async function getClassifications() {
    const attrs = await cypher<Node.Attr[]>({
        query: `MATCH (n: Attr) RETURN n.type as type, n.value as value`
    })

    const classifications: { [attr: string]: string[] } = {}

    for (const attr of attrs) {
        if (!classifications[attr.type]) {
            classifications[attr.type] = []
        }

        classifications[attr.type].push(attr.value)
    }

    return classifications
}
