const config = require('../config');
const logger = require('../utils/logger');

// Placeholder for AI service - can integrate OpenAI or Anthropic Claude
class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    this.provider = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'anthropic'
  }

  /**
   * Generate project delay prediction
   */
  async predictDelays(projectData) {
    try {
      const { tasks, currentProgress, timeline, resources } = projectData;

      // Analyze task completion rates
      const completedTasks = tasks.filter(t => String(t.status).toUpperCase() === 'COMPLETED').length;
      const totalTasks = tasks.length;

      // Calculate time elapsed vs progress
      const timeElapsed = this.calculateTimeElapsed(timeline.startDate);
      const totalDuration = Math.max(timeline.totalDuration || 1, 1);
      const expectedProgress = (timeElapsed / totalDuration) * 100;
      const progressGap = expectedProgress - currentProgress;

      // Simple prediction logic (can be enhanced with ML)
      let prediction = {
        isDelayed: progressGap > 10,
        delayDays: Math.max(0, Math.ceil(progressGap * totalDuration / 100)),
        riskLevel: this.assessRiskLevel(progressGap),
        reasons: [],
        recommendations: []
      };

      if (progressGap > 10) {
        prediction.reasons.push('Project progress is behind schedule');
        prediction.recommendations.push('Consider allocating additional resources');
      }

      if (resources.utilization < 70) {
        prediction.reasons.push('Low resource utilization detected');
        prediction.recommendations.push('Optimize resource allocation');
      }

      return prediction;
    } catch (error) {
      logger.error('AI delay prediction error:', error);
      throw error;
    }
  }

  /**
   * Generate budget overrun prediction
   */
  async predictBudgetOverrun(budgetData) {
    try {
      const { totalBudget, spent, timeline, remainingTasks } = budgetData;

      if (!totalBudget || totalBudget <= 0) {
        return {
          isOverBudget: false,
          projectedOverrun: spent,
          riskLevel: 'low',
          recommendations: []
        };
      }

      const timeElapsed = this.calculateTimeElapsed(timeline.startDate);
      const totalDuration = Math.max(timeline.totalDuration || 1, 1);
      const expectedSpent = (timeElapsed / totalDuration) * totalBudget;
      const variance = spent - expectedSpent;

      let prediction = {
        isOverBudget: variance > totalBudget * 0.1,
        projectedOverrun: this.projectFinalCost(spent, remainingTasks, { ...timeline, totalDuration }),
        riskLevel: variance > totalBudget * 0.15 ? 'high' : variance > totalBudget * 0.05 ? 'medium' : 'low',
        recommendations: []
      };

      if (prediction.isOverBudget) {
        prediction.recommendations.push('Review and optimize procurement costs');
        prediction.recommendations.push('Implement stricter budget controls');
        prediction.recommendations.push('Consider value engineering opportunities');
      }

      return prediction;
    } catch (error) {
      logger.error('AI budget prediction error:', error);
      throw error;
    }
  }

  /**
   * Generate AI summary for daily report
   */
  async generateDailySummary(reportData) {
    try {
      const { progress, issues, completedTasks, weather, workers } = reportData;

      // Generate intelligent summary
      let summary = [];

      if (completedTasks.length > 0) {
        summary.push(`Completed ${completedTasks.length} tasks today.`);
      }

      if (issues.length > 0) {
        summary.push(`${issues.length} issues reported requiring attention.`);
      }

      if (weather === 'rainy' && progress < 50) {
        summary.push('Weather conditions impacted work progress.');
      }

      if (workers.count < workers.planned * 0.8) {
        summary.push('Worker attendance below planned levels.');
      }

      return {
        summary: summary.join(' '),
        keyHighlights: completedTasks.slice(0, 3).map(t => t.title),
        concerns: issues.filter(i => i.severity === 'high').map(i => i.title),
        recommendations: this.generateRecommendations(reportData)
      };
    } catch (error) {
      logger.error('AI summary generation error:', error);
      throw error;
    }
  }

  /**
   * Smart BOQ estimation
   */
  async estimateBOQ(projectSpecs) {
    try {
      const { projectType, area, location, specifications } = projectSpecs;

      // Basic estimation logic (can be enhanced with historical data and ML)
      const baseRates = this.getBaseRates(location);

      let boqEstimate = {
        items: [],
        totalCost: 0,
        confidence: 'medium'
      };

      // Add standard items based on project type
      if (projectType === 'residential') {
        boqEstimate.items = this.getResidentialBOQItems(area, baseRates);
      } else if (projectType === 'commercial') {
        boqEstimate.items = this.getCommercialBOQItems(area, baseRates);
      }

      boqEstimate.totalCost = boqEstimate.items.reduce((sum, item) => sum + item.amount, 0);

      return boqEstimate;
    } catch (error) {
      logger.error('AI BOQ estimation error:', error);
      throw error;
    }
  }

  /**
   * Chatbot response (placeholder for future implementation)
   */
  async getChatbotResponse(message, context) {
    try {
      // This would integrate with OpenAI or Claude API
      // For now, return a placeholder
      return {
        response: 'AI chatbot integration coming soon. This will provide intelligent assistance for your construction queries.',
        suggestions: [
          'What is my project status?',
          'Show budget summary',
          'List pending tasks'
        ]
      };
    } catch (error) {
      logger.error('AI chatbot error:', error);
      throw error;
    }
  }

  /**
   * Worker productivity analysis
   */
  async analyzeProductivity(productivityData) {
    try {
      const { workers, tasksCompleted, timeframe, targets } = productivityData;

      const avgTasksPerWorker = tasksCompleted / workers;
      const productivityRate = (tasksCompleted / targets) * 100;

      return {
        productivityScore: productivityRate,
        avgTasksPerWorker,
        trend: this.calculateTrend(productivityData.historical),
        recommendations: this.getProductivityRecommendations(productivityRate),
        topPerformers: productivityData.individuals?.slice(0, 5) || []
      };
    } catch (error) {
      logger.error('AI productivity analysis error:', error);
      throw error;
    }
  }

  // Helper methods
  calculateTimeElapsed(startDate) {
    return (Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
  }

  assessRiskLevel(gap) {
    if (gap > 20) return 'high';
    if (gap > 10) return 'medium';
    return 'low';
  }

  projectFinalCost(spent, remainingTasks, timeline) {
    const elapsedDays = Math.max(this.calculateTimeElapsed(timeline.startDate), 1);
    const avgCostPerDay = spent / elapsedDays;
    const remainingDays = Math.max((timeline.totalDuration || 0) - elapsedDays, 0);
    return spent + (avgCostPerDay * remainingDays);
  }

  generateRecommendations(data) {
    const recommendations = [];

    if (data.issues.length > 3) {
      recommendations.push('Prioritize resolving open issues');
    }

    if (data.progress < data.target) {
      recommendations.push('Accelerate work pace to meet targets');
    }

    return recommendations;
  }

  getBaseRates(location) {
    // Placeholder for location-based rates
    return {
      labor: 500,
      cement: 450,
      steel: 52000,
      bricks: 8
    };
  }

  getResidentialBOQItems(area, rates) {
    return [
      { item: 'Excavation', quantity: area * 0.5, rate: 250, unit: 'cum' },
      { item: 'Concrete', quantity: area * 0.3, rate: 5500, unit: 'cum' },
      { item: 'Brickwork', quantity: area * 2.5, rate: 850, unit: 'sqm' },
      { item: 'Plastering', quantity: area * 3, rate: 180, unit: 'sqm' },
      { item: 'Flooring', quantity: area, rate: 450, unit: 'sqm' }
    ].map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
  }

  getCommercialBOQItems(area, rates) {
    return [
      { item: 'Excavation', quantity: area * 0.6, rate: 250, unit: 'cum' },
      { item: 'Concrete M30', quantity: area * 0.4, rate: 6500, unit: 'cum' },
      { item: 'Structural Steel', quantity: area * 0.05, rate: 65000, unit: 'ton' },
      { item: 'Glazing', quantity: area * 0.3, rate: 1200, unit: 'sqm' },
      { item: 'HVAC', quantity: area, rate: 800, unit: 'sqm' }
    ].map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
  }

  calculateTrend(historical) {
    if (!historical || historical.length < 2) return 'stable';
    const recent = historical.slice(-3);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const prev = historical[historical.length - 4] || avg;

    if (avg > prev * 1.1) return 'improving';
    if (avg < prev * 0.9) return 'declining';
    return 'stable';
  }

  getProductivityRecommendations(rate) {
    const recommendations = [];

    if (rate < 70) {
      recommendations.push('Consider providing additional training');
      recommendations.push('Review task allocation and complexity');
      recommendations.push('Ensure adequate tools and resources');
    } else if (rate > 90) {
      recommendations.push('Maintain current practices');
      recommendations.push('Document successful strategies');
    }

    return recommendations;
  }
}

module.exports = new AIService();
