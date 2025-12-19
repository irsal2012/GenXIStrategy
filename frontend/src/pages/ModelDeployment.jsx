import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchModels,
  fetchDeployments,
  createDeployment,
  updateDeployment,
  deployModel,
  completeDeployment,
  rollbackDeployment,
  analyzeDeploymentReadiness
} from '../store/slices/aiProjectsSlice'

const ModelDeployment = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { models, deployments, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)

  const [selectedModelId, setSelectedModelId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showReadiness, setShowReadiness] = useState(false)
  const [formData, setFormData] = useState({
    deployment_name: '',
    deployment_environment: 'dev',
    deployment_type: 'real_time',
    endpoint_url: '',
    api_key: '',
    infrastructure_details: {},
    monitoring_config: {},
    alerting_config: {},
    rollback_plan: ''
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
      dispatch(updateDeployment({ id: editingId, data }))
    } else {
      dispatch(createDeployment(data))
    }
    
    resetForm()
  }

  const handleEdit = (deployment) => {
    setEditingId(deployment.id)
    setFormData({
      deployment_name: deployment.deployment_name || '',
      deployment_environment: deployment.deployment_environment || 'dev',
      deployment_type: deployment.deployment_type || 'real_time',
      endpoint_url: deployment.endpoint_url || '',
      api_key: deployment.api_key || '',
      infrastructure_details: deployment.infrastructure_details || {},
      monitoring_config: deployment.monitoring_config || {},
      alerting_config: deployment.alerting_config || {},
      rollback_plan: deployment.rollback_plan || ''
    })
    setShowForm(true)
  }

  const handleDeploy = (deploymentId) => {
    if (confirm('Are you sure you want to deploy this model?')) {
      dispatch(deployModel(deploymentId))
    }
  }

  const handleComplete = (deploymentId) => {
    const logs = prompt('Enter deployment logs (optional):')
    dispatch(completeDeployment({
      id: deploymentId,
      data: { deployment_logs: logs || 'Deployment completed successfully' }
    }))
  }

  const handleRollback = (deploymentId) => {
    const reason = prompt('Enter rollback reason:')
    if (reason) {
      dispatch(rollbackDeployment({
        id: deploymentId,
        data: { rollback_reason: reason }
      }))
    }
  }

  const handleAnalyzeReadiness = (model) => {
    dispatch(analyzeDeploymentReadiness({
      initiative_id: parseInt(initiativeId),
      model_metrics: model.final_metrics || {},
      infrastructure_details: {},
      business_requirements: {}
    }))
    setShowReadiness(true)
  }

  const resetForm = () => {
    setFormData({
      deployment_name: '',
      deployment_environment: 'dev',
      deployment_type: 'real_time',
      endpoint_url: '',
      api_key: '',
      infrastructure_details: {},
      monitoring_config: {},
      alerting_config: {},
      rollback_plan: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800'
      case 'deploying': return 'bg-blue-100 text-blue-800 animate-pulse'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'retired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800'
      case 'staging': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const selectedModel = models?.find(m => m.id === selectedModelId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 6: Model Deployment</h1>
            <p className="mt-2 text-gray-600">
              Deploy models to production environments with monitoring and rollback capabilities
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Model to Deploy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models && models.length > 0 ? (
            models.map((model) => (
              <div
                key={model.id}
                className={`p-4 border-2 rounded-lg ${
                  selectedModelId === model.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{model.model_name}</div>
                    <div className="text-sm text-gray-600">v{model.model_version}</div>
                    <div className="text-xs text-gray-500 mt-1">{model.algorithm}</div>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setSelectedModelId(model.id)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleAnalyzeReadiness(model)}
                    disabled={aiLoading}
                    className="flex-1 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    🤖 Analyze
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-8">
              No models available. Create and train a model first.
            </div>
          )}
        </div>
        {selectedModel && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Deployment for {selectedModel.model_name}
          </button>
        )}
      </div>

      {/* AI Deployment Readiness */}
      {showReadiness && aiResults.deploymentReadiness && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">🤖 Deployment Readiness Analysis</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-purple-700 mb-1">Readiness Score</div>
                <div className="text-3xl font-bold text-purple-900">
                  {aiResults.deploymentReadiness.readiness_score}/100
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-700 mb-1">Recommendation</div>
                <div className={`text-2xl font-bold ${
                  aiResults.deploymentReadiness.go_no_go_recommendation === 'GO' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aiResults.deploymentReadiness.go_no_go_recommendation}
                </div>
              </div>
            </div>
            
            {aiResults.deploymentReadiness.category_scores && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Category Scores:</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(aiResults.deploymentReadiness.category_scores).map(([category, score]) => (
                    <div key={category} className="bg-white p-3 rounded">
                      <div className="text-xs text-purple-700 capitalize">{category}</div>
                      <div className="text-lg font-bold text-purple-900">{score}/100</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {aiResults.deploymentReadiness.blockers && aiResults.deploymentReadiness.blockers.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-800 mb-2">⚠️ Blockers:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.deploymentReadiness.blockers.map((blocker, idx) => (
                    <li key={idx} className="text-red-700">{blocker}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {aiResults.deploymentReadiness.recommendations && aiResults.deploymentReadiness.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.deploymentReadiness.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-purple-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && selectedModel && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingId ? 'Edit Deployment' : `New Deployment for ${selectedModel.model_name}`}
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deployment Name *</label>
            <input
              type="text"
              value={formData.deployment_name}
              onChange={(e) => setFormData({ ...formData, deployment_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., Production Deployment v1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Environment *</label>
              <select
                value={formData.deployment_environment}
                onChange={(e) => setFormData({ ...formData, deployment_environment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="dev">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deployment Type *</label>
              <select
                value={formData.deployment_type}
                onChange={(e) => setFormData({ ...formData, deployment_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="batch">Batch Processing</option>
                <option value="real_time">Real-time Inference</option>
                <option value="edge">Edge Deployment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input
                type="text"
                value={formData.endpoint_url}
                onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://api.example.com/predict"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Infrastructure Details (JSON)</label>
            <textarea
              value={JSON.stringify(formData.infrastructure_details, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, infrastructure_details: JSON.parse(e.target.value) })
                } catch (error) {
                  // Invalid JSON
                }
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{"instance_type": "t3.large", "replicas": 3, "region": "us-east-1"}'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rollback Plan</label>
            <textarea
              value={formData.rollback_plan}
              onChange={(e) => setFormData({ ...formData, rollback_plan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Describe the rollback procedure..."
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

      {/* Deployments List */}
      {selectedModelId && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Deployments for {selectedModel?.model_name}
          </h2>
          {deployments && deployments.length > 0 ? (
            deployments.map((deployment) => (
              <div key={deployment.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{deployment.deployment_name}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getEnvironmentColor(deployment.deployment_environment)}`}>
                        {deployment.deployment_environment}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(deployment.deployment_status)}`}>
                        {deployment.deployment_status || 'pending'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Type: {deployment.deployment_type}</span>
                      {deployment.endpoint_url && (
                        <a href={deployment.endpoint_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {deployment.endpoint_url}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {deployment.deployment_status === 'pending' && (
                      <button
                        onClick={() => handleDeploy(deployment.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        🚀 Deploy
                      </button>
                    )}
                    {deployment.deployment_status === 'deploying' && (
                      <button
                        onClick={() => handleComplete(deployment.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        ✓ Complete
                      </button>
                    )}
                    {deployment.deployment_status === 'deployed' && (
                      <>
                        <button
                          onClick={() => navigate(`/ai-projects/${initiativeId}/model-monitoring`)}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                        >
                          📊 Monitor
                        </button>
                        <button
                          onClick={() => handleRollback(deployment.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          ↩ Rollback
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(deployment)}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {deployment.infrastructure_details && Object.keys(deployment.infrastructure_details).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Infrastructure:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(deployment.infrastructure_details).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-3 rounded">
                          <div className="text-xs text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                          <div className="font-medium text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deployment.rollback_plan && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                      View Rollback Plan
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      {deployment.rollback_plan}
                    </div>
                  </details>
                )}

                {deployment.deployment_logs && (
                  <details>
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                      View Deployment Logs
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                      {deployment.deployment_logs}
                    </pre>
                  </details>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-gray-400 text-lg mb-4">No deployments yet</div>
              <p className="text-gray-500 mb-6">
                Create a deployment configuration to deploy this model to an environment.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Create First Deployment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ModelDeployment
