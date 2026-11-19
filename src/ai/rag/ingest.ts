import fs from 'fs';
import path from 'path';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export type Chunk = { id: string; text: string; source: string };

/** Loads the policy documents and splits them into overlapping chunks */
export async function loadPolicyChunks(chunkSize = 300, chunkOverlap = 50): Promise<Chunk[]> {
  const dir = path.resolve('src/ai/data/policies');
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  const chunks: Chunk[] = [];

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(dir, file), 'utf-8');
    const pieces = await splitter.splitText(text);
    pieces.forEach((piece, i) => chunks.push({ id: `${file}#${i}`, text: piece, source: file }));
  }
  return chunks;
}
