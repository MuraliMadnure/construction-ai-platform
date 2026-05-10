import { memo, useCallback, useEffect, useState } from 'react';
import { AlertTriangle, BrainCircuit, CheckCircle2, RefreshCw, TrendingUp } from 'lucide-react';
import aiService from '../../services/ai.service';

const riskStyles = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
};

const getRiskStyle = (level) => riskStyles[level] || riskStyles.medium;

const AIInsightsWidget = ({ projectId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInsights = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setError('No project selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await aiService.getProjectInsights(projectId);
      setInsights(response.data.insights);
    } catch (requestError) {
      console.error('Failed to load AI insights:', requestError);
      setError(requestError.response?.status === 404 ? 'Project not found' : 'Insights unavailable');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">AI Risk Brief</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing project signals.</p>
          </div>
          <BrainCircuit className="w-5 h-5 text-primary-600" />
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">AI Risk Brief</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Insight engine status.</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/30">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{error}</p>
          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
            Check project data, budget, and task availability.
          </p>
        </div>
        <button type="button" onClick={loadInsights} className="btn-ghost w-full mt-4 text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (!insights) return null;

  const delay = insights.delay;
  const budget = insights.budget;
  const overallRisk = insights.overallRisk || 'medium';

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold">AI Risk Brief</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Schedule and budget signals for the focus project.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskStyle(overallRisk)}`}>
          {overallRisk.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        {delay && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {delay.isDelayed ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
                <h3 className="font-semibold">Schedule</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRiskStyle(delay.riskLevel)}`}>
                {delay.riskLevel}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {delay.isDelayed
                ? `Predicted delay: ${delay.delayDays || 0} days`
                : 'No major schedule delay predicted'}
            </p>
            {delay.recommendations?.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{delay.recommendations[0]}</p>
            )}
          </div>
        )}

        {budget && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-600" />
                <h3 className="font-semibold">Budget</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getRiskStyle(budget.riskLevel)}`}>
                {budget.riskLevel}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Forecast final cost: INR {Math.round(budget.projectedOverrun || 0).toLocaleString()}
            </p>
            {budget.recommendations?.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{budget.recommendations[0]}</p>
            )}
          </div>
        )}
      </div>

      <button type="button" onClick={loadInsights} className="btn-ghost w-full mt-4 text-sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh brief
      </button>
    </div>
  );
};

export default memo(AIInsightsWidget);
