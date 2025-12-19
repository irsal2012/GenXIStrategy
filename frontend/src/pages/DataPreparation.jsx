import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchDataPreparation,
  createDataPreparation,
  updateDataPreparation
} from '../store/slices/aiProjectsSlice'

const DataPreparation = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { dataPreparation, loading } = useSelector((state) => state.aiProjects)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    step_name: '',
    step_type: 'cleaning',
    step_order: 1,
    input_dataset: '',
    output_dataset: '',
    code_repository: '',
    notebook_link: '',
    pipeline_config: {},
    quality_before: '',
    quality_after: '',
    execution_logs: ''
  })

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchDataPreparation(initiativeId))
    }
  }, [dispatch, initiativeId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      initiative_id: parseInt(initiativeId),
      ...formData,
      step_order: parseInt(formData.step_order) || 1,
      quality_before: parseFloat(formData.quality_before) || null,
      quality_after: parseFloat(formData.quality_after) || null
    }

    if (editingId) {
      dispatch(updateDataPreparation({ id: editingId, data }))
    } else {
      dispatch(createDataPreparation(data))
    }
    
    resetForm()
  }

  const handleEdit = (step) => {
    setEditingId(step.id)
    setFormData({
      step_name: step.step_name || '',
      step_type: step.step_type || 'cleaning',
      step_order: step.step_order?.toString() || '1',
      input_dataset: step.input_dataset || '',
      output_dataset: step.output_dataset || '',
      code_repository: step.code_repository || '',
      notebook_link: step.notebook_link || '',
      pipeline_config: step.pipeline_config || {},
      quality_before: step.quality_before?.toString() || '',
      quality_after: step.quality_after?.toString() || '',
      execution_logs: step.execution_logs || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      step_name: '',
      step_type: 'cleaning',
      step_order: 1,
      input_dataset: '',
      output_dataset: '',
      code_repository: '',
      notebook_link: '',
      pipeline_config: {},
      quality_before: '',
      quality_after: '',
      execution_logs: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getStepTypeColor = (type) => {
    switch (type) {
      case 'cleaning': return 'bg-blue-100 text-blue-800'
      case 'transformation': return 'bg-purple-100 text-purple-800'
      case 'feature_engineering': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateImprovement = (before, after) => {
    if (!before || !after) return null
    const improvement = after - before
    return improvement > 0 ? `+${improvement.toFixed(1)}` : improvement.toFixed(1)
  }

  const sortedSteps = dataPreparation ? [...dataPreparation].sort((a, b) => a.step_order - b.step_order) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 3: Data Preparation</h1>
            <p className="mt-2 text-gray-600">
              Clean, transform, and engineer features for model training
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Preparation Step'}
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

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Preparation Step' : 'Add New Preparation Step'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Step Name *</label>
              <input
                type="text"
                value={formData.step_name}
                onChange={(e) => setFormData({ ...formData, step_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Remove missing values"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Step Order *</label>
              <input
                type="number"
                min="1"
                value={formData.step_order}
                onChange={(e) => setFormData({ ...formData, step_order: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Step Type *</label>
            <select
              value={formData.step_type}
              onChange={(e) => setFormData({ ...formData, step_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="cleaning">Cleaning</option>
              <option value="transformation">Transformation</option>
              <option value="feature_engineering">Feature Engineering</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Dataset</label>
              <input
                type="text"
                value={formData.input_dataset}
                onChange={(e) => setFormData({ ...formData, input_dataset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="raw_data.csv"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Dataset</label>
              <input
                type="text"
                value={formData.output_dataset}
                onChange={(e) => setFormData({ ...formData, output_dataset: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="cleaned_data.csv"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code Repository</label>
              <input
                type="text"
                value={formData.code_repository}
                onChange={(e) => setFormData({ ...formData, code_repository: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://github.com/..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notebook Link</label>
              <input
                type="text"
                value={formData.notebook_link}
                onChange={(e) => setFormData({ ...formData, notebook_link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://colab.research.google.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Before (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.quality_before}
                onChange={(e) => setFormData({ ...formData, quality_before: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality After (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.quality_after}
                onChange={(e) => setFormData({ ...formData, quality_after: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Execution Logs</label>
            <textarea
              value={formData.execution_logs}
              onChange={(e) => setFormData({ ...formData, execution_logs: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="Paste execution logs here..."
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

      {/* Pipeline Visualization */}
      {sortedSteps.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Preparation Pipeline</h2>
          <div className="space-y-3">
            {sortedSteps.map((step, index) => (
              <div key={step.id}>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step_order}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-gray-900">{step.step_name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStepTypeColor(step.step_type)}`}>
                            {step.step_type.replace('_', ' ')}
                          </span>
                          {step.pipeline_status && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(step.pipeline_status)}`}>
                              {step.pipeline_status}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {step.input_dataset && (
                            <div>
                              <span className="text-gray-600">Input:</span>
                              <div className="font-medium">{step.input_dataset}</div>
                            </div>
                          )}
                          {step.output_dataset && (
                            <div>
                              <span className="text-gray-600">Output:</span>
                              <div className="font-medium">{step.output_dataset}</div>
                            </div>
                          )}
                          {step.quality_before && step.quality_after && (
                            <div>
                              <span className="text-gray-600">Quality:</span>
                              <div className="font-medium">
                                {step.quality_before} → {step.quality_after}
                                <span className={`ml-1 ${
                                  step.quality_after > step.quality_before ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ({calculateImprovement(step.quality_before, step.quality_after)})
                                </span>
                              </div>
                            </div>
                          )}
                          {(step.code_repository || step.notebook_link) && (
                            <div>
                              <span className="text-gray-600">Links:</span>
                              <div className="flex space-x-2">
                                {step.code_repository && (
                                  <a href={step.code_repository} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Code
                                  </a>
                                )}
                                {step.notebook_link && (
                                  <a href={step.notebook_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Notebook
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(step)}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                    {step.execution_logs && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          View Execution Logs
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                          {step.execution_logs}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                {index < sortedSteps.length - 1 && (
                  <div className="ml-6 h-6 w-0.5 bg-blue-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedSteps.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-gray-400 text-lg mb-4">No preparation steps added yet</div>
          <p className="text-gray-500 mb-6">
            Start building your data preparation pipeline by adding cleaning, transformation, and feature engineering steps.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Your First Step
          </button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Data Preparation Best Practices</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li><strong>Cleaning:</strong> Handle missing values, remove duplicates, fix outliers</li>
          <li><strong>Transformation:</strong> Normalize, standardize, encode categorical variables</li>
          <li><strong>Feature Engineering:</strong> Create new features, select important features, reduce dimensionality</li>
          <li><strong>Track Quality:</strong> Measure data quality before and after each step</li>
          <li><strong>Document Everything:</strong> Link to code repositories and notebooks for reproducibility</li>
        </ul>
      </div>
    </div>
  )
}

export default DataPreparation
