import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchModels,
  fetchEvaluations,
  createEvaluation,
  updateEvaluation,
  approveForDeployment,
  interpretResults
} from '../store/slices/aiProjectsSlice'

const ModelEvaluation = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { models, evaluations, currentModel, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)

  const [selectedModelId, setSelectedModelId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showInterpretation, setShowInterpretation] = useState(false)
  const [formData, setFormData] = useState({
    evaluation_name: '',
    evaluation_dataset: '',
    performance_metrics: {},
    confusion_matrix: {},
    feature_importance: {},
    evaluation_notes: ''
  })

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchModels(initiativeId))
    }
  }, [dispatch, initiativeId])

  useEffect(() => {
    if (currentModel) {
      setSelectedModelId(currentModel.id)
      dispatch(fetchEvaluations(currentModel.id))
    }
  }, [currentModel, dispatch])

  useEffect(() => {
    if (selectedModelId) {
      dispatch(fetchEvaluations(selectedModelId))
    }
  }, [selectedModelId, dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedModelId) {
      alert('Please select a model first')
      return
    }

    const data = {
      model_id: selectedModelId,
      ...formData
    }

    if (editingId) {
      dispatch(updateEvaluation({ id: editingId, data }))
    } else {
      dispatch(createEvaluation(data))
    }
    
    resetForm()
  }

  const handleEdit = (evaluation) => {
    setEditingId(evaluation.id)
    setFormData({
      evaluation_name: evaluation.evaluation_name || '',
      evaluation_dataset: evaluation.evaluation_dataset || '',
      performance_metrics: evaluation.performance_metrics || {},
      confusion_matrix: evaluation.confusion_matrix || {},
      feature_importance: evaluation.feature_importance || {},
      evaluation_notes: evaluation.evaluation_notes || ''
    })
    setShowForm(true)
  }

  const handleApprove = (evaluationId) => {
    const approver = prompt('Enter your name:')
    if (approver) {
      dispatch(approveForDeployment({
        id: evaluationId,
        data: { approved_by: approver }
      }))
    }
  }

  const handleInterpretResults = (evaluation) => {
    dispatch(interpretResults({
      initiative_id: parseInt(initiativeId),
      evaluation_metrics: evaluation.performance_metrics || {},
      feature_importance: evaluation.feature_importance || {}
    }))
    setShowInterpretation(true)
  }

  const resetForm = () => {
    setFormData({
      evaluation_name: '',
      evaluation_dataset: '',
      performance_metrics: {},
      confusion_matrix: {},
      feature_importance: {},
      evaluation_notes: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const selectedModel = models?.find(m => m.id === selectedModelId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 5: Model Evaluation</h1>
            <p className="mt-2 text-gray-600">
              Test model performance and validate for deployment
            </p>
          </div>
          <button
            onClick={() => navigate(`/ai-projects/${initiativeId}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Model to Evaluate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models && models.length > 0 ? (
            models.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedModelId === model.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <div className="font-bold text-gray-900">{model.model_name}</div>
                <div className="text-sm text-gray-600">v{model.model_version}</div>
                <div className="text-xs text-gray-500 mt-1">{model.algorithm}</div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-8">
              No models available. Create a model first.
            </div>
          )}
        </div>
        {selectedModel && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Evaluation for {selectedModel.model_name}
          </button>
        )}
      </div>

      {/* AI Interpretation */}
      {showInterpretation && aiResults.interpretation && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">🤖 AI Model Interpretation</h2>
          <div className="space-y-4">
            {aiResults.interpretation.overall_interpretation && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Overall Assessment:</h3>
                <p className="text-purple-700">{aiResults.interpretation.overall_interpretation}</p>
              </div>
            )}
            
            {aiResults.interpretation.key_insights && aiResults.interpretation.key_insights.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Key Insights:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.interpretation.key_insights.map((insight, idx) => (
                    <li key={idx} className="text-purple-700">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {aiResults.interpretation.strengths && aiResults.interpretation.strengths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">✓ Strengths:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {aiResults.interpretation.strengths.map((strength, idx) => (
                      <li key={idx} className="text-green-700">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {aiResults.interpretation.weaknesses && aiResults.interpretation.weaknesses.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">⚠ Weaknesses:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {aiResults.interpretation.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-red-700">{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {aiResults.interpretation.recommendations && aiResults.interpretation.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.interpretation.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-purple-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {aiResults.interpretation.production_readiness && (
              <div className="p-4 bg-white rounded border-2 border-purple-300">
                <h3 className="font-semibold text-purple-900 mb-2">Production Readiness:</h3>
                <p className="text-purple-800 font-medium">{aiResults.interpretation.production_readiness}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && selectedModel && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Evaluation' : `New Evaluation for ${selectedModel.model_name}`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Name *</label>
              <input
                type="text"
                value={formData.evaluation_name}
                onChange={(e) => setFormData({ ...formData, evaluation_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Test Set Evaluation"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Dataset</label>
              <input
                type="text"
                value={formData.evaluation_dataset}
                onChange={(e) => setFormData({ ...formData, evaluation_dataset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="test.csv"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Performance Metrics (JSON)</label>
            <textarea
              value={JSON.stringify(formData.performance_metrics, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, performance_metrics: JSON.parse(e.target.value) })
                } catch (error) {
                  // Invalid JSON
                }
              }}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"accuracy": 0.95, "precision": 0.93, "recall": 0.92, "f1_score": 0.925}'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confusion Matrix (JSON)</label>
            <textarea
              value={JSON.stringify(formData.confusion_matrix, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, confusion_matrix: JSON.parse(e.target.value) })
                } catch (error) {
                  // Invalid JSON
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"TP": 850, "TN": 900, "FP": 50, "FN": 100}'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feature Importance (JSON)</label>
            <textarea
              value={JSON.stringify(formData.feature_importance, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, feature_importance: JSON.parse(e.target.value) })
                } catch (error) {
                  // Invalid JSON
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"feature1": 0.35, "feature2": 0.25, "feature3": 0.20}'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Notes</label>
            <textarea
              value={formData.evaluation_notes}
              onChange={(e) => setFormData({ ...formData, evaluation_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Add any observations, strengths, weaknesses, or recommendations..."
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Evaluations List */}
      {selectedModelId && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Evaluations for {selectedModel?.model_name}
          </h2>
          {evaluations && evaluations.length > 0 ? (
            evaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{evaluation.evaluation_name}</h3>
                      {evaluation.approved_for_deployment && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ✓ Approved for Deployment
                        </span>
                      )}
                    </div>
                    {evaluation.evaluation_dataset && (
                      <p className="text-sm text-gray-600">Dataset: {evaluation.evaluation_dataset}</p>
                    )}
                    {evaluation.evaluation_date && (
                      <p className="text-xs text-gray-500">
                        Evaluated: {new Date(evaluation.evaluation_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleInterpretResults(evaluation)}
                      disabled={aiLoading}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      🤖 Interpret
                    </button>
                    {!evaluation.approved_for_deployment && (
                      <button
                        onClick={() => handleApprove(evaluation.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        ✓ Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(evaluation)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {/* Performance Metrics */}
                {evaluation.performance_metrics && Object.keys(evaluation.performance_metrics).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Performance Metrics:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Object.entries(evaluation.performance_metrics).map(([key, value]) => (
                        <div key={key} className="bg-blue-50 p-3 rounded">
                          <div className="text-xs text-blue-700 mb-1 capitalize">{key.replace('_', ' ')}</div>
                          <div className="text-lg font-bold text-blue-900">
                            {typeof value === 'number' ? value.toFixed(4) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confusion Matrix */}
                {evaluation.confusion_matrix && Object.keys(evaluation.confusion_matrix).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Confusion Matrix:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(evaluation.confusion_matrix).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-600 mb-1">{key}</div>
                          <div className="text-lg font-bold text-gray-900">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Importance */}
                {evaluation.feature_importance && Object.keys(evaluation.feature_importance).length > 0 && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                      View Feature Importance
                    </summary>
                    <div className="mt-2 space-y-2">
                      {Object.entries(evaluation.feature_importance)
                        .sort(([, a], [, b]) => b - a)
                        .map(([feature, importance]) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <div className="w-32 text-sm text-gray-700">{feature}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div
                                className="bg-blue-600 h-4 rounded-full"
                                style={{ width: `${importance * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-16 text-sm text-gray-600 text-right">
                              {(importance * 100).toFixed(1)}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </details>
                )}

                {/* Notes */}
                {evaluation.evaluation_notes && (
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{evaluation.evaluation_notes}</p>
                  </div>
                )}

                {/* Approval Info */}
                {evaluation.approved_for_deployment && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="text-sm text-green-800">
                      <strong>Approved by:</strong> {evaluation.approved_by || 'Unknown'}
                      {evaluation.approval_date && (
                        <span className="ml-2">
                          on {new Date(evaluation.approval_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-gray-400 text-lg mb-4">No evaluations yet</div>
              <p className="text-gray-500 mb-6">
                Add an evaluation to test and validate this model's performance.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add First Evaluation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ModelEvaluation
