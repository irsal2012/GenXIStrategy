import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

// PMI-CPMAI Seven Patterns
const PMI_PATTERNS = [
  {
    name: "Hyperpersonalization",
    description: "Uses machine learning to build and continually refine unique profiles for individuals so systems can tailor experiences, recommendations, or interactions specifically to each person.",
    icon: "👤",
    examples: ["Personalized product recommendations", "Customized content feeds", "Individual treatment plans"]
  },
  {
    name: "Conversational & Human Interaction",
    description: "Enables natural communication between humans and machines (voice, text, etc.), including chatbots, assistants, translation, summarization, and generative content creation.",
    icon: "💬",
    examples: ["Customer service chatbots", "Virtual assistants", "Language translation", "Content generation"]
  },
  {
    name: "Recognition",
    description: "Lets AI perceive and interpret unstructured sensory data — e.g., images, audio, handwriting, text — and convert it into structured information for action or analysis.",
    icon: "👁️",
    examples: ["Image recognition", "Speech-to-text", "OCR", "Facial recognition"]
  },
  {
    name: "Pattern & Anomaly Detection",
    description: "Learns what 'normal' looks like in data and identifies structure, outliers, correlations, or unusual behavior — widely used in fraud detection, quality control, and risk monitoring.",
    icon: "🔍",
    examples: ["Fraud detection", "Quality control", "Network intrusion detection", "Equipment failure prediction"]
  },
  {
    name: "Predictive Analytics & Decision Support",
    description: "Forecasts future outcomes, trends, or risks based on historical and real-time data to inform human decision-making.",
    icon: "📈",
    examples: ["Sales forecasting", "Churn prediction", "Demand planning", "Risk assessment"]
  },
  {
    name: "Goal-Driven Systems",
    description: "Uses feedback and optimization (e.g., reinforcement learning) to pursue defined goals by learning strategies that maximize reward through trial and error.",
    icon: "🎯",
    examples: ["Game AI", "Resource optimization", "Dynamic pricing", "Route optimization"]
  },
  {
    name: "Autonomous Systems",
    description: "AI agents that perceive, decide, and act toward goals with minimal human intervention — from self-driving vehicles to autonomous robots or intelligent software agents.",
    icon: "🤖",
    examples: ["Self-driving vehicles", "Autonomous drones", "Robotic process automation", "Smart manufacturing"]
  }
]

const WORKFLOW_STEPS = {
  DEFINE_PROBLEM: 1,
  CLASSIFY_PATTERN: 2,
  FIND_INITIATIVES: 3,
  SELECT_INITIATIVE: 4
}

