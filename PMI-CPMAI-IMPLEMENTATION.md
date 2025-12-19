# PMI-CPMAI Business Understanding Workflow - Implementation Guide

## Overview

This implementation adds a complete PMI-CPMAI (Certified Professional in Machine Learning and Artificial Intelligence) workflow for Business Understanding phase. The workflow helps users define business problems, classify them into AI patterns, and match them to existing initiatives using semantic search.

## Features Implemented

### ✅ Backend Components

1. **Database Model Updates** (`backend/app/models/ai_project.py`)
   - Added PMI-CPMAI fields to `BusinessUnderstanding` model
   - Fields include: business_problem_text, ai_pattern, ai_pattern_confidence, pattern_override, ai_pattern_reasoning, similar_initiatives_found, ai_recommended_initiative_id, ai_recommendation_reasoning, user_feedback_no_match

2. **Semantic Search Service** (`backend/app/services/semantic_search_service.py`)
   - OpenAI embeddings using `text-embedding-3-small` (1536 dimensions)
   - JSON-based storage in `backend/data/initiative_embeddings.json`
   - Cosine similarity search with fallback keyword search
   - Methods: generate_embedding, store_initiative_embedding, find_similar_initiatives, rebuild_all_embeddings

3. **AI Project Manager Agent** (`backend/app/agents/ai_project_manager_agent.py`)
   - `classify_ai_pattern()` - Classifies business problem into one of 7 PMI patterns
   - `recommend_best_initiative()` - Recommends best matching initiative with detailed reasoning

4. **API Endpoints** (`backend/app/api/endpoints/ai_projects.py`)
   - `POST /api/ai-projects/pmi-cpmai/classify-pattern` - Pattern classification
   - `POST /api/ai-projects/pmi-cpmai/find-similar-initiatives` - Semantic search
   - `POST /api/ai-projects/pmi-cpmai/recommend-initiative` - AI recommendation
   - `POST /api/ai-projects/pmi-cpmai/link-business-understanding` - Link to initiative
   - `POST /api/ai-projects/pmi-cpmai/submit-no-match-feedback` - User feedback
   - `POST /api/ai-projects/pmi-cpmai/rebuild-embeddings` - Admin maintenance

5. **Database Migration** (`backend/app/core/migrate_pmi_cpmai.py`)
   - Manual migration script to add new columns
   - Already executed successfully

### ✅ Frontend Components

1. **New Workflow Page** (`frontend/src/pages/BusinessUnderstandingNew.jsx`)
   - Complete step-by-step PMI-CPMAI workflow
   - 4 steps: Define Problem → Classify Pattern → Find Initiatives → Select Initiative
   - Visual pattern selector with all 7 PMI patterns
   - Similar initiatives list with similarity scores
   - AI recommendation highlighting
   - No-match feedback modal

2. **Route Configuration** (`frontend/src/App.jsx`)
   - Added route: `/pmi-cpmai/business-understanding`

## PMI's Seven Patterns of AI

1. **Hyperpersonalization** 👤
   - Tailors experiences to individuals
   - Examples: Personalized recommendations, customized content

2. **Conversational & Human Interaction** 💬
   - Natural communication with machines
   - Examples: Chatbots, virtual assistants, translation

3. **Recognition** 👁️
   - Interprets unstructured sensory data
   - Examples: Image recognition, speech-to-text, OCR

4. **Pattern & Anomaly Detection** 🔍
   - Identifies outliers and unusual behavior
   - Examples: Fraud detection, quality control

5. **Predictive Analytics & Decision Support** 📈
   - Forecasts future outcomes
   - Examples: Sales forecasting, churn prediction

6. **Goal-Driven Systems** 🎯
   - Optimizes to achieve defined goals
   - Examples: Resource optimization, dynamic pricing

7. **Autonomous Systems** 🤖
   - Acts with minimal human intervention
   - Examples: Self-driving vehicles, autonomous drones

## Workflow Steps

### Step 1: Define Business Problem
- User enters detailed description (minimum 100 characters)
- System validates input

### Step 2: Classify AI Pattern
- AI analyzes problem and suggests primary pattern
- Shows confidence score and reasoning
- User can accept or change to different pattern
- Visual cards for all 7 patterns with descriptions

### Step 3: Find Similar Initiatives
- Semantic search using OpenAI embeddings
- Fallback to keyword search if needed
- Returns top 10 similar initiatives with similarity scores
- Enriched with full initiative data (status, scores, etc.)

### Step 4: AI Recommendation & Selection
- AI recommends best matching initiative
- Shows confidence and detailed reasoning
- User must select one initiative (no create new option)
- Option to provide feedback if no good match

### Step 5: Link & Continue
- Creates/updates BusinessUnderstanding record
- Links to selected initiative
- Navigates to initiative's business understanding page

## Usage

### For Users

1. **Access the Workflow**
   ```
   Navigate to: /pmi-cpmai/business-understanding
   ```

2. **Define Your Problem**
   - Describe your business problem in detail
   - Include context, challenges, and desired outcomes
   - Minimum 100 characters required

3. **Review AI Classification**
   - AI will suggest a pattern
   - Review the reasoning
   - Change if needed

4. **Select Initiative**
   - Review similar initiatives
   - Check AI recommendation
   - Select the best match
   - Provide feedback if no match

### For Administrators

1. **Rebuild Embeddings**
   ```bash
   POST /api/ai-projects/pmi-cpmai/rebuild-embeddings
   ```
   - Run after adding/updating many initiatives
   - Regenerates all embeddings

2. **Review Feedback**
   - Check logs for no-match feedback
   - Consider creating new initiatives based on feedback

