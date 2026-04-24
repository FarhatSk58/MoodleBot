## ChromaDB Setup (Required for RAG)

ChromaDB requires Python. Run these commands once:

pip install chromadb

Then start the ChromaDB server before running the AI service:

chroma run --path ./chroma_db

Keep this terminal open. ChromaDB runs at http://localhost:8000 by default.

## Auto-Sync Behaviour

After this step, ChromaDB stays in sync automatically:

| Event | Trigger | Action |
|---|---|---|
| Teacher uploads a file | uploadMaterial() in materialController.js | syncMaterialToChroma() called fire-and-forget |
| Teacher deletes a file | deleteMaterial() in materialController.js | removeChunksForMaterial() called fire-and-forget |
| Bulk backfill needed | Manual | node jobs/ingestAllMaterials.js |

The sync is always fire-and-forget — it never delays or fails the HTTP response.
If ChromaDB is down, the upload/delete succeeds and a warning is logged.

