import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";
// import { openai2 } from '@ai-sdk/openai';

const {
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();

      const docsMap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch  {
      return new Response("Internal server error collection", { status: 500 });
    }

    const template = {
        role: "system",
        content: `
          You are an AI assistant specialized in answering questions about CrustData's APIs. 
          Use the context provided below to supplement your knowledge of CrustData's API documentation. 
          The context contains the latest details about authentication, endpoints, parameters, and usage examples for CrustData's APIs. 
          If the context doesn't include the information you need, rely on your existing knowledge of APIs and data platforms. 
          Do not mention the source of your information or whether the context includes specific details. 
          Format responses using markdown when applicable, and avoid returning images.
          ----------
          START CONTEXT
          ${docContext}
          END CONTEXT
          ----------
          QUESTION: ${latestMessage}
          ----------
          `,
      };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [template, ...messages],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
    // return new streamText.toDataStreamResponse(stream);
  } catch {
    return new Response("Internal server error embedding", { status: 500 });
  }
}