## Technical Details

### Semantic Search

**Embedding Model:** OpenAI `text-embedding-3-small`
- Dimensions: 1536
- Cost-effective and accurate
- Suitable for production use

**Storage:** JSON file at `backend/data/initiative_embeddings.json`
```json
{
  "embeddings": [
    {
      "initiative_id": 1,
      "title": "...",
      "description": "...",
      "embedding": [0.123, -0.456, ...],
      "ai_pattern": "...",
      "status": "..."
    }
  ],
  "metadata": {
    "model": "text-embedding-3-small",
    "dimension": 1536,
    "total_initiatives": 100
  }
}
```

**Search Algorithm:**
1. Generate embedding for business problem
2. Calculate cosine similarity with all stored embeddings
3. Filter by status (ideation, planning)
4. Return top K results above minimum threshold
5. Fallback to keyword search if too few results

### AI Pattern Classification

**Prompt Engineering:**
- Includes full descriptions of all 7 PMI patterns
- Provides examples for each pattern
- Asks for confidence score and reasoning
- Returns structured JSON response

**Response Format:**
```json
{
  "primary_pattern": "Predictive Analytics & Decision Support",
  "confidence": 0.92,
  "reasoning": "...",
  "secondary_patterns": ["..."],
  "key_indicators": ["..."],
  "use_case_examples": ["..."]
}
```

### Initiative Recommendation

**Factors Considered:**
1. Semantic similarity score
2. AI pattern alignment
3. Business objective alignment
4. Initiative status (prefer ideation/planning)
5. Potential for reuse or extension

**Response Format:**
```json
{
  "recommended_initiative_id": 15,
  "confidence": 0.89,
  "reasoning": "...",
  "alignment_factors": [
    {"factor": "...", "score": 85, "explanation": "..."}
  ],
  "ranked_alternatives": [
    {"initiative_id": 23, "rank": 2, "reason": "..."}
  ]
}
```

## Configuration

### Environment Variables

Required in `backend/.env`:
```
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo
```

### Adjustable Parameters

In `semantic_search_service.py`:
- `embedding_model` - Change to `text-embedding-3-large` for better quality
- `min_similarity` - Adjust threshold (default: 0.3)
- `top_k` - Number of results to return (default: 10)

In API endpoints:
- `status_filter` - Which initiative statuses to include
- Pattern classification temperature (default: 0.2 for consistency)

## Testing

### Manual Testing Steps

1. **Test Pattern Classification**
   ```bash
   curl -X POST "http://localhost:8000/api/ai-projects/pmi-cpmai/classify-pattern?business_problem=We%20need%20to%20predict%20customer%20churn"
   ```

2. **Test Semantic Search**
   ```bash
   curl -X POST "http://localhost:8000/api/ai-projects/pmi-cpmai/find-similar-initiatives?business_problem=Customer%20churn%20prediction"
   ```

3. **Test Full Workflow**
   - Navigate to `/pmi-cpmai/business-understanding`
   - Enter a business problem
   - Follow through all steps
   - Verify initiative linking

### Expected Behavior

- Pattern classification should return within 2-3 seconds
- Semantic search should return within 1-2 seconds
- Similarity scores should be between 0-100%
- AI recommendations should have confidence > 0.7
- No-match feedback should be logged

## Troubleshooting

### Common Issues

1. **"No embeddings found"**
   - Run rebuild embeddings endpoint
   - Check if `backend/data/initiative_embeddings.json` exists

2. **"OpenAI API key not configured"**
   - Set `OPENAI_API_KEY` in `backend/.env`
   - Restart backend server

3. **Low similarity scores**
   - Check if embeddings are up to date
   - Consider lowering `min_similarity` threshold
   - Verify initiative descriptions are detailed

4. **Pattern classification incorrect**
   - Review business problem description
   - Ensure it's detailed enough (>100 chars)
   - User can manually override

## Future Enhancements

### Potential Improvements

1. **Vector Database**
   - Migrate from JSON to Pinecone/Weaviate for scale
   - Better performance with 1000+ initiatives

2. **Advanced Filtering**
   - Filter by business function, domain, budget
   - Multi-criteria search

3. **Learning from Feedback**
   - Track pattern override patterns
   - Improve classification over time

4. **Batch Processing**
   - Bulk initiative analysis
   - Automated pattern assignment

5. **Analytics Dashboard**
   - Pattern distribution across portfolio
   - Most common business problems
   - Initiative reuse metrics

## Support

For issues or questions:
1. Check logs in `backend/` directory
2. Review API endpoint responses
3. Verify database migration completed
4. Check OpenAI API quota/limits

## Files Modified/Created

### Backend
- ✅ `backend/app/models/ai_project.py` - Updated
- ✅ `backend/app/services/semantic_search_service.py` - Created
- ✅ `backend/app/agents/ai_project_manager_agent.py` - Updated
- ✅ `backend/app/api/endpoints/ai_projects.py` - Updated
- ✅ `backend/app/core/migrate_pmi_cpmai.py` - Created
- ✅ `backend/data/initiative_embeddings.json` - Auto-created

### Frontend
- ✅ `frontend/src/pages/BusinessUnderstandingNew.jsx` - Created
- ✅ `frontend/src/App.jsx` - Updated

## Conclusion

The PMI-CPMAI Business Understanding workflow is now fully implemented and ready for use. Users can define business problems, get AI-powered pattern classification, find similar initiatives through semantic search, and receive intelligent recommendations for initiative matching.

The system enforces the constraint that users must select from existing initiatives (no new initiative creation), ensuring better portfolio management and initiative reuse.
