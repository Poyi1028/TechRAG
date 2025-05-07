import pandas as pd
import io
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any
import uuid

model_name = "all-MiniLM-L6-v2"

model = SentenceTransformer(model_name)
embedding_dim = model.get_sentence_embedding_dimension()
print(f"Embedding dimension: {embedding_dim}")

file_path = "./articles.csv"
df_articles = pd.read_csv(file_path, encoding="latin-1")
print(f"loaded {len(df_articles)} articles")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False
)

processed_chunks: List[Dict[str, Any]] = []

for index, row in df_articles.iterrows():
    article_uri = row["uri"]
    article_title = row["title"]
    article_date = row["published_at"]
    article_content = row["content"]
    article_url = row["url"]

    if isinstance(article_content, str):
        chunks = text_splitter.split_text(article_content)

        if chunks:
            chunk_embeddings = model.encode(chunks, show_progress_bar=False)

            for i, chunk in enumerate(chunks):
                processed_chunks.append({
                    "metadata": {
                        "article_uri": article_uri,
                        "article_title": article_title,
                        "article_date": article_date,
                        "article_url": article_url,
                    },
                    "chunk_id": str(uuid.uuid4()),
                    "chunk_content": chunk,
                    "embedding": chunk_embeddings[i].tolist()
                })  
    
    else:
        print(f"Skipping article {article_uri} due to non-string content")

embedded_df = pd.DataFrame(processed_chunks)
embedded_df.to_json("embedded_chunks_for_qdrant.json", orient="records", lines=True)