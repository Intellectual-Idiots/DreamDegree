import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../../.env.local');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// ------------------------------
// 1. Initialize Pinecone client
// ------------------------------
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || ''
});

// ------------------------------
// 2. Create dense and sparse indexes
// ------------------------------
const dense_index_name = "dense-for-hybrid-hackathon";
const sparse_index_name = "sparse-for-hybrid-hackathon";

async function hasIndex(indexName: string) {
  const list = await pc.listIndexes();
  return list.indexes?.some(index => index.name === indexName);
}

async function main() {
  // Create dense index if it doesn’t exist
  if (!(await hasIndex(dense_index_name))) {
    await pc.createIndexForModel({
      name: dense_index_name,
      cloud: 'aws',
      region: 'us-east-1',
      embed: {
        model: 'llama-text-embed-v2',
        fieldMap: { text: "RAG" }
      }
    });
    console.log(`Created index: ${dense_index_name}`);
  } else {
    console.log(`Index already exists: ${dense_index_name}`);
  }

  // Create sparse index if it doesn’t exist
  if (!(await hasIndex(sparse_index_name))) {
    await pc.createIndexForModel({
      name: sparse_index_name,
      cloud: 'aws',
      region: 'us-east-1',
      embed: {
        model: 'pinecone-sparse-english-v0',
        fieldMap: { text: "RAG" }
      }
    });
    console.log(`Created index: ${sparse_index_name}`);
  } else {
    console.log(`Index already exists: ${sparse_index_name}`);
  }
}


if (require.main === module) {
  main().catch(err => {
    console.error("Error running Pinecone index setup:", err);
    process.exit(1);
  });
}