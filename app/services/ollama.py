# app/services/ollama.py
import httpx
import os
from typing import List, Dict, Any, Optional
import json

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")

async def generate(model: str, messages: List[Dict[str, str]], stream: bool = False):
    """
    與 Ollama API 交互以生成回應
    """
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": model,
                    "messages": messages,
                    "stream": stream
                },
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/x-ndjson" if stream else "application/json"
                }
            )
            response.raise_for_status()
            
            # 對於 stream=True，返回迭代器
            if stream:
                async def generate_stream():
                    async for chunk in response.aiter_bytes():
                        if chunk:
                            yield chunk
                
                return generate_stream()
            
            # 對於非流式回應，返回 JSON
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Model '{model}' not found")
            raise e