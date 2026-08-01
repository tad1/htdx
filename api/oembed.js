// yes, this is AI generated
import MiniSearch from 'minisearch';
import { readdir, readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const contentDir = resolve(__dirname, '../content');
const docs = {}

async function loadDocuments() {
  try{
  const entries = await readdir(contentDir, {withFileTypes: true});
  const allowedExtensions = ['.txt', '.md', '.html']
  const nonHTMLExtensions = allowedExtensions.filter((v)=>v != ".html")

  for (const entry of entries){
    if(!entry.isFile()) continue;

    const ext = extname(entry.name).toLowerCase();
    const nameWithoutExt = entry.name.replace(/\.[^/.]+$/, "");
    const displayName = nameWithoutExt.replace(/_/g, " ");
    if (!allowedExtensions.includes(ext)) continue;
      const filePath = join(contentDir, entry.name);
      try {
        let content = await readFile(filePath, 'utf-8');
        if(nonHTMLExtensions.includes(ext)){
          content = 
          '<html><head><meta name="color-scheme" content="light dark"></head><body><pre style="word-wrap: break-word; white-space: pre;"></pre>'
          + content
          + '</pre></body></html>'
        }

        docs[entry.name] = {
          name: displayName,
          content: content,
        }
      } catch (err) {
        console.error(`Failed to read ${entry.name}:`, err.message);
      }
  }
} catch (err){
    console.error(`Failed to read content directory: ${err.message}`);
}
}
await loadDocuments();

// 3. Export the GET request handler
export async function GET(request) {
  const url = new URL(request.url);
  const query_url = url.searchParams.get('url');
  const max_height = url.searchParams.get('maxheight');
  const max_width = url.searchParams.get('maxwidth');
  const format = url.searchParams.get('format');


  if(format == "xml"){
    return new Response(JSON.stringify({ error: 'XML oEmbed not supported yet!' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // If no query parameter is provided, return an error
  if (!query_url) {
    return new Response(JSON.stringify({ error: 'Missing search query parameter: url' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // the the relative path:
  let match = query_url.match("^.*\/(.*)$")
  if(!match){
        return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let res = docs[match[1]]
  if(!res){
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let w = 400
  if(max_width && Number.parseInt(max_width)){
    w = Number.parseInt(max_width)
  }
  let h = 120
  if(max_height && Number.parseInt(max_height)){
    h = Number.parseInt(max_height)
  }

  return new Response(JSON.stringify({
    "version":"1.0",
    "type":"rich",
    "title":res.name,
    "html":res.content,
    "width": w,
    "height": h
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json',     'Access-Control-Allow-Origin': '*' },
  });
}