export interface Relation {
  type: string
  tags: string[]
}

export interface Attr {
  type: string
  value: string
}

export interface Doc {
  words: string
}

export interface Word {
  name: string
}

export interface Classification {
  total: number
  docs: { [type: string]: { [tag: string]: number } }
  relations: { [type: string]: { [tag: string]: number } }
  words: { [word: string]: { [type: string]: { [tag: string]: number } } }
  results: { [type: string]: { [tag: string]: { percent: number; probability: number } } }
}
