import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchDataUnderstanding,
  createDataUnderstanding,
  updateDataUnderstanding,
  assessQuality
} from '../store/slices/aiProjectsSlice'

const DataUnderstanding = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { dataUnderstanding, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [formData, setFormData] = useState({
    dataset_name: '',
    dataset_location: '',
    dataset_description: '',
    dataset_size_gb: '',
    record_count: '',
    feature_count: '',
    data_quality_score: '',
    missing_values_pct: '',
    duplicate_records_pct: '',
    data_profiling_results: {},
    data_issues: []
  })

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchDataUnderstanding(initiativeId))
    }
  }, [dispatch, initiativeId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      initiative_id: parseInt(initiativeId),
      ...formData,
      dataset_size_gb: parseFloat(formData.dataset_size_gb) || 0,
      record_count: parseInt(formData.record_count) || 0,
      feature_count: parseInt(formData.feature_count) || 0,
      data_quality_score: parseFloat(formData.data_quality_score) || 0,
      missing_values_pct: parseFloat(formData.missing_values_pct) || 0,
      duplicate_records_pct: parseFloat(formData.duplicate_records_pct) || 0
    }

    if (editingId) {
      dispatch(updateDataUnderstanding({ id: editingId, data }))
    } else {
      dispatch(createDataUnderstanding(data))
    }
    
    resetForm()
  }

  const handleEdit = (dataset) => {
    setEditingId(dataset.id)
    setFormData({
      dataset_name: dataset.dataset_name || '',
      dataset_location: dataset.dataset_location || '',
      dataset_description: dataset.dataset_description || '',
      dataset_size_gb: dataset.dataset_size_gb?.toString() || '',
      record_count: dataset.record_count?.toString() || '',
      feature_count: dataset.feature_count?.toString() || '',
      data_quality_score: dataset.data_quality_score?.toString() || '',
      missing_values_pct: dataset.missing_values_pct?.toString() || '',
      duplicate_records_pct: dataset.duplicate_records_pct?.toString() || '',
      data_profiling_results: dataset.data_profiling_results || {},
      data_issues: dataset.data_issues || []
    })
    setShowForm(true)
  }

  const handleAssessQuality = (dataset) => {
    setSelectedDataset(dataset)
    dispatch(assessQuality({
      initiative_id: parseInt(initiativeId),
      dataset_name: dataset.dataset_name,
      profiling_results: dataset.data_profiling_results || {}
    }))
  }

  const resetForm = () => {
    setFormData({
      dataset_name: '',
      dataset_location: '',
      dataset_description: '',
      dataset_size_gb: '',
      record_count: '',
      feature_count: '',
      data_quality_score: '',
      missing_values_pct: '',
      duplicate_records_pct: '',
      data_profiling_results: {},
      data_issues: []
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getQualityColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 2: Data Understanding</h1>
            <p className="mt-2 text-gray-600">
              Catalog datasets, profile data quality, and identify issues
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Dataset'}
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

      {/* AI Quality Assessment */}
      {selectedDataset && aiResults.quality && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">
            🤖 AI Quality Assessment: {selectedDataset.dataset_name}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-purple-700 mb-1">Quality Score</div>
                <div className="text-3xl font-bold text-purple-900">{aiResults.quality.quality_score}/100</div>
              </div>
              <div>
                <div className="text-sm text-purple-700 mb-1">Estimated Effort</div>
                <div className="text-lg font-semibold text-purple-900">{aiResults.quality.estimated_effort}</div>
              </div>
            </div>
            
            {aiResults.quality.issues_identified && aiResults.quality.issues_identified.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Issues Identified:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.quality.issues_identified.map((issue, idx) => (
                    <li key={idx} className="text-purple-700">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {aiResults.quality.recommendations && aiResults.quality.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.quality.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-purple-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {aiResults.quality.priority_actions && aiResults.quality.priority_actions.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Priority Actions:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  {aiResults.quality.priority_actions.map((action, idx) => (
                    <li key={idx} className="text-purple-700">{action}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Dataset' : 'Add New Dataset'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name *</label>
              <input
                type="text"
                value={formData.dataset_name}
                onChange={(e) => setFormData({ ...formData, dataset_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Location</label>
              <input
                type="text"
                value={formData.dataset_location}
                onChange={(e) => setFormData({ ...formData, dataset_location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="s3://bucket/path or /local/path"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.dataset_description}
              onChange={(e) => setFormData({ ...formData, dataset_description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size (GB)</label>
              <input
                type="number"
                step="0.01"
                value={formData.dataset_size_gb}
                onChange={(e) => setFormData({ ...formData, dataset_size_gb: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Record Count</label>
              <input
                type="number"
                value={formData.record_count}
                onChange={(e) => setFormData({ ...formData, record_count: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feature Count</label>
              <input
                type="number"
                value={formData.feature_count}
                onChange={(e) => setFormData({ ...formData, feature_count: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.data_quality_score}
                onChange={(e) => setFormData({ ...formData, data_quality_score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Missing Values %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.missing_values_pct}
                onChange={(e) => setFormData({ ...formData, missing_values_pct: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duplicate Records %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.duplicate_records_pct}
                onChange={(e) => setFormData({ ...formData, duplicate_records_pct: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
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

      {/* Datasets List */}
      <div className="space-y-4">
        {dataUnderstanding && dataUnderstanding.length > 0 ? (
          dataUnderstanding.map((dataset) => (
            <div key={dataset.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{dataset.dataset_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{dataset.dataset_description}</p>
                  {dataset.dataset_location && (
                    <p className="text-xs text-gray-500 mt-1">📁 {dataset.dataset_location}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAssessQuality(dataset)}
                    disabled={aiLoading}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    🤖 Assess Quality
                  </button>
                  <button
                    onClick={() => handleEdit(dataset)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Size</div>
                  <div className="font-semibold">{dataset.dataset_size_gb || 0} GB</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Records</div>
                  <div className="font-semibold">{dataset.record_count?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Features</div>
                  <div className="font-semibold">{dataset.feature_count || 0}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Quality Score</div>
                  <div className={`font-semibold ${getQualityColor(dataset.data_quality_score || 0)}`}>
                    {dataset.data_quality_score || 0}/100
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Missing %</div>
                  <div className="font-semibold">{dataset.missing_values_pct || 0}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-xs text-gray-600 mb-1">Duplicates %</div>
                  <div className="font-semibold">{dataset.duplicate_records_pct || 0}%</div>
                </div>
              </div>

              {dataset.data_issues && dataset.data_issues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-semibold text-yellow-900 mb-2">⚠️ Data Issues:</div>
                  <ul className="list-disc list-inside text-sm text-yellow-800">
                    {dataset.data_issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">No datasets added yet</div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Your First Dataset
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataUnderstanding
