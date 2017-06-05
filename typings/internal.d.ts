interface Relation {
    type: string
    tags: string[]
}

interface TrainingInput {
    message: string
    relations: Relation[]
}

declare namespace Node {
    interface Attr {
        type: string
        value: string
    }

    interface Doc {
        words: string
    }

    interface Word {
        name: string
    }
}
