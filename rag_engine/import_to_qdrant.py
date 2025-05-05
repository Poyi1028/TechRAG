import pandas as pd
import json
from qdrant_client import QdrantClient, models
import numpy as np

# --- 設定集合名稱和向量維度 ---
COLLECTION_NAME = "rag_collection"
VECTOR_DIMENSION = 384

# --- 設定嵌入文件路徑 ---
EMBEDDING_FILE = "embedded_chunks_for_qdrant.json"

# --- 初始化 Qdrant 客戶端 ---
client = QdrantClient(host="localhost", port=6333)

# --- 檢查集合是否存在，不存在則創建 ---
try:
    client.get_collection(collection_name=COLLECTION_NAME)
    print(f"Collection {COLLECTION_NAME} already exists")
except Exception as e:
    print(f"Collection {COLLECTION_NAME} does not exist, creating...")
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(size=VECTOR_DIMENSION, distance=models.Distance.COSINE),
    )
    print(f"Collection {COLLECTION_NAME} created")

# --- 讀取嵌入文件 ---
with open(EMBEDDING_FILE, "r", encoding="utf-8") as f:
    data_list = [json.loads(line) for line in f]
embedded_df = pd.DataFrame(data_list)

print(f"Loaded {len(embedded_df)} rows from {EMBEDDING_FILE}")

# --- 準備要插入的點 ---
points_to_upsert = []

for index, row in embedded_df.iterrows():
    chunk_id = row["chunk_id"]
    chunk_content = row["chunk_content"]
    article_uri = row["article_uri"]
    article_title = row["article_title"]
    article_date = row["article_date"]
    article_url = row["article_url"]
    embedding = row["embedding"]

    # --- 準備點的負責資訊 ---
    payload = {
        "chunk_content": chunk_content,
        "article_uri": article_uri,
        "article_title": article_title,
        "article_date": article_date,
        "article_url": article_url,
    }

    # --- 創建點的結構 ---
    point = models.PointStruct(
        id=str(chunk_id),
        vector=embedding,
        payload=payload
    )

    # --- 將點添加到要插入的列表中 ---
    points_to_upsert.append(point)

# --- 批量導入數據 ---
batch_size = 100
for i in range(0, len(points_to_upsert), batch_size):
    batch = points_to_upsert[i:i+batch_size]
    client.upsert(
        collection_name=COLLECTION_NAME,
        wait=True,
        points=batch
    )
    print(f"Inserted batch {i//batch_size +1}/{(len(points_to_upsert) + batch_size-1)//batch_size}")

print("All points inserted successfully")

collection_info = client.get_collection(collection_name=COLLECTION_NAME)
print("\nCollection Info:")
print(collection_info)