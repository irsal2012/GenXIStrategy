import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchPortfolioHealth,
  fetchValuePipeline,
  fetchDeliveredValue,
  fetchRiskExposure
} from '../store/slices/reportingSlice';

const ExecutiveReporting = () => {
  const dispatch = useDispatch();
  const { dashboards, loading, error } = useSelector((state) => state.reporting);

  useEffect(() => {
    dispatch(fetchPortfolioHealth());
    dispatch(fetchValuePipeline());
    dispatch(fetchDeliveredValue());
    dispatch(fetchRiskExposure());
  }, [dispatch]);

  const portfolioHealth = dashboards.portfolioHealth;
  const valuePipeline = dashboards.valuePipeline;
  const deliveredValue = dashboards.deliveredValue;
  const riskExposure = dashboards.riskExposure;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executive Reporting</h1>
        <p className="mt-2 text-gray-600">
          Transform portfolio data into clear executive narratives for board presentations
        </p>
      </div>

      {/* Portfolio Health Score */}
      {loading.portfolioHealth ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : portfolioHealth ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthColor(portfolioHealth.health_score)}`}>
                {portfolioHealth.health_score.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {portfolioHealth.total_initiatives}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Initiatives</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                ${(portfolioHealth.total_value_delivered / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600 mt-1">Value Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {portfolioHealth.average_roi.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Average ROI</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Value Pipeline */}
        <Link to="/reporting/value-pipeline" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Value Pipeline</h3>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {valuePipeline && (
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${(valuePipeline.total_pipeline_value / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">
                  Total value in pipeline across {valuePipeline.top_initiatives?.length || 0} initiatives
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Delivered Value */}
        <Link to="/reporting/delivered-value" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delivered Value</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {deliveredValue && (
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${(deliveredValue.total_delivered_value / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600">
                  {deliveredValue.realization_rate.toFixed(1)}% realization rate
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Risk Exposure */}
        <Link to="/reporting/risk-exposure" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Risk Exposure</h3>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {riskExposure && (
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {riskExposure.total_risk_score.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">
                  {riskExposure.high_risk_initiatives?.length || 0} high-risk initiatives
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Stage Distribution */}
        <Link to="/reporting/stage-distribution" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stage Distribution</h3>
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              View initiative distribution across stages and identify bottlenecks
            </div>
          </div>
        </Link>

        {/* Bottlenecks */}
        <Link to="/reporting/bottlenecks" className="block">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Bottlenecks</h3>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              Identify resource conflicts, dependencies, and approval delays
            </div>
          </div>
        </Link>

        {/* Board Reporting */}
        <Link to="/reporting/board-center" className="block">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Board Reporting Center</h3>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm opacity-90">
              Generate board slides, strategy briefs, and quarterly reports with AI
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/reporting/board-center?action=board-slides"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="font-semibold">Generate Board Slides</div>
              <div className="text-sm text-gray-600">Create presentation</div>
            </div>
          </Link>

          <Link
            to="/reporting/board-center?action=strategy-brief"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors"
          >
            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="font-semibold">Strategy Brief</div>
              <div className="text-sm text-gray-600">One-page summary</div>
            </div>
          </Link>

          <Link
            to="/reporting/board-center?action=quarterly-report"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
          >
            <svg className="w-6 h-6 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="font-semibold">Quarterly Report</div>
              <div className="text-sm text-gray-600">Full impact report</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {(error.portfolioHealth || error.valuePipeline || error.deliveredValue || error.riskExposure) && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">
              Error loading dashboard data. Please try refreshing the page.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveReporting;
