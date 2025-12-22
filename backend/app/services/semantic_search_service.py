"""
Semantic Search Service
Provides semantic search capabilities using OpenAI embeddings for initiative matching.
Stores embeddings in JSON file for simplicity and portability.
"""

import json
import os
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime
from openai import OpenAI
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class SemanticSearchService:
    """
    Service for semantic search using OpenAI embeddings.
    Stores embeddings in JSON file for easy management.
    """
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.embedding_model = "text-embedding-3-small"  # 1536 dimensions, cost-effective
        self.embedding_dimension = 1536
        self.embeddings_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data",
            "initiative_embeddings.json"
        )
        self.embeddings_cache = None
        self.cache_loaded = False
        
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.embeddings_file), exist_ok=True)
        
        # Initialize embeddings file if it doesn't exist
        if not os.path.exists(self.embeddings_file):
            self._initialize_embeddings_file()
    
    def _initialize_embeddings_file(self):
        """Initialize empty embeddings file."""
        initial_data = {
            "embeddings": [],
            "metadata": {
                "model": self.embedding_model,
                "dimension": self.embedding_dimension,
                "last_updated": datetime.utcnow().isoformat(),
                "total_initiatives": 0
            }
        }
        with open(self.embeddings_file, 'w') as f:
            json.dump(initial_data, f, indent=2)
        logger.info(f"Initialized embeddings file at {self.embeddings_file}")
    
    def _load_embeddings(self) -> Dict[str, Any]:
        """Load embeddings from JSON file."""
        if self.cache_loaded and self.embeddings_cache is not None:
            return self.embeddings_cache
        
        try:
            with open(self.embeddings_file, 'r') as f:
                self.embeddings_cache = json.load(f)
                self.cache_loaded = True
                return self.embeddings_cache
        except Exception as e:
            logger.error(f"Error loading embeddings: {e}")
            self._initialize_embeddings_file()
            return self._load_embeddings()
    
    def _save_embeddings(self, data: Dict[str, Any]):
        """Save embeddings to JSON file."""
        try:
            data["metadata"]["last_updated"] = datetime.utcnow().isoformat()
            data["metadata"]["total_initiatives"] = len(data["embeddings"])
            
            with open(self.embeddings_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Update cache
            self.embeddings_cache = data
            self.cache_loaded = True
            
            logger.info(f"Saved {len(data['embeddings'])} embeddings to file")
        except Exception as e:
            logger.error(f"Error saving embeddings: {e}")
            raise
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for given text using OpenAI.
        
        Args:
            text: Text to generate embedding for
            
        Returns:
            List of floats representing the embedding vector
        """
        try:
            # Clean and prepare text
            text = text.strip()
            if not text:
                raise ValueError("Text cannot be empty")
            
            # Generate embedding
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding of dimension {len(embedding)}")
            
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
    
    async def store_initiative_embedding(
        self,
        initiative_id: int,
        title: str,
        description: str,
        business_objective: str = "",
        ai_pattern: str = "",
        status: str = ""
    ):
        """
        Generate and store embedding for an initiative.
        
        Args:
            initiative_id: Initiative ID
            title: Initiative title
            description: Initiative description
            business_objective: Business objective (optional)
            ai_pattern: AI pattern (optional)
            status: Initiative status (optional)
        """
        try:
            # Combine text fields for embedding
            combined_text = f"{title}\n{description}"
            if business_objective:
                combined_text += f"\n{business_objective}"
            
            # Generate embedding
            embedding = await self.generate_embedding(combined_text)
            
            # Load existing embeddings
            data = self._load_embeddings()
            
            # Remove existing embedding for this initiative if it exists
            data["embeddings"] = [
                e for e in data["embeddings"] 
                if e["initiative_id"] != initiative_id
            ]
            
            # Add new embedding
            data["embeddings"].append({
                "initiative_id": initiative_id,
                "title": title,
                "description": description,
                "business_objective": business_objective,
                "ai_pattern": ai_pattern,
                "status": status,
                "embedding": embedding,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            })
            
            # Save to file
            self._save_embeddings(data)
            
            logger.info(f"Stored embedding for initiative {initiative_id}")
        except Exception as e:
            logger.error(f"Error storing initiative embedding: {e}")
            raise
    
    async def find_similar_initiatives(
        self,
        query_text: str,
        top_k: int = 10,
        status_filter: Optional[List[str]] = None,
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Find similar initiatives using semantic search.
        
        Args:
            query_text: Text to search for
            top_k: Number of results to return
            status_filter: List of statuses to filter by (e.g., ['ideation', 'planning'])
            min_similarity: Minimum similarity score (0-1)
            
        Returns:
            List of similar initiatives with similarity scores
        """
        try:
            # Generate query embedding
            query_embedding = await self.generate_embedding(query_text)
            
            # Load embeddings
            data = self._load_embeddings()
            
            if not data["embeddings"]:
                logger.warning("No embeddings found in database")
                return []
            
            # Calculate similarities
            results = []
            for item in data["embeddings"]:
                # Apply status filter if provided
                if status_filter and item.get("status") not in status_filter:
                    continue
                
                similarity = self._cosine_similarity(query_embedding, item["embedding"])
                
                # Only include if above minimum similarity
                if similarity >= min_similarity:
                    results.append({
                        "initiative_id": item["initiative_id"],
                        "title": item["title"],
                        "description": item["description"],
                        "business_objective": item.get("business_objective", ""),
                        "ai_pattern": item.get("ai_pattern", ""),
                        "status": item.get("status", ""),
                        "similarity_score": round(similarity, 4),
                        "similarity_percentage": round(similarity * 100, 2)
                    })
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            # Return top K results
            return results[:top_k]
        except Exception as e:
            logger.error(f"Error finding similar initiatives: {e}")
            raise
    
    async def find_similar_initiatives_by_pattern(
        self,
        query_text: str,
        ai_pattern: str,
        top_k: int = 10,
        status_filter: Optional[List[str]] = None,
        min_similarity: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Find similar initiatives filtered by AI pattern first, then ranked by similarity.
        This provides a hybrid search: filter by pattern, then semantic ranking.
        
        Args:
            query_text: User's business problem text to search for
            ai_pattern: AI pattern to filter by (e.g., "Predictive Analytics & Decision Support")
            top_k: Number of results to return
            status_filter: List of statuses to filter by (e.g., ['ideation', 'planning'])
            min_similarity: Minimum similarity score (0-1)
            
        Returns:
            List of similar initiatives with the specified pattern, ranked by similarity
        """
        try:
            # Generate query embedding from user's business problem
            query_embedding = await self.generate_embedding(query_text)
            
            # Load embeddings
            data = self._load_embeddings()
            
            if not data["embeddings"]:
                logger.warning("No embeddings found in database")
                return []
            
            # Calculate similarities ONLY for initiatives with matching pattern
            results = []
            for item in data["embeddings"]:
                # FILTER: Only include initiatives with the selected AI pattern
                if item.get("ai_pattern") != ai_pattern:
                    continue
                
                # Apply status filter if provided
                if status_filter and item.get("status") not in status_filter:
                    continue
                
                # Calculate similarity to user's business problem
                similarity = self._cosine_similarity(query_embedding, item["embedding"])
                
                # Only include if above minimum similarity
                if similarity >= min_similarity:
                    results.append({
                        "initiative_id": item["initiative_id"],
                        "title": item["title"],
                        "description": item["description"],
                        "business_objective": item.get("business_objective", ""),
                        "ai_pattern": item.get("ai_pattern", ""),
                        "status": item.get("status", ""),
                        "similarity_score": round(similarity, 4),
                        "similarity_percentage": round(similarity * 100, 2)
                    })
            
            # Sort by similarity (highest first)
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            # Return top K results
            logger.info(f"Found {len(results)} initiatives with pattern '{ai_pattern}', returning top {min(top_k, len(results))}")
            return results[:top_k]
        except Exception as e:
            logger.error(f"Error finding similar initiatives by pattern: {e}")
            raise
    
    def fallback_keyword_search(
        self,
        query_text: str,
        initiatives: List[Dict[str, Any]],
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fallback keyword-based search when semantic search returns too few results.
        
        Args:
            query_text: Text to search for
            initiatives: List of all initiatives
            top_k: Number of results to return
            
        Returns:
            List of matching initiatives with match scores
        """
        try:
            query_words = set(query_text.lower().split())
            results = []
            
            for initiative in initiatives:
                # Combine searchable text
                searchable_text = f"{initiative.get('title', '')} {initiative.get('description', '')} {initiative.get('business_objective', '')}".lower()
                searchable_words = set(searchable_text.split())
                
                # Calculate word overlap
                common_words = query_words.intersection(searchable_words)
                if common_words:
                    match_score = len(common_words) / len(query_words)
                    
                    results.append({
                        "initiative_id": initiative["id"],
                        "title": initiative.get("title", ""),
                        "description": initiative.get("description", ""),
                        "business_objective": initiative.get("business_objective", ""),
                        "ai_pattern": initiative.get("ai_pattern", ""),
                        "status": initiative.get("status", ""),
                        "similarity_score": round(match_score, 4),
                        "similarity_percentage": round(match_score * 100, 2),
                        "search_method": "keyword"
                    })
            
            # Sort by match score
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            return results[:top_k]
        except Exception as e:
            logger.error(f"Error in keyword search: {e}")
            return []
    
    async def rebuild_all_embeddings(self, initiatives: List[Dict[str, Any]]):
        """
        Rebuild all embeddings from scratch.
        
        Args:
            initiatives: List of all initiatives with their data
        """
        try:
            logger.info(f"Rebuilding embeddings for {len(initiatives)} initiatives")
            
            # Initialize fresh embeddings data
            data = {
                "embeddings": [],
                "metadata": {
                    "model": self.embedding_model,
                    "dimension": self.embedding_dimension,
                    "last_updated": datetime.utcnow().isoformat(),
                    "total_initiatives": 0
                }
            }
            
            # Generate embeddings for each initiative
            for initiative in initiatives:
                await self.store_initiative_embedding(
                    initiative_id=initiative["id"],
                    title=initiative.get("title", ""),
                    description=initiative.get("description", ""),
                    business_objective=initiative.get("business_objective", ""),
                    ai_pattern=initiative.get("ai_pattern", ""),
                    status=initiative.get("status", "")
                )
            
            logger.info(f"Successfully rebuilt {len(initiatives)} embeddings")
        except Exception as e:
            logger.error(f"Error rebuilding embeddings: {e}")
            raise
    
    def delete_initiative_embedding(self, initiative_id: int):
        """
        Delete embedding for a specific initiative.
        
        Args:
            initiative_id: Initiative ID to delete
        """
        try:
            data = self._load_embeddings()
            
            original_count = len(data["embeddings"])
            data["embeddings"] = [
                e for e in data["embeddings"] 
                if e["initiative_id"] != initiative_id
            ]
            
            if len(data["embeddings"]) < original_count:
                self._save_embeddings(data)
                logger.info(f"Deleted embedding for initiative {initiative_id}")
            else:
                logger.warning(f"No embedding found for initiative {initiative_id}")
        except Exception as e:
            logger.error(f"Error deleting initiative embedding: {e}")
            raise


# Singleton instance
semantic_search_service = SemanticSearchService()
