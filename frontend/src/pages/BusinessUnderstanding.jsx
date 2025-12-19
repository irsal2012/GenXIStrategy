import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  fetchBusinessUnderstanding,
  createBusinessUnderstanding,
  updateBusinessUnderstanding,
  recordGoNoGoDecision,
  analyzeFeasibility
} from '../store/slices/aiProjectsSlice'

const BusinessUnderstanding = () => {
  const { initiativeId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { businessUnderstanding, aiResults, loading, aiLoading } = useSelector((state) => state.aiProjects)

  const [formData, setFormData] = useState({
    business_objectives: '',
    success_criteria: [],
    stakeholder_requirements: {},
    data_sources_identified: [],
    compliance_requirements: []
  })

  const [newCriterion, setNewCriterion] = useState({ metric: '', target: '' })
  const [newDataSource, setNewDataSource] = useState({ name: '', description: '', available: false })
  const [newCompliance, setNewCompliance] = useState('')
  const [showFeasibility, setShowFeasibility] = useState(false)

  useEffect(() => {
    if (initiativeId) {
      dispatch(fetchBusinessUnderstanding(initiativeId))
    }
  }, [dispatch, initiativeId])

  useEffect(() => {
    if (businessUnderstanding) {
      setFormData({
        business_objectives: businessUnderstanding.business_objectives || '',
        success_criteria: businessUnderstanding.success_criteria || [],
        stakeholder_requirements: businessUnderstanding.stakeholder_requirements || {},
        data_sources_identified: businessUnderstanding.data_sources_identified || [],
        compliance_requirements: businessUnderstanding.compliance_requirements || []
      })
    }
  }, [businessUnderstanding])

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      initiative_id: parseInt(initiativeId),
      ...formData
    }

    if (businessUnderstanding) {
      dispatch(updateBusinessUnderstanding({ id: businessUnderstanding.id, data }))
    } else {
      dispatch(createBusinessUnderstanding(data))
    }
  }

  const handleAnalyzeFeasibility = () => {
    dispatch(analyzeFeasibility({
      initiative_id: parseInt(initiativeId),
      business_objectives: formData.business_objectives,
      data_sources: formData.data_sources_identified,
      compliance_requirements: formData.compliance_requirements
    }))
    setShowFeasibility(true)
  }

  const handleGoNoGoDecision = (decision) => {
    if (businessUnderstanding) {
      dispatch(recordGoNoGoDecision({
        id: businessUnderstanding.id,
        data: {
          decision,
          decision_rationale: aiResults.feasibility?.recommendation || 'Manual decision'
        }
      }))
    }
  }

  const addCriterion = () => {
    if (newCriterion.metric && newCriterion.target) {
      setFormData({
        ...formData,
        success_criteria: [...formData.success_criteria, newCriterion]
      })
      setNewCriterion({ metric: '', target: '' })
    }
  }

  const addDataSource = () => {
    if (newDataSource.name) {
      setFormData({
        ...formData,
        data_sources_identified: [...formData.data_sources_identified, newDataSource]
      })
      setNewDataSource({ name: '', description: '', available: false })
    }
  }

  const addCompliance = () => {
    if (newCompliance) {
      setFormData({
        ...formData,
        compliance_requirements: [...formData.compliance_requirements, newCompliance]
      })
      setNewCompliance('')
    }
  }

  const removeCriterion = (index) => {
    setFormData({
      ...formData,
      success_criteria: formData.success_criteria.filter((_, i) => i !== index)
    })
  }

  const removeDataSource = (index) => {
    setFormData({
      ...formData,
      data_sources_identified: formData.data_sources_identified.filter((_, i) => i !== index)
    })
  }

  const removeCompliance = (index) => {
    setFormData({
      ...formData,
      compliance_requirements: formData.compliance_requirements.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phase 1: Business Understanding</h1>
            <p className="mt-2 text-gray-600">
              Define business objectives, identify data sources, and assess project feasibility
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

      {/* AI Feasibility Analysis */}
      {showFeasibility && aiResults.feasibility && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4">🤖 AI Feasibility Analysis</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-purple-700 mb-1">Feasibility Score</div>
                <div className="text-3xl font-bold text-purple-900">{aiResults.feasibility.feasibility_score}/100</div>
              </div>
              <div>
                <div className="text-sm text-purple-700 mb-1">Recommendation</div>
                <div className={`text-2xl font-bold ${
                  aiResults.feasibility.recommendation === 'GO' ? 'text-green-600' :
                  aiResults.feasibility.recommendation === 'NO_GO' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {aiResults.feasibility.recommendation}
                </div>
              </div>
            </div>
            
            {aiResults.feasibility.data_availability_assessment && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Data Availability:</h3>
                <p className="text-purple-700">{aiResults.feasibility.data_availability_assessment}</p>
              </div>
            )}
            
            {aiResults.feasibility.compliance_risks && aiResults.feasibility.compliance_risks.length > 0 && (
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Compliance Risks:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {aiResults.feasibility.compliance_risks.map((risk, idx) => (
                    <li key={idx} className="text-purple-700">{risk}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {aiResults.feasibility.estimated_timeline && (
              <div className="text-sm text-purple-600">
                <strong>Estimated Timeline:</strong> {aiResults.feasibility.estimated_timeline}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Go/No-Go Decision */}
      {businessUnderstanding && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Go/No-Go Decision</h2>
          <div className="flex items-center space-x-4">
            <div className="text-lg">
              Current Status: 
              <span className={`ml-2 font-bold ${
                businessUnderstanding.go_no_go_decision === 'go' ? 'text-green-600' :
                businessUnderstanding.go_no_go_decision === 'no_go' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {businessUnderstanding.go_no_go_decision?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleGoNoGoDecision('go')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ GO
              </button>
              <button
                onClick={() => handleGoNoGoDecision('no_go')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                ✗ NO GO
              </button>
            </div>
          </div>
          {businessUnderstanding.go_no_go_rationale && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <strong>Rationale:</strong> {businessUnderstanding.go_no_go_rationale}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Objectives */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Objectives</h2>
          <textarea
            value={formData.business_objectives}
            onChange={(e) => setFormData({ ...formData, business_objectives: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the business objectives for this AI project..."
            required
          />
        </div>

        {/* Success Criteria */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Success Criteria</h2>
          <div className="space-y-4">
            {formData.success_criteria.map((criterion, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <strong>{criterion.metric}:</strong> {criterion.target}
                </div>
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCriterion.metric}
                onChange={(e) => setNewCriterion({ ...newCriterion, metric: e.target.value })}
                placeholder="Metric (e.g., Accuracy)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={newCriterion.target}
                onChange={(e) => setNewCriterion({ ...newCriterion, target: e.target.value })}
                placeholder="Target (e.g., > 95%)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addCriterion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Sources</h2>
          <div className="space-y-4">
            {formData.data_sources_identified.map((source, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold">{source.name}</div>
                    <div className="text-sm text-gray-600">{source.description}</div>
                    <div className={`text-sm mt-1 ${source.available ? 'text-green-600' : 'text-red-600'}`}>
                      {source.available ? '✓ Available' : '✗ Not Available'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDataSource(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <input
                type="text"
                value={newDataSource.name}
                onChange={(e) => setNewDataSource({ ...newDataSource, name: e.target.value })}
                placeholder="Data source name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={newDataSource.description}
                onChange={(e) => setNewDataSource({ ...newDataSource, description: e.target.value })}
                placeholder="Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newDataSource.available}
                  onChange={(e) => setNewDataSource({ ...newDataSource, available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Data is available</label>
              </div>
              <button
                type="button"
                onClick={addDataSource}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Data Source
              </button>
            </div>
          </div>
        </div>

        {/* Compliance Requirements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Requirements</h2>
          <div className="space-y-4">
            {formData.compliance_requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                <div className="flex-1">{req}</div>
                <button
                  type="button"
                  onClick={() => removeCompliance(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCompliance}
                onChange={(e) => setNewCompliance(e.target.value)}
                placeholder="Compliance requirement (e.g., GDPR, HIPAA)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addCompliance}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : businessUnderstanding ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={handleAnalyzeFeasibility}
              disabled={aiLoading || !formData.business_objectives}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {aiLoading ? 'Analyzing...' : '🤖 Analyze Feasibility'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BusinessUnderstanding