const BusinessUnderstandingNew = () => {
  const navigate = useNavigate()
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS.DEFINE_PROBLEM)
  const [businessProblem, setBusinessProblem] = useState('')
  const [classifiedPattern, setClassifiedPattern] = useState(null)
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [similarInitiatives, setSimilarInitiatives] = useState([])
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [selectedInitiative, setSelectedInitiative] = useState(null)
  const [showNoMatchModal, setShowNoMatchModal] = useState(false)
  const [noMatchFeedback, setNoMatchFeedback] = useState('')
  
  // Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 1: Define Business Problem
  const handleAnalyzeProblem = async () => {
    if (businessProblem.length < 100) {
      setError('Please provide at least 100 characters to describe your business problem.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Step 2: Classify AI Pattern
      const patternResponse = await axios.post('/ai-projects/pmi-cpmai/classify-pattern', null, {
        params: { business_problem: businessProblem }
      })

      if (patternResponse.data.success) {
        const patternData = patternResponse.data.data
        setClassifiedPattern(patternData)
        setSelectedPattern(patternData.primary_pattern)
        setCurrentStep(WORKFLOW_STEPS.CLASSIFY_PATTERN)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error analyzing business problem')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Find Similar Initiatives
  const handleConfirmPattern = async () => {
    setLoading(true)
    setError(null)

    try {
      const searchResponse = await axios.post('/ai-projects/pmi-cpmai/find-similar-initiatives', null, {
        params: {
          business_problem: businessProblem,
          ai_pattern: selectedPattern,
          top_k: 10
        }
      })

      if (searchResponse.data.success) {
        const initiatives = searchResponse.data.data.initiatives
        setSimilarInitiatives(initiatives)

        if (initiatives.length > 0) {
          // Get AI recommendation
          const recommendResponse = await axios.post('/ai-projects/pmi-cpmai/recommend-initiative', {
            business_problem: businessProblem,
            ai_pattern: selectedPattern,
            similar_initiatives: initiatives
          })

          if (recommendResponse.data.success) {
            setAiRecommendation(recommendResponse.data.data)
          }
        }

        setCurrentStep(WORKFLOW_STEPS.FIND_INITIATIVES)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error finding similar initiatives')
    } finally {
      setLoading(false)
    }
  }

  // Search initiatives by pattern only (without business problem text)
  const handleSearchByPattern = async () => {
    if (!selectedPattern) {
      setError('Please select an AI pattern first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a generic search query based on the pattern
      const patternInfo = PMI_PATTERNS.find(p => p.name === selectedPattern)
      const searchQuery = patternInfo ? patternInfo.description : selectedPattern

      const searchResponse = await axios.post('/ai-projects/pmi-cpmai/find-similar-initiatives', null, {
        params: {
          business_problem: searchQuery,
          ai_pattern: selectedPattern,
          top_k: 10
        }
      })

      if (searchResponse.data.success) {
        const initiatives = searchResponse.data.data.initiatives
        setSimilarInitiatives(initiatives)
        setAiRecommendation(null) // Clear AI recommendation for pattern-only search
        setCurrentStep(WORKFLOW_STEPS.FIND_INITIATIVES)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error finding similar initiatives')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Link to Initiative
  const handleSelectInitiative = async (initiativeId) => {
    setLoading(true)
    setError(null)

    try {
      await axios.post('/ai-projects/pmi-cpmai/link-business-understanding', null, {
        params: {
          initiative_id: initiativeId,
          business_problem_text: businessProblem,
          ai_pattern: selectedPattern,
          ai_pattern_confidence: classifiedPattern.confidence,
          ai_pattern_reasoning: classifiedPattern.reasoning,
          pattern_override: selectedPattern !== classifiedPattern.primary_pattern,
          similar_initiatives_found: similarInitiatives.map(i => ({ id: i.initiative_id, score: i.similarity_score })),
          ai_recommended_initiative_id: aiRecommendation?.recommended_initiative_id,
          ai_recommendation_reasoning: aiRecommendation?.reasoning
        }
      })

      // Navigate to the initiative's business understanding page
      navigate(`/ai-projects/${initiativeId}/business-understanding`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error linking business understanding')
    } finally {
      setLoading(false)
    }
  }

  // Submit no-match feedback
  const handleSubmitNoMatchFeedback = async () => {
    try {
      await axios.post('/ai-projects/pmi-cpmai/submit-no-match-feedback', null, {
        params: {
          business_problem_text: businessProblem,
          ai_pattern: selectedPattern,
          feedback_text: noMatchFeedback
        }
      })
      setShowNoMatchModal(false)
      setNoMatchFeedback('')
      alert('Thank you for your feedback! An administrator will review your request.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error submitting feedback')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">Define your business problem and match it to an existing initiative</h1>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Define Business Problem */}
      {currentStep === WORKFLOW_STEPS.DEFINE_PROBLEM && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Define Your Business Problem</h2>
          <p className="text-gray-600 mb-4">
            Describe the business problem you're trying to solve with AI. Be specific about the challenge, desired outcomes, and context.
          </p>
          
          <textarea
            value={businessProblem}
            onChange={(e) => setBusinessProblem(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Example: We need to reduce customer churn by predicting which customers are likely to leave and proactively engaging them with personalized offers. Our current churn rate is 15% annually, and we want to reduce it to under 10%..."
          />
          
          <div className="mt-2 flex justify-between items-center">
            <span className={`text-sm ${businessProblem.length >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
              {businessProblem.length} / 100 characters minimum
            </span>
          </div>

          <button
            onClick={handleAnalyzeProblem}
            disabled={loading || businessProblem.length < 100}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : '🤖 Analyze Problem & Classify Pattern'}
          </button>
        </div>
      )}

      {/* Step 2: Classify AI Pattern */}
      {currentStep === WORKFLOW_STEPS.CLASSIFY_PATTERN && classifiedPattern && (
        <div className="space-y-6">
          {/* AI Classification Result */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">🤖 AI Pattern Classification</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-purple-700 mb-1">Suggested Pattern</div>
                <div className="text-2xl font-bold text-purple-900">{classifiedPattern.primary_pattern}</div>
              </div>
              <div>
                <div className="text-sm text-purple-700 mb-1">Confidence</div>
                <div className="text-xl font-bold text-purple-900">{(classifiedPattern.confidence * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-purple-700 mb-1 font-semibold">Reasoning</div>
                <p className="text-purple-800">{classifiedPattern.reasoning}</p>
              </div>
              {classifiedPattern.key_indicators && classifiedPattern.key_indicators.length > 0 && (
                <div>
                  <div className="text-sm text-purple-700 mb-1 font-semibold">Key Indicators</div>
                  <ul className="list-disc list-inside space-y-1">
                    {classifiedPattern.key_indicators.map((indicator, idx) => (
                      <li key={idx} className="text-purple-800">{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Pattern Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Confirm or Change AI Pattern</h2>
            <p className="text-gray-600 mb-6">
              Review the AI's suggestion and select the pattern that best fits your business problem.
            </p>

            {/* Dropdown Pattern Selector with Button */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select AI Pattern
              </label>
              <div className="flex gap-3">
                <select
                  value={selectedPattern || ''}
                  onChange={(e) => setSelectedPattern(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="">-- Select a Pattern --</option>
                  {PMI_PATTERNS.map((pattern) => (
                    <option key={pattern.name} value={pattern.name}>
                      {pattern.icon} {pattern.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSearchByPattern}
                  disabled={loading || !selectedPattern}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Searching...' : '🔍 Search by Pattern'}
                </button>
              </div>

              {/* Show selected pattern details */}
              {selectedPattern && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {PMI_PATTERNS.filter(p => p.name === selectedPattern).map((pattern) => (
                    <div key={pattern.name}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{pattern.icon}</span>
                        <h3 className="font-bold text-lg text-gray-900">{pattern.name}</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{pattern.description}</p>
                      <div>
                        <div className="text-xs text-gray-600 font-semibold mb-1">Examples:</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          {pattern.examples.map((ex, idx) => (
                            <li key={idx}>{ex}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleConfirmPattern}
              disabled={loading || !selectedPattern}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : '🔍 Find Similar Initiatives'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 & 4: Similar Initiatives & Selection */}
      {currentStep >= WORKFLOW_STEPS.FIND_INITIATIVES && (
        <div className="space-y-6">
          {/* AI Recommendation */}
          {aiRecommendation && aiRecommendation.recommended_initiative_id && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-900 mb-4">🤖 AI Recommendation</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-green-700 mb-1">Recommended Initiative</div>
                  <div className="text-xl font-bold text-green-900">
                    Initiative #{aiRecommendation.recommended_initiative_id}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-700 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-green-900">
                    {(aiRecommendation.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-700 mb-1 font-semibold">Reasoning</div>
                  <p className="text-green-800">{aiRecommendation.reasoning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Similar Initiatives List */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Step 3: Select an Initiative ({similarInitiatives.length} found)
              </h2>
              <button
                onClick={() => setShowNoMatchModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                None of these match?
              </button>
            </div>

            {similarInitiatives.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No similar initiatives found.</p>
                <button
                  onClick={() => setShowNoMatchModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Provide Feedback
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {similarInitiatives.map((initiative) => (
                  <div
                    key={initiative.initiative_id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedInitiative === initiative.initiative_id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    } ${
                      aiRecommendation?.recommended_initiative_id === initiative.initiative_id
                        ? 'ring-2 ring-green-400'
                        : ''
                    }`}
                    onClick={() => setSelectedInitiative(initiative.initiative_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-gray-900">{initiative.title}</h3>
                          {aiRecommendation?.recommended_initiative_id === initiative.initiative_id && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              AI Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{initiative.description}</p>
                        {initiative.business_objective && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Objective:</strong> {initiative.business_objective}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-sm">
                          <span className="text-gray-600">
                            <strong>Status:</strong> {initiative.status}
                          </span>
                          {initiative.ai_pattern && (
                            <span className="text-gray-600">
                              <strong>Pattern:</strong> {initiative.ai_pattern}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {initiative.similarity_percentage}%
                        </div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedInitiative && (
              <button
                onClick={() => handleSelectInitiative(selectedInitiative)}
                disabled={loading}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Linking...' : '✓ Confirm Selection & Continue'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* No Match Feedback Modal */}
      {showNoMatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">No Good Match Found?</h3>
            <p className="text-gray-600 mb-4">
              Please provide feedback about why none of these initiatives match your needs. An administrator will review your request.
            </p>
            <textarea
              value={noMatchFeedback}
              onChange={(e) => setNoMatchFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what's missing or different about your needs..."
            />
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleSubmitNoMatchFeedback}
                disabled={!noMatchFeedback.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => setShowNoMatchModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessUnderstandingNew
