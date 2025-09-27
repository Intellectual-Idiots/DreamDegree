import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import data from './data';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../../.env.local');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

const records: any[] = data;

//Generate ids for records
for (let i = 0; i < records.length; i++) {
    records[i]["id"] = (i + 1).toString();
}

//Create a "RAG" field for each record
for (let i = 0; i < records.length; i++) {
    records[i]["RAG"] = records[i]["title"] + " " + records[i]["description"];
}
    

// ------------------------------
// 1. Initialize Pinecone client
// ------------------------------
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || ''
});

const dense_index_name = "dense-for-hybrid-hackathon";
const sparse_index_name = "sparse-for-hybrid-hackathon";

// Connect to indexes
const dense_index = pc.Index(dense_index_name).namespace("namespace-1")
const sparse_index = pc.Index(sparse_index_name).namespace("namespace-1")

const BATCH_SIZE = 96;

async function upsertInBatches(index: any, records: any[]) {
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        await index.upsertRecords(batch);
        console.log(`Upserted records ${i + 1} to ${Math.min(i + BATCH_SIZE, records.length)} into index.`);
    }
}

(async () => {
    await upsertInBatches(dense_index, records);
    await upsertInBatches(sparse_index, records);
    console.log('All records upserted to both indexes.');
})();


  
