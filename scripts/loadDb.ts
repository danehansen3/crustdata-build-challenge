import { DataAPIClient } from "@datastax/astra-db-ts"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { OpenAI } from "openai"
import fs from "fs/promises"
import path from "path"
import "dotenv/config"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY,
} = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
})

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric,
            },
        })
        console.log("Collection created successfully:", res)
    } catch (error) {
        console.error("Error creating collection:", error)
    }
}

const loadSampleData = async () => {
    // Reference your collection
    const collection = await db.collection(ASTRA_DB_COLLECTION)

    // Define the correct data directory path
    const dataDirectory = path.join(__dirname, "../app/static_data")

    try {
        console.log(`Loading data from: ${dataDirectory}`)

        // Read all files in the data directory
        const files = await fs.readdir(dataDirectory)

        for (const file of files) {
            const filePath = path.join(dataDirectory, file)

            // Read file content
            const content = await fs.readFile(filePath, "utf-8")

            // Split the content into chunks
            const chunks = await splitter.splitText(content)

            for (const chunk of chunks) {
                // Generate embeddings for the chunk
                const embedding = await openai.embeddings.create({
                    model: "text-embedding-ada-002",
                    input: chunk,
                })

                const vector = embedding.data[0].embedding

                // Insert document into AstraDB collection
                const res = await collection.insertOne({
                    $vector: vector,
                    chunk: chunk,
                })
                console.log(`Successfully uploaded chunk from ${file}. Response: ${JSON.stringify(res)}`)
            }
        }
    } catch (error) {
        console.error("Error loading sample data:", error)
    }
}

// First create the collection, then load data
createCollection().then(() => loadSampleData())
