// yes, this is AI generated
import MiniSearch from 'minisearch';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const contentDir = resolve(__dirname, '../content');

const miniSearch = new MiniSearch({
  fields: ['name', 'content'], // Fields to index
  idField: 'path'
});

async function loadDocuments() {
  try{
  const documents = [];
  const entries = await readdir(contentDir, {withFileTypes: true});
  const allowedExtensions = ['.txt', '.md', '.html']

  for (const entry of entries){
    if(!entry.isFile()) continue;


    const ext = extname(entry.name).toLowerCase();
    const nameWithoutExt = entry.name.replace(/\.[^/.]+$/, "");
    const displayName = nameWithoutExt.replace(/_/g, " ");
    if (!allowedExtensions.includes(ext)) continue;
      const filePath = join(contentDir, entry.name);
      try {
        const content = await readFile(filePath, 'utf-8');
        documents.push({
          path: entry.name,      // File name (e.g., "test_note.md")
          name: displayName,    // Searchable name (e.g., "test note")
          content: content,
        });
      } catch (err) {
        console.error(`Failed to read ${entry.name}:`, err.message);
      }
  }
  miniSearch.addAll(documents);
} catch (err){
    console.error(`Failed to read content directory: ${err.message}`);
}
}
await loadDocuments();

// 3. Export the GET request handler
export async function GET(request) {
  // Get the query parameter 'q' from the request URL
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  // If no query parameter is provided, return an error
  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing search query parameter: q' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Execute the search
  // Here we use fuzzy search, allowing a maximum edit distance of 0.2 * query length
  const results = miniSearch.search(query, { fuzzy: 0.2 }).slice(0,6).map((res)=> res.id);

  // 5. Return the search results as JSON
  return new Response(JSON.stringify([query,results]), {
    status: 200,
    headers: { 'Content-Type': 'application/json',     'Access-Control-Allow-Origin': '*' },
  });
}