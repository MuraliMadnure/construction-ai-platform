const aiService = require('../services/ai.service');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Get AI delay prediction for project
 */
exports.predictProjectDelay = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch project data
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        resourceAllocations: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate timeline
    const startDate = project.startDate;
    const endDate = project.endDate;
    const totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const projectData = {
      tasks: project.tasks,
      currentProgress: project.progress || 0,
      timeline: {
        startDate,
        endDate,
        totalDuration
      },
      resources: {
        utilization: 75 // TODO: Calculate from actual resource data
      }
    };

    const prediction = await aiService.predictDelays(projectData);

    res.json({
      success: true,
      data: { prediction }
    });
  } catch (error) {
    logger.error('Predict delay error:', error);
    next(error);
  }
};

/**
 * Get AI budget overrun prediction
 */
exports.predictBudgetOverrun = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        expenses: true,
        tasks: {
          where: {
            status: { not: 'COMPLETED' }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const totalSpent = project.expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const startDate = project.startDate;
    const endDate = project.endDate;
    const totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const budgetData = {
      totalBudget: parseFloat(project.budget) || 0,
      spent: totalSpent,
      timeline: {
        startDate,
        totalDuration
      },
      remainingTasks: project.tasks
    };

    const prediction = await aiService.predictBudgetOverrun(budgetData);

    res.json({
      success: true,
      data: { prediction }
    });
  } catch (error) {
    logger.error('Predict budget overrun error:', error);
    next(error);
  }
};

/**
 * Generate AI summary for daily report
 */
exports.generateDailySummary = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.dailyReport.findUnique({
      where: { id: reportId },
      include: {
        issues: true
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Daily report not found'
      });
    }

    // Get completed tasks for the day
    const completedTasks = await prisma.task.findMany({
      where: {
        projectId: report.projectId,
        status: 'COMPLETED',
        updatedAt: {
          gte: new Date(report.reportDate),
          lt: new Date(new Date(report.reportDate).getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        title: true
      }
    });

    const reportData = {
      progress: report.progressPercent || 0,
      issues: report.issues || [],
      completedTasks,
      weather: report.weather,
      workers: {
        count: report.workersPresent || 0,
        planned: report.workersPlanned || 0
      }
    };

    const summary = await aiService.generateDailySummary(reportData);

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    logger.error('Generate AI summary error:', error);
    next(error);
  }
};

/**
 * Get AI BOQ estimation
 */
exports.estimateBOQ = async (req, res, next) => {
  try {
    const { projectType, area, location, specifications } = req.body;

    const estimate = await aiService.estimateBOQ({
      projectType,
      area,
      location,
      specifications
    });

    res.json({
      success: true,
      data: { estimate }
    });
  } catch (error) {
    logger.error('BOQ estimation error:', error);
    next(error);
  }
};

/**
 * AI Chatbot endpoint
 */
exports.chatbot = async (req, res, next) => {
  try {
    const { message, projectId } = req.body;
    const userId = req.user.id;

    const context = {
      userId,
      projectId
    };

    const response = await aiService.getChatbotResponse(message, context);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Chatbot error:', error);
    next(error);
  }
};

/**
 * Analyze worker productivity
 */
exports.analyzeProductivity = async (req, res, next) => {
  try {
    const { projectId, startDate, endDate } = req.query;

    // Fetch productivity data
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        actualEndDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    const workers = await prisma.projectMember.count({
      where: { projectId }
    });

    const productivityData = {
      workers,
      tasksCompleted: tasks.length,
      timeframe: {
        start: startDate,
        end: endDate
      },
      targets: 100, // TODO: Get from project settings
      historical: [] // TODO: Fetch historical data
    };

    const analysis = await aiService.analyzeProductivity(productivityData);

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    logger.error('Productivity analysis error:', error);
    next(error);
  }
};

/**
 * Get comprehensive AI insights for project
 */
exports.getProjectInsights = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: true,
        expenses: true,
        members: true
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get all AI insights
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const totalDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalSpent = project.expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || parseFloat(project.spentAmount) || 0;

    const [delayPrediction, budgetPrediction] = await Promise.all([
      aiService.predictDelays({
        tasks: project.tasks || [],
        currentProgress: parseFloat(project.progress) || 0,
        timeline: { startDate, endDate, totalDuration },
        resources: { utilization: 75 }
      }),
      aiService.predictBudgetOverrun({
        totalBudget: parseFloat(project.budget) || 0,
        spent: totalSpent,
        timeline: { startDate, totalDuration },
        remainingTasks: (project.tasks || []).filter(t => t.status !== 'COMPLETED')
      })
    ]);

    res.json({
      success: true,
      data: {
        insights: {
          delay: delayPrediction,
          budget: budgetPrediction,
          overallRisk: delayPrediction.riskLevel === 'high' || budgetPrediction.riskLevel === 'high' ? 'high' : 'medium'
        }
      }
    });
  } catch (error) {
    logger.error('Get project insights error:', error);
    next(error);
  }
};
