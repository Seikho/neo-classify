const set: TrainingInput[] = [
    {
        message: 'i like coffee',
        relations: [
            {
                type: 'sentiment',
                tags: ['positive']
            },
            {
                type: 'topic',
                tags: ['drink', 'caffeine']
            }
        ]
    },
    {
        message: 'i really love coffee',
        relations: [
            {
                type: 'sentiment',
                tags: ['positive']
            },
            {
                type: 'topic',
                tags: ['drink', 'caffeine']
            }
        ]
    },
    {
        message: 'coffee is too bitter',
        relations: [
            {
                type: 'sentiment',
                tags: ['negative']
            },
            {
                type: 'topic',
                tags: ['drink', 'caffeine']
            }
        ]
    },
    {
        message: 'i like coffee with milk',
        relations: [
            {
                type: 'sentiment',
                tags: ['positive']
            },
            {
                type: 'topic',
                tags: ['drink', 'caffeine', 'dairy']
            }
        ]
    },
    {
        message: 'i love hot chocolate',
        relations: [
            {
                type: 'sentiment',
                tags: ['positive']
            },
            {
                type: 'topic',
                tags: ['drink', 'dairy']
            }
        ]
    },
    {
        message: 'i enjoy hot coffee',
        relations: [
            {
                type: 'sentiment',
                tags: ['positive']
            },
            {
                type: 'topic',
                tags: ['caffiene', 'drink', 'dairy']
            }
        ]
    }
]

export default set