import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchProjectOverview, recommendNextSteps } from '../store/slices/aiProjectsSlice'

const AIProjectDashboard = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { projectOverview, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)
  const [showNextSteps, setShowNextSteps] = useState(false)

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchProjectOverview(initiativeId))
    }
  }, [dispatch, initiativeId])

  const handleGetNextSteps = () => {
    if (projectOverview) {
      dispatch(recommendNextSteps({
        initiative_id: parseInt(initiativeId),
        current_phase: projectOverview.current_phase || 'business_understanding',
        phase_status: projectOverview.phase_progress || {},
        blockers: []
      }))
      setShowNextSteps(true)
    }
  }

  const getPhaseStatus = (phase) => {
    if (!projectOverview?.phase_progress) return 'not_started'
    return projectOverview.phase_progress[phase] || 'not_started'
  }

  const getPhaseColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'blocked': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const phases = [
    { key: 'business_understanding', name: 'Business Understanding', route: 'business-understanding' },
    { key: 'data_understanding', name: 'Data Understanding', route: 'data-understanding' },
    { key: 'data_preparation', name: 'Data Preparation', route: 'data-preparation' },
    { key: 'modeling', name: 'Model Development', route: 'model-development' },
    { key: 'evaluation', name: 'Model Evaluation', route: 'model-evaluation' },
    { key: 'deployment', name: 'Model Deployment', route: 'model-deployment' },
    { key: 'monitoring', name: 'Model Monitoring', route: 'model-monitoring' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading project overview...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Project Management</h1>
            <p className="mt-2 text-gray-600">
              Initiative ID: {initiativeId} | Current Phase: {projectOverview?.current_phase || 'Not Started'}
            </p>
          </div>
          <button
            onClick={handleGetNextSteps}
            disabled={aiLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {aiLoading ? 'Analyzing...' : '🤖 Get AI Recommendations'}
          </button>
        </div>
      </div>

      {/* AI Next Steps Recommendations */}
      {showNextSteps && aiResults.nextSteps && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">🤖 AI Recommendations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-purple-800 mb-2">Immediate Actions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {aiResults.nextSteps.immediate_actions?.map((action, idx) => (
                  <li key={idx} className="text-purple-700">{action}</li>
                ))}
              </ul>
            </div>
            {aiResults.nextSteps.recommendations && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.nextSteps.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-purple-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiResults.nextSteps.estimated_effort && (
              <div className="text-sm text-purple-600">
                <strong>Estimated Effort:</strong> {aiResults.nextSteps.estimated_effort}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.key)
          const isActive = projectOverview?.current_phase === phase.key
          
          return (
            <div
              key={phase.key}
              onClick={() => navigate(`/ai-projects/${initiativeId}/${phase.route}`)}
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-lg ${
                getPhaseColor(status)
              } ${isActive ? 'ring-4 ring-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-1">Phase {index + 1}</div>
                  <h3 className="font-bold text-lg mb-2">{phase.name}</h3>
                  <div className="text-sm font-medium capitalize">{status.replace('_', ' ')}</div>
                </div>
                {isActive && (
                  <div className="ml-2">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Project Statistics */}
      {projectOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Total Models</div>
            <div className="text-3xl font-bold text-gray-900">{projectOverview.total_models || 0}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Active Deployments</div>
            <div className="text-3xl font-bold text-gray-900">{projectOverview.active_deployments || 0}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Datasets</div>
            <div className="text-3xl font-bold text-gray-900">{projectOverview.total_datasets || 0}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
            <div className="text-3xl font-bold text-gray-900">
              {projectOverview.overall_progress ? `${Math.round(projectOverview.overall_progress)}%` : '0%'}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/ai-projects/${initiativeId}/business-understanding`)}
            className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
          >
            <div className="font-semibold text-gray-900">Start Business Understanding</div>
            <div className="text-sm text-gray-600 mt-1">Define objectives and assess feasibility</div>
          </button>
          <button
            onClick={() => navigate(`/ai-projects/${initiativeId}/data-understanding`)}
            className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
          >
            <div className="font-semibold text-gray-900">Explore Data</div>
            <div className="text-sm text-gray-600 mt-1">Catalog and profile datasets</div>
          </button>
          <button
            onClick={() => navigate(`/ai-projects/${initiativeId}/model-development`)}
            className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
          >
            <div className="font-semibold text-gray-900">Develop Models</div>
            <div className="text-sm text-gray-600 mt-1">Train and version AI models</div>
          </button>
          <button
            onClick={() => navigate(`/ai-projects/${initiativeId}/model-deployment`)}
            className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
          >
            <div className="font-semibold text-gray-900">Deploy Models</div>
            <div className="text-sm text-gray-600 mt-1">Deploy to production environments</div>
          </button>
          <button
            onClick={() => navigate(`/ai-projects/${initiativeId}/model-monitoring`)}
            className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-all"
          >
            <div className="font-semibold text-gray-900">Monitor Performance</div>
            <div className="text-sm text-gray-600 mt-1">Track metrics and detect drift</div>
          </button>
          <button
            onClick={() => navigate('/initiatives')}
            className="p-4 border-2 border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 text-left transition-all"
          >
            <div className="font-semibold text-gray-900">Back to Initiatives</div>
            <div className="text-sm text-gray-600 mt-1">Return to initiative list</div>
          </button>
        </div>
      </div>

      {/* CRISP-DM Methodology Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-3">📚 About CRISP-DM Methodology</h2>
        <p className="text-blue-800 mb-3">
          This AI project follows the industry-standard CRISP-DM (Cross-Industry Standard Process for Data Mining) methodology,
          ensuring a structured approach to AI/ML project development.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-white rounded p-3">
            <strong className="text-blue-900">Phase 1-2:</strong> Understand business needs and available data
          </div>
          <div className="bg-white rounded p-3">
            <strong className="text-blue-900">Phase 3:</strong> Prepare and transform data for modeling
          </div>
          <div className="bg-white rounded p-3">
            <strong className="text-blue-900">Phase 4-5:</strong> Develop and evaluate AI models
          </div>
          <div className="bg-white rounded p-3">
            <strong className="text-blue-900">Phase 6-7:</strong> Deploy and monitor in production
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIProjectDashboard
