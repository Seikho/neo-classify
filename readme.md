# Neo-classify
> Text Classification with Naive Bayes implementation using Neo4j and Node.JS

## Requirements
- Neo4J
- NodeJS

## Installation
```sh
$ yarn add neo-classify
$ # or:
$ npm i neo-classify
```

## Usage
```ts
import { configure, train, classify } from 'neo-classify'

configure('http://username:password@localhost:7474')
// or
configure({ host: 'localhost', user: 'username', password: 'password', port: 7474, protocol: 'https' })

example()

async function example() {
  const pos = { type: 'sentiment', tags: ['positive'] }
  const neg = { type: 'sentiment', tags: ['negative'] }

  await train('i like coffee', [pos])
  await train('i love coffee', [pos])
  await train('coffee is too bitter', [neg])
  await train('i dont like coffee', [neg])
  await train('i like coffee with milk', [pos])
  await train('i hate coffee', [neg])

  const result = await classify('i really dont like coffee')
  console.log(JSON.stringify(result.results, null, 2))

  // returns...

  interface Classifcation {
    total: number
    docs: { [type: string]: { [tag: string]: number } }
    relations: { [type: string]: { [tag: string]: number } }
    words: { [word: string]: { [type: string]: { [tag: string]: number } } }
    results: { [type: string]: { [tag: string]: { percent: number; probability: number } } }
  }
}

```

# License
MIT