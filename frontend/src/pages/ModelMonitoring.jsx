import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchModels,
  fetchDeployments,
  fetchMonitoring,
  fetchLatestMonitoring,
  recordMonitoring,
  detectDrift
} from '../store/slices/aiProjectsSlice'

const ModelMonitoring = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { models, deployments, monitoring, latestMonitoring, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)

  const [selectedModelId, setSelectedModelId] = useState(null)
  const [selectedDeploymentId, setSelectedDeploymentId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDrift, setShowDrift] = useState(false)
  const [formData, setFormData] = useState({
    inference_count: '',
    average_latency_ms: '',
    error_rate: '',
    throughput_per_second: '',
    performance_metrics: {},
    data_drift_score: '',
    model_drift_score: '',
    alerts: []
  })

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchModels(initiativeId))
    }
  }, [dispatch, initiativeId])

  useEffect(() => {
    if (selectedModelId) {
      dispatch(fetchDeployments(selectedModelId))
    }
  }, [selectedModelId, dispatch])

  useEffect(() => {
    if (selectedDeploymentId) {
      dispatch(fetchMonitoring(selectedDeploymentId))
      dispatch(fetchLatestMonitoring(selectedDeploymentId))
    }
  }, [selectedDeploymentId, dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedDeploymentId) {
      alert('Please select a deployment first')
      return
    }

    const data = {
      deployment_id: selectedDeploymentId,
      inference_count: parseInt(formData.inference_count) || 0,
      average_latency_ms: parseFloat(formData.average_latency_ms) || 0,
      error_rate: parseFloat(formData.error_rate) || 0,
      throughput_per_second: parseFloat(formData.throughput_per_second) || 0,
      performance_metrics: formData.performance_metrics,
      data_drift_score: parseFloat(formData.data_drift_score) || 0,
      model_drift_score: parseFloat(formData.model_drift_score) || 0,
      alerts: formData.alerts
    }

    dispatch(recordMonitoring(data))
    resetForm()
  }

  const handleDetectDrift = () => {
    if (!latestMonitoring) {
      alert('No monitoring data available')
      return
    }

    const historicalMetrics = monitoring && monitoring.length > 1 
      ? monitoring[monitoring.length - 2].performance_metrics 
      : {}

    dispatch(detectDrift({
      initiative_id: parseInt(initiativeId),
      current_metrics: latestMonitoring.performance_metrics || {},
      historical_metrics: historicalMetrics
    }))
    setShowDrift(true)
  }

  const resetForm = () => {
    setFormData({
      inference_count: '',
      average_latency_ms: '',
      error_rate: '',
      throughput_per_second: '',
      performance_metrics: {},
      data_drift_score: '',
      model_drift_score: '',
      alerts: []
    })
    setShowForm(false)
  }

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDriftColor = (score) => {
    if (score >= 70) return 'text-red-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const selectedModel = models?.find(m => m.id === selectedModelId)
  const selectedDeployment = deployments?.find(d => d.id === selectedDeploymentId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 7: Model Monitoring</h1>
            <p className="mt-2 text-gray-600">
              Monitor production performance, detect drift, and track model health
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

      {/* Model & Deployment Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Deployment to Monitor</h2>
        
        {/* Model Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Model:</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {models && models.length > 0 ? (
              models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModelId(model.id)
                    setSelectedDeploymentId(null)
                  }}
                  className={`p-3 border-2 rounded-lg text-left ${
                    selectedModelId === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold">{model.model_name}</div>
                  <div className="text-sm text-gray-600">v{model.model_version}</div>
                </button>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-4">
                No models available
              </div>
            )}
          </div>
        </div>

        {/* Deployment Selection */}
        {selectedModelId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Deployment:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deployments && deployments.length > 0 ? (
                deployments.filter(d => d.deployment_status === 'deployed').map((deployment) => (
                  <button
                    key={deployment.id}
                    onClick={() => setSelectedDeploymentId(deployment.id)}
                    className={`p-3 border-2 rounded-lg text-left ${
                      selectedDeploymentId === deployment.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold">{deployment.deployment_name}</div>
                    <div className="text-sm text-gray-600">{deployment.deployment_environment}</div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500 py-4">
                  No deployed models available
                </div>
              )}
            </div>
          </div>
        )}

        {selectedDeployment && (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Record Monitoring Data
            </button>
            <button
              onClick={handleDetectDrift}
              disabled={aiLoading || !latestMonitoring}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {aiLoading ? 'Analyzing...' : '🤖 Detect Drift'}
            </button>
          </div>
        )}
      </div>

      {/* Latest Monitoring Status */}
      {latestMonitoring && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-xs text-blue-700 mb-1">Inferences</div>
              <div className="text-2xl font-bold text-blue-900">{latestMonitoring.inference_count?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-xs text-green-700 mb-1">Latency (ms)</div>
              <div className="text-2xl font-bold text-green-900">{latestMonitoring.average_latency_ms || 0}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <div className="text-xs text-yellow-700 mb-1">Error Rate (%)</div>
              <div className="text-2xl font-bold text-yellow-900">{latestMonitoring.error_rate || 0}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <div className="text-xs text-purple-700 mb-1">Throughput/s</div>
              <div className="text-2xl font-bold text-purple-900">{latestMonitoring.throughput_per_second || 0}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <div className="text-xs text-orange-700 mb-1">Data Drift</div>
              <div className={`text-2xl font-bold ${getDriftColor(latestMonitoring.data_drift_score || 0)}`}>
                {latestMonitoring.data_drift_score || 0}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-xs text-red-700 mb-1">Model Drift</div>
              <div className={`text-2xl font-bold ${getDriftColor(latestMonitoring.model_drift_score || 0)}`}>
                {latestMonitoring.model_drift_score || 0}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <div className="text-sm text-gray-600">Health Status:</div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(latestMonitoring.status)}`}>
              {latestMonitoring.status || 'unknown'}
            </span>
            {latestMonitoring.health_score && (
              <div className="text-sm">
                <span className="text-gray-600">Health Score:</span>
                <span className="ml-2 font-bold text-gray-900">{latestMonitoring.health_score}/100</span>
              </div>
            )}
          </div>

          {latestMonitoring.alerts && latestMonitoring.alerts.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <div className="font-semibold text-red-900 mb-2">🚨 Active Alerts:</div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {latestMonitoring.alerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Drift Detection */}
      {showDrift && aiResults.drift && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">🤖 AI Drift Detection</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-purple-700 mb-1">Drift Detected</div>
                <div className={`text-2xl font-bold ${aiResults.drift.drift_detected ? 'text-red-600' : 'text-green-600'}`}>
                  {aiResults.drift.drift_detected ? 'YES' : 'NO'}
                </div>
              </div>
              {aiResults.drift.drift_type && (
                <div>
                  <div className="text-sm text-purple-700 mb-1">Drift Type</div>
                  <div className="text-lg font-bold text-purple-900 capitalize">{aiResults.drift.drift_type}</div>
                </div>
              )}
              {aiResults.drift.drift_score && (
                <div>
                  <div className="text-sm text-purple-700 mb-1">Drift Score</div>
                  <div className="text-2xl font-bold text-purple-900">{aiResults.drift.drift_score}/100</div>
                </div>
              )}
            </div>
            
            {aiResults.drift.affected_features && aiResults.drift.affected_features.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Affected Features:</h3>
                <div className="flex flex-wrap gap-2">
                  {aiResults.drift.affected_features.map((feature, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {aiResults.drift.recommendations && aiResults.drift.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.drift.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-purple-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {aiResults.drift.urgency_level && (
              <div className={`p-4 rounded border-2 ${
                aiResults.drift.urgency_level === 'high' ? 'bg-red-50 border-red-300' :
                aiResults.drift.urgency_level === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                'bg-green-50 border-green-300'
              }`}>
                <div className="font-semibold">Urgency Level: <span className="capitalize">{aiResults.drift.urgency_level}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Monitoring Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Record Monitoring Data</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inference Count</label>
              <input
                type="number"
                value={formData.inference_count}
                onChange={(e) => setFormData({ ...formData, inference_count: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avg Latency (ms)</label>
              <input
                type="number"
                step="0.01"
                value={formData.average_latency_ms}
                onChange={(e) => setFormData({ ...formData, average_latency_ms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Error Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.error_rate}
                onChange={(e) => setFormData({ ...formData, error_rate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Throughput/s</label>
              <input
                type="number"
                step="0.01"
                value={formData.throughput_per_second}
                onChange={(e) => setFormData({ ...formData, throughput_per_second: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Drift Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.data_drift_score}
                onChange={(e) => setFormData({ ...formData, data_drift_score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Drift Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.model_drift_score}
                onChange={(e) => setFormData({ ...formData, model_drift_score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"accuracy": 0.95, "precision": 0.93}'
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Recording...' : 'Record'}
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

      {/* Monitoring History */}
      {selectedDeploymentId && monitoring && monitoring.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monitoring History</h2>
          <div className="space-y-3">
            {monitoring.slice().reverse().map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm text-gray-600">
                    {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                  <div>
                    <div className="text-gray-600">Inferences</div>
                    <div className="font-semibold">{record.inference_count?.toLocaleString() || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Latency</div>
                    <div className="font-semibold">{record.average_latency_ms || 0}ms</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Error Rate</div>
                    <div className="font-semibold">{record.error_rate || 0}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Throughput</div>
                    <div className="font-semibold">{record.throughput_per_second || 0}/s</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Data Drift</div>
                    <div className={`font-semibold ${getDriftColor(record.data_drift_score || 0)}`}>
                      {record.data_drift_score || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Model Drift</div>
                    <div className={`font-semibold ${getDriftColor(record.model_drift_score || 0)}`}>
                      {record.model_drift_score || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelMonitoring
