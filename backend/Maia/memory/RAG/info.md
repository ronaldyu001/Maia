
# **Embedding & Vector Database Overview**

This document explains how embeddings and FAISS fit into Maia’s memory system.

---

## **1. Purpose**

Embeddings allow Maia to **store and recall long-term memory** by converting text into high-dimensional vectors.

The vector database (FAISS) makes it possible to quickly search for semantically similar content.

---

## **2. Components**

### **a. Embedder (Nomic Embed)**

* **Model: **nomic-embed-text** (via **sentence_transformers**)**
* Function: Converts raw or processed text → fixed-size numerical vector (**[float32, …]**)
* **Input: String (e.g. **"User asked about workout plan"**)**
* **Output: Vector (e.g. **[0.123, -0.456, 0.789, …]**)**

### **b. Vector Database (FAISS)**

* Stores vectors in an index file (**index.faiss**)
* Handles **nearest neighbor search** (fast similarity lookups)
* Supports persistence:
  * faiss.write_index(index, "index.faiss")** → saves to disk**
  * faiss.read_index("index.faiss")** → loads from disk**

### **c. Metadata**

* Stored separately (**metadata.jsonl**)
* Maps FAISS internal IDs → UUIDs → contextual info
* Example entry:
  ```
  {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "text": "User’s goal: improve cardio fitness",
    "timestamp": "2025-08-22T09:00:00",
    "category": "goals"
  }
  ```

---



## **3. Data Flow**

1. **Raw Input**
   * Text from conversation, goals, facts, or other sources.
2. **Preprocessing**
   * Clean/normalize text (optional).
   * Store both **raw** and **processed** versions in the memory folders.
3. **Embedding**
   * Use **nomic-embed-text** to embed processed text → vector.
4. **Indexing in FAISS**
   * Add vector to FAISS index.
   * Assign ID and persist with **write_index**.
5. **Metadata Mapping**
   * Store metadata in **metadata.jsonl**.
   * Keep UUID → FAISS ID mapping.
6. **Recall / Retrieval (RAG)**
   * Query FAISS with a new embedding.
   * FAISS returns nearest vector IDs.
   * Look up metadata by UUID.
   * Send relevant text back into Maia’s context window.

## **4. File Structure**

```
memory/
│
├── raw/
│   ├── short_term/
│   └── long_term/
│
├── processed/
│   ├── conversations/
│   ├── goals/
│   └── facts/
│
├── embedded/
│   ├── index.faiss
│   ├── metadata.jsonl
│   └── index_meta.json (FAISS internal info)
```


---



## **5. Key Notes**

* **Vectors live in index.faiss**
* **Metadata lives in metadata.jsonl**
* **FAISS index must be saved** after updates (**write_index**), otherwise new vectors are lost after restart.
* Re-embedding is required if switching to a different embedding model.
* Preprocessed data should always be saved so you don’t need to redo cleaning before re-embedding.

---

## **6. Next Steps**

* Build wrapper classes:
  * **Embedder** → handles text → vector conversion
  * **VectorDB** → handles add/query/save/load
* Integrate with Maia’s context engineering for Retrieval-Augmented Generation (RAG).
