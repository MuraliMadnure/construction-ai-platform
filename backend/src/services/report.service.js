const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const ExcelJS = require('exceljs');

const prisma = new PrismaClient();

class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate project summary PDF report
   */
  async generateProjectPDFReport(projectId) {
    try {
      // Fetch project data
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          projectManager: true,
          tasks: {
            include: {
              assignee: true
            }
          },
          members: {
            include: { user: true }
          },
          expenses: true
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Calculate statistics
      const stats = this.calculateProjectStats(project);

      // Generate HTML content
      const html = this.getProjectReportHTML(project, stats);

      // Generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html);

      const fileName = `project_report_${projectId}_${Date.now()}.pdf`;
      const filePath = path.join(this.reportsDir, fileName);

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await browser.close();

      logger.info(`PDF report generated: ${fileName}`);

      return {
        fileName,
        filePath,
        url: `/reports/${fileName}`
      };
    } catch (error) {
      logger.error('PDF report generation error:', error);
      throw error;
    }
  }

  /**
   * Generate daily report PDF
   */
  async generateDailyReportPDF(reportId) {
    try {
      const report = await prisma.dailyReport.findUnique({
        where: { id: reportId },
        include: {
          project: true,
          reportedBy: true,
          images: true
        }
      });

      if (!report) {
        throw new Error('Daily report not found');
      }

      const html = this.getDailyReportHTML(report);

      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html);

      const fileName = `daily_report_${reportId}_${Date.now()}.pdf`;
      const filePath = path.join(this.reportsDir, fileName);

      await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true
      });

      await browser.close();

      logger.info(`Daily report PDF generated: ${fileName}`);

      return {
        fileName,
        filePath,
        url: `/reports/${fileName}`
      };
    } catch (error) {
      logger.error('Daily report PDF generation error:', error);
      throw error;
    }
  }

  /**
   * Export project data to Excel
   */
  async exportProjectToExcel(projectId) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tasks: {
            include: { assignee: true }
          },
          expenses: true,
          materials: true
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      const workbook = new ExcelJS.Workbook();

      // Project Overview Sheet
      const overviewSheet = workbook.addWorksheet('Project Overview');
      overviewSheet.columns = [
        { header: 'Field', key: 'field', width: 25 },
        { header: 'Value', key: 'value', width: 40 }
      ];

      overviewSheet.addRows([
        { field: 'Project Name', value: project.name },
        { field: 'Status', value: project.status },
        { field: 'Start Date', value: project.startDate.toDateString() },
        { field: 'End Date', value: project.endDate.toDateString() },
        { field: 'Budget', value: `₹${project.budget.toLocaleString()}` },
        { field: 'Location', value: project.location },
        { field: 'Progress', value: `${project.progress || 0}%` }
      ]);

      // Tasks Sheet
      const tasksSheet = workbook.addWorksheet('Tasks');
      tasksSheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 15 },
        { header: 'Assignee', key: 'assignee', width: 25 },
        { header: 'Due Date', key: 'dueDate', width: 15 }
      ];

      project.tasks.forEach(task => {
        tasksSheet.addRow({
          title: task.title,
          status: task.status,
          priority: task.priority,
          assignee: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned',
          dueDate: task.dueDate ? task.dueDate.toDateString() : 'N/A'
        });
      });

      // Expenses Sheet
      const expensesSheet = workbook.addWorksheet('Expenses');
      expensesSheet.columns = [
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Description', key: 'description', width: 35 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Date', key: 'date', width: 15 }
      ];

      if (project.expenses && project.expenses.length > 0) {
        project.expenses.forEach(expense => {
          expensesSheet.addRow({
            category: expense.category,
            description: expense.description,
            amount: `₹${expense.amount.toLocaleString()}`,
            date: expense.date.toDateString()
          });
        });

        // Add total
        const totalRow = expensesSheet.addRow({
          category: 'TOTAL',
          amount: `₹${project.expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`
        });
        totalRow.font = { bold: true };
      }

      // Style headers
      [overviewSheet, tasksSheet, expensesSheet].forEach(sheet => {
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F46E5' }
        };
        sheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      });

      const fileName = `project_export_${projectId}_${Date.now()}.xlsx`;
      const filePath = path.join(this.reportsDir, fileName);

      await workbook.xlsx.writeFile(filePath);

      logger.info(`Excel report exported: ${fileName}`);

      return {
        fileName,
        filePath,
        url: `/reports/${fileName}`
      };
    } catch (error) {
      logger.error('Excel export error:', error);
      throw error;
    }
  }

  /**
   * Generate monthly summary report
   */
  async generateMonthlySummary(projectId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const [tasks, expenses, reports] = await Promise.all([
        prisma.task.findMany({
          where: {
            projectId,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.expense.findMany({
          where: {
            projectId,
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.dailyReport.findMany({
          where: {
            projectId,
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      const summary = {
        period: `${this.getMonthName(month)} ${year}`,
        tasksCreated: tasks.length,
        tasksCompleted: tasks.filter(t => t.status === 'completed').length,
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        reportsSubmitted: reports.length,
        avgDailyProgress: this.calculateAvgProgress(reports),
        issues: reports.reduce((sum, r) => sum + (r.issuesCount || 0), 0)
      };

      return summary;
    } catch (error) {
      logger.error('Monthly summary generation error:', error);
      throw error;
    }
  }

  // Helper methods
  calculateProjectStats(project) {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = project.tasks.filter(t => t.status === 'in_progress').length;
    const totalExpenses = project.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks: totalTasks - completedTasks - inProgressTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
      totalExpenses,
      budgetUsed: project.budget > 0 ? (totalExpenses / project.budget * 100).toFixed(1) : 0,
      teamSize: project.members?.length || 0
    };
  }

  getProjectReportHTML(project, stats) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Project Report - ${project.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }
          .header h1 { color: #4F46E5; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .info-item { padding: 15px; background: #F9FAFB; border-radius: 8px; }
          .info-item label { font-weight: bold; color: #666; display: block; margin-bottom: 5px; }
          .info-item value { font-size: 18px; color: #111; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { text-align: center; padding: 20px; background: #EEF2FF; border-radius: 8px; }
          .stat-card .number { font-size: 32px; font-weight: bold; color: #4F46E5; }
          .stat-card .label { color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #4F46E5; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #E5E7EB; }
          tr:hover { background: #F9FAFB; }
          .footer { margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${project.name}</h1>
          <p>Project Report - Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Project Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Status</label>
              <value>${project.status.toUpperCase()}</value>
            </div>
            <div class="info-item">
              <label>Location</label>
              <value>${project.location}</value>
            </div>
            <div class="info-item">
              <label>Start Date</label>
              <value>${project.startDate.toDateString()}</value>
            </div>
            <div class="info-item">
              <label>End Date</label>
              <value>${project.endDate.toDateString()}</value>
            </div>
            <div class="info-item">
              <label>Project Manager</label>
              <value>${project.projectManager.firstName} ${project.projectManager.lastName}</value>
            </div>
            <div class="info-item">
              <label>Budget</label>
              <value>₹${project.budget.toLocaleString()}</value>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Key Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="number">${stats.totalTasks}</div>
              <div class="label">Total Tasks</div>
            </div>
            <div class="stat-card">
              <div class="number">${stats.completedTasks}</div>
              <div class="label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="number">${stats.completionRate}%</div>
              <div class="label">Completion Rate</div>
            </div>
            <div class="stat-card">
              <div class="number">${stats.teamSize}</div>
              <div class="label">Team Members</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Budget Overview</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Total Budget</label>
              <value>₹${project.budget.toLocaleString()}</value>
            </div>
            <div class="info-item">
              <label>Total Expenses</label>
              <value>₹${stats.totalExpenses.toLocaleString()}</value>
            </div>
            <div class="info-item">
              <label>Budget Used</label>
              <value>${stats.budgetUsed}%</value>
            </div>
            <div class="info-item">
              <label>Remaining</label>
              <value>₹${(project.budget - stats.totalExpenses).toLocaleString()}</value>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Task Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              ${project.tasks.slice(0, 20).map(task => `
                <tr>
                  <td>${task.title}</td>
                  <td>${task.status}</td>
                  <td>${task.priority}</td>
                  <td>${task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Construction AI Platform - Project Management System</p>
          <p>© ${new Date().getFullYear()} All rights reserved</p>
        </div>
      </body>
      </html>
    `;
  }

  getDailyReportHTML(report) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Daily Report - ${report.date.toDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          h1 { color: #4F46E5; }
          .section { margin: 20px 0; padding: 20px; background: #F9FAFB; border-radius: 8px; }
          .section h2 { color: #4F46E5; margin-top: 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .info-row label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Progress Report</h1>
          <p>${report.project.name}</p>
          <p>Date: ${report.date.toDateString()}</p>
        </div>

        <div class="section">
          <h2>General Information</h2>
          <div class="info-row">
            <label>Weather:</label>
            <span>${report.weather || 'N/A'}</span>
          </div>
          <div class="info-row">
            <label>Workers Present:</label>
            <span>${report.workersPresent || 0}</span>
          </div>
          <div class="info-row">
            <label>Work Hours:</label>
            <span>${report.workHours || 0} hours</span>
          </div>
          <div class="info-row">
            <label>Reported By:</label>
            <span>${report.reportedBy.firstName} ${report.reportedBy.lastName}</span>
          </div>
        </div>

        <div class="section">
          <h2>Work Progress</h2>
          <p>${report.progressSummary || 'No summary provided'}</p>
        </div>

        ${report.safetyObservations ? `
          <div class="section">
            <h2>Safety Observations</h2>
            <p>${report.safetyObservations}</p>
          </div>
        ` : ''}

        ${report.issues ? `
          <div class="section">
            <h2>Issues & Challenges</h2>
            <p>${report.issues}</p>
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  calculateAvgProgress(reports) {
    if (reports.length === 0) return 0;
    const total = reports.reduce((sum, r) => sum + (r.progressPercent || 0), 0);
    return (total / reports.length).toFixed(1);
  }

  getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  }
}

module.exports = new ReportService();
