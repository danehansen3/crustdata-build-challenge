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
      
      // Fix: Change doc.text to doc.chunk
      const docsMap = documents?.map((doc) => doc.chunk);
      docContext = docsMap.join('\n');  // Changed to join with newlines for better readability

      console.log("Latest Message:", latestMessage);
      console.log("Retrieved Documents:", docsMap);
      console.log("Document Context:", docContext);

    } catch (error) {
      console.error("Error retrieving documents:", error);
      return new Response("Internal server error collection", { status: 500 });
    }

    const template = {
      role: "system",
      content: `
        You are an AI assistant that provides detailed and specific answers about CrustData's APIs directly from the documentation. 
        You have comprehensive knowledge of CrustData's API documentation and should answer questions completely rather than referring users elsewhere.
        
        Always provide specific details, examples, and explanations directly in your responses.
        Never suggest checking the documentation - you are the direct source of documentation knowledge.
        If you're not sure about something specific, acknowledge what you do know and what might need clarification.
        
        Format responses using markdown when applicable.
        
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

  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response("Internal server error embedding", { status: 500 });
  }
}
