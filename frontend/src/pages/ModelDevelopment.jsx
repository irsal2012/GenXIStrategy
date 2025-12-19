import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchModels,
  createModel,
  updateModel,
  startTraining,
  completeTraining,
  suggestHyperparameters,
  setCurrentModel
} from '../store/slices/aiProjectsSlice'

const ModelDevelopment = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { models, currentModel, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showHyperparameters, setShowHyperparameters] = useState(false)
  const [formData, setFormData] = useState({
    model_name: '',
    model_version: '1.0.0',
    model_description: '',
    model_type: 'classification',
    algorithm: '',
    framework: 'scikit-learn',
    hyperparameters: {},
    training_dataset: '',
    validation_dataset: ''
  })

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchModels(initiativeId))
    }
  }, [dispatch, initiativeId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      initiative_id: parseInt(initiativeId),
      ...formData
    }

    if (editingId) {
      dispatch(updateModel({ id: editingId, data }))
    } else {
      dispatch(createModel(data))
    }
    
    resetForm()
  }

  const handleEdit = (model) => {
    setEditingId(model.id)
    setFormData({
      model_name: model.model_name || '',
      model_version: model.model_version || '1.0.0',
      model_description: model.model_description || '',
      model_type: model.model_type || 'classification',
      algorithm: model.algorithm || '',
      framework: model.framework || 'scikit-learn',
      hyperparameters: model.hyperparameters || {},
      training_dataset: model.training_dataset || '',
      validation_dataset: model.validation_dataset || ''
    })
    setShowForm(true)
  }

  const handleStartTraining = (modelId) => {
    dispatch(startTraining(modelId))
  }

  const handleCompleteTraining = (modelId) => {
    const metrics = prompt('Enter final metrics (JSON format):')
    if (metrics) {
      try {
        const parsedMetrics = JSON.parse(metrics)
        dispatch(completeTraining({ id: modelId, data: { final_metrics: parsedMetrics } }))
      } catch (error) {
        alert('Invalid JSON format')
      }
    }
  }

  const handleSuggestHyperparameters = () => {
    if (formData.model_type && formData.algorithm) {
      dispatch(suggestHyperparameters({
        initiative_id: parseInt(initiativeId),
        model_type: formData.model_type,
        algorithm: formData.algorithm,
        dataset_characteristics: {}
      }))
      setShowHyperparameters(true)
    } else {
      alert('Please select model type and algorithm first')
    }
  }

  const applyAISuggestions = () => {
    if (aiResults.hyperparameters?.suggested_hyperparameters) {
      setFormData({
        ...formData,
        hyperparameters: aiResults.hyperparameters.suggested_hyperparameters
      })
    }
  }

  const resetForm = () => {
    setFormData({
      model_name: '',
      model_version: '1.0.0',
      model_description: '',
      model_type: 'classification',
      algorithm: '',
      framework: 'scikit-learn',
      hyperparameters: {},
      training_dataset: '',
      validation_dataset: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'training': return 'bg-blue-100 text-blue-800 animate-pulse'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 4: Model Development</h1>
            <p className="mt-2 text-gray-600">
              Train and version AI models with hyperparameter optimization
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Create Model'}
            </button>
            <button
              onClick={() => navigate(`/ai-projects/${initiativeId}`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* AI Hyperparameter Suggestions */}
      {showHyperparameters && aiResults.hyperparameters && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">🤖 AI Hyperparameter Suggestions</h2>
          <div className="space-y-4">
            {aiResults.hyperparameters.suggested_hyperparameters && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Suggested Hyperparameters:</h3>
                <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(aiResults.hyperparameters.suggested_hyperparameters, null, 2)}
                </pre>
                <button
                  onClick={applyAISuggestions}
                  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Apply These Suggestions
                </button>
              </div>
            )}
            
            {aiResults.hyperparameters.rationale && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Rationale:</h3>
                <p className="text-purple-700">{aiResults.hyperparameters.rationale}</p>
              </div>
            )}
            
            {aiResults.hyperparameters.expected_performance_range && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Expected Performance:</h3>
                <p className="text-purple-700">{aiResults.hyperparameters.expected_performance_range}</p>
              </div>
            )}
            
            {aiResults.hyperparameters.training_tips && aiResults.hyperparameters.training_tips.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Training Tips:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.hyperparameters.training_tips.map((tip, idx) => (
                    <li key={idx} className="text-purple-700">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Model' : 'Create New Model'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
              <input
                type="text"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Customer Churn Predictor"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
              <input
                type="text"
                value={formData.model_version}
                onChange={(e) => setFormData({ ...formData, model_version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="1.0.0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.model_description}
              onChange={(e) => setFormData({ ...formData, model_description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Type *</label>
              <select
                value={formData.model_type}
                onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="classification">Classification</option>
                <option value="regression">Regression</option>
                <option value="clustering">Clustering</option>
                <option value="time_series">Time Series</option>
                <option value="nlp">NLP</option>
                <option value="computer_vision">Computer Vision</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm *</label>
              <input
                type="text"
                value={formData.algorithm}
                onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., random_forest, xgboost"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Framework *</label>
              <select
                value={formData.framework}
                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="scikit-learn">Scikit-learn</option>
                <option value="tensorflow">TensorFlow</option>
                <option value="pytorch">PyTorch</option>
                <option value="xgboost">XGBoost</option>
                <option value="lightgbm">LightGBM</option>
                <option value="keras">Keras</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Training Dataset</label>
              <input
                type="text"
                value={formData.training_dataset}
                onChange={(e) => setFormData({ ...formData, training_dataset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="train.csv"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validation Dataset</label>
              <input
                type="text"
                value={formData.validation_dataset}
                onChange={(e) => setFormData({ ...formData, validation_dataset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="val.csv"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hyperparameters (JSON)</label>
            <textarea
              value={JSON.stringify(formData.hyperparameters, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, hyperparameters: JSON.parse(e.target.value) })
                } catch (error) {
                  // Invalid JSON, keep as is
                }
              }}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"learning_rate": 0.01, "max_depth": 5}'
            />
            <button
              type="button"
              onClick={handleSuggestHyperparameters}
              disabled={aiLoading}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
            >
              {aiLoading ? 'Analyzing...' : '🤖 Get AI Suggestions'}
            </button>
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

      {/* Models List */}
      <div className="space-y-4">
        {models && models.length > 0 ? (
          models.map((model) => (
            <div key={model.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{model.model_name}</h3>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm font-mono">
                      v{model.model_version}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(model.model_status)}`}>
                      {model.model_status || 'not_started'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{model.model_description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📊 {model.model_type}</span>
                    <span>🔧 {model.algorithm}</span>
                    <span>⚙️ {model.framework}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {model.model_status === 'not_started' && (
                    <button
                      onClick={() => handleStartTraining(model.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      ▶ Start Training
                    </button>
                  )}
                  {model.model_status === 'training' && (
                    <button
                      onClick={() => handleCompleteTraining(model.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      ✓ Complete Training
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(model)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      dispatch(setCurrentModel(model))
                      navigate(`/ai-projects/${initiativeId}/model-evaluation`)
                    }}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    Evaluate →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {model.training_dataset && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Training Data</div>
                    <div className="font-medium text-sm">{model.training_dataset}</div>
                  </div>
                )}
                {model.validation_dataset && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Validation Data</div>
                    <div className="font-medium text-sm">{model.validation_dataset}</div>
                  </div>
                )}
                {model.training_duration_seconds && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Training Duration</div>
                    <div className="font-medium text-sm">{formatDuration(model.training_duration_seconds)}</div>
                  </div>
                )}
                {model.model_artifact_size_mb && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Model Size</div>
                    <div className="font-medium text-sm">{model.model_artifact_size_mb} MB</div>
                  </div>
                )}
              </div>

              {model.hyperparameters && Object.keys(model.hyperparameters).length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                    View Hyperparameters
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(model.hyperparameters, null, 2)}
                  </pre>
                </details>
              )}

              {model.final_metrics && Object.keys(model.final_metrics).length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-semibold text-green-900 mb-2">✓ Training Metrics:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.entries(model.final_metrics).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-green-700">{key}:</span>
                        <span className="ml-1 font-medium text-green-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">No models created yet</div>
            <p className="text-gray-500 mb-6">
              Create your first AI model and start training with AI-powered hyperparameter suggestions.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Create Your First Model
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelDevelopment
