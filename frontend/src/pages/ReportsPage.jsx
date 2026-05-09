import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import projectService from '../services/project.service';
import reportService from '../services/report.service';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [showReportModal, setShowReportModal] = useState(false);
  const [dailyReports, setDailyReports] = useState([]);
  const [siteIssues, setSiteIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [reportFormData, setReportFormData] = useState({
    // Project Information
    projectId: '',
    date: '',
    reportedBy: '',
    shift: 'DAY',

    // Weather & Site Conditions
    weather: '',
    temperature: '',
    humidity: '',
    siteConditions: '',

    // Attendance
    workersCount: '',
    skillType: '',
    absentCount: '',
    workHours: '',
    overtimeHours: '',

    // Progress Details
    summary: '',
    completedTasks: '',
    pendingTasks: '',
    delaysReasons: '',
    completionPercentage: '',

    // Material Consumption
    materialsUsed: '',
    materialWastage: '',
    materialShortage: '',

    // Equipment Usage
    equipmentUsed: '',
    equipmentBreakdown: '',
    equipmentIdleTime: '',

    // Safety Compliance
    safetyObservations: '',
    accidentsIncidents: '',
    ppeCompliance: '',
    safetyViolations: '',

    // Quality Control
    qualityInspections: '',
    qualityIssues: '',
    testingResults: '',

    // Challenges & Issues
    challenges: '',
    obstaclesEncountered: '',
    remedialActions: '',

    // Tomorrow's Plan
    plannedActivities: '',
    requiredResources: '',
    criticalActivities: '',

    // Additional
    visitorDetails: '',
    photographs: '',
    remarks: ''
  });
  const [issueFormData, setIssueFormData] = useState({
    // Basic Information
    projectId: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    issueType: 'QUALITY',

    // Location Details
    location: '',
    floor: '',
    zone: '',
    specificArea: '',

    // Impact Assessment
    impactLevel: 'MODERATE',
    affectedArea: '',
    estimatedCost: '',
    timeImpact: '',

    // Root Cause
    rootCause: '',
    causeCategory: '',
    preventable: true,

    // Corrective Actions
    suggestedAction: '',
    immediateAction: '',
    correctiveAction: '',
    preventiveAction: '',

    // Responsibility
    responsiblePerson: '',
    assignedTo: '',
    targetResolutionDate: '',

    // Documentation
    evidencePhotos: '',
    relatedDocuments: '',
    witnessDetails: '',

    // Additional
    priorityLevel: 'MEDIUM',
    escalationRequired: false,
    notifyStakeholders: false,
    remarks: ''
  });

  // Fetch data from API
  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadData();
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      const projectList = response.data.projects || [];
      setProjects(projectList);
      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      const [reportsResponse, issuesResponse] = await Promise.all([
        reportService.getDailyReports(selectedProjectId),
        reportService.getSiteIssues(selectedProjectId)
      ]);
      setDailyReports(reportsResponse.data.reports || []);
      setSiteIssues(issuesResponse.data.issues || []);
    } catch (error) {
      console.error('Failed to load reports data:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      await reportService.createDailyReport(reportFormData);
      toast.success('Report created successfully!');
      setShowReportModal(false);
      setCurrentSection(0);
      setReportFormData({
        projectId: '',
        date: '',
        reportedBy: '',
        shift: 'DAY',
        weather: '',
        temperature: '',
        humidity: '',
        siteConditions: '',
        workersCount: '',
        skillType: '',
        absentCount: '',
        workHours: '',
        overtimeHours: '',
        summary: '',
        completedTasks: '',
        pendingTasks: '',
        delaysReasons: '',
        completionPercentage: '',
        materialsUsed: '',
        materialWastage: '',
        materialShortage: '',
        equipmentUsed: '',
        equipmentBreakdown: '',
        equipmentIdleTime: '',
        safetyObservations: '',
        accidentsIncidents: '',
        ppeCompliance: '',
        safetyViolations: '',
        qualityInspections: '',
        qualityIssues: '',
        testingResults: '',
        challenges: '',
        obstaclesEncountered: '',
        remedialActions: '',
        plannedActivities: '',
        requiredResources: '',
        criticalActivities: '',
        visitorDetails: '',
        photographs: '',
        remarks: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create report:', error);
      toast.error(error.response?.data?.message || 'Failed to create report');
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await reportService.createSiteIssue(issueFormData);
      toast.success('Issue reported successfully!');
      setShowReportModal(false);
      setCurrentSection(0);
      setIssueFormData({
        projectId: '',
        title: '',
        description: '',
        severity: 'MEDIUM',
        issueType: 'QUALITY',
        location: '',
        floor: '',
        zone: '',
        specificArea: '',
        impactLevel: 'MODERATE',
        affectedArea: '',
        estimatedCost: '',
        timeImpact: '',
        rootCause: '',
        causeCategory: '',
        preventable: true,
        suggestedAction: '',
        immediateAction: '',
        correctiveAction: '',
        preventiveAction: '',
        responsiblePerson: '',
        assignedTo: '',
        targetResolutionDate: '',
        evidencePhotos: '',
        relatedDocuments: '',
        witnessDetails: '',
        priorityLevel: 'MEDIUM',
        escalationRequired: false,
        notifyStakeholders: false,
        remarks: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create issue:', error);
      toast.error(error.response?.data?.message || 'Failed to report issue');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[severity] || colors.medium;
  };

  const getIssueStatusColor = (status) => {
    const colors = {
      open: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };
    return colors[status] || colors.open;
  };

  if (loading && !selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <div className="card">
        <label className="block text-sm font-medium mb-2">Select Project</label>
        <select
          className="input max-w-md"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">Choose a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Reports</h3>
          <p className="text-3xl font-bold mt-2">{dailyReports.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This project</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Issues</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {siteIssues.filter(i => i.status === 'OPEN').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Requires attention</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workers</h3>
          <p className="text-3xl font-bold mt-2">
            {dailyReports.reduce((sum, r) => sum + parseInt(r.workersCount || 0), 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From reports</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Issues</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {siteIssues.filter(i => i.severity === 'CRITICAL' && i.status === 'OPEN').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Urgent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('daily')}
            >
              Daily Reports
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'issues'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('issues')}
            >
              Site Issues
            </button>
          </div>
          <button className="btn-primary mb-3" onClick={() => setShowReportModal(true)}>
            + {activeTab === 'daily' ? 'New Report' : 'Report Issue'}
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'daily' && (
            <div className="space-y-4">
              {dailyReports.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No daily reports found for this project
                </div>
              ) : (
                dailyReports.map(report => (
                  <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{report.project?.name || 'Project Report'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(report.date).toLocaleDateString()} • Reported by {report.reporter?.firstName || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Weather</p>
                        <p className="font-medium">{report.weather || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Workers</p>
                        <p className="font-medium">{report.workersCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Work Hours</p>
                        <p className="font-medium">{report.workHours || 0}h</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{report.summary || 'No summary available'}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="btn-ghost text-sm">View Details</button>
                      <button className="btn-ghost text-sm">Download PDF</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-4">
              {siteIssues.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No issues found for this project
                </div>
              ) : (
                siteIssues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{issue.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity?.toLowerCase() || 'medium')}`}>
                            {issue.severity}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getIssueStatusColor(issue.status?.toLowerCase() || 'open')}`}>
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {issue.project?.name || 'Project'} • Reported by {issue.reporter?.firstName || 'Unknown'} on {new Date(issue.reportedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{issue.description || 'No description'}</p>

                    <div className="flex gap-2">
                      <button className="btn-ghost text-sm">View Details</button>
                      {issue.status !== 'RESOLVED' && (
                        <>
                          <button className="btn-ghost text-sm">Update Status</button>
                          <button className="btn-ghost text-sm">Add Comment</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Report/Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'daily' ? 'Submit Daily Report' : 'Report Site Issue'}
                </h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4">
                {activeTab === 'daily' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input type="date" className="input" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Project</label>
                        <select className="input" required>
                          <option value="">Select project</option>
                          <option value="1">Residential Complex</option>
                          <option value="2">Commercial Tower</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Weather</label>
                        <select className="input" required>
                          <option value="sunny">Sunny</option>
                          <option value="cloudy">Cloudy</option>
                          <option value="rainy">Rainy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Workers Present</label>
                        <input type="number" className="input" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Work Hours</label>
                        <input type="number" className="input" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Progress Summary</label>
                      <textarea className="input" rows="4" placeholder="Describe the work completed today" required></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Safety Observations</label>
                      <textarea className="input" rows="3" placeholder="Any safety concerns or observations"></textarea>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue Title</label>
                      <input type="text" className="input" placeholder="Brief description of the issue" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Project</label>
                        <select className="input" required>
                          <option value="">Select project</option>
                          <option value="1">Residential Complex</option>
                          <option value="2">Commercial Tower</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Severity</label>
                        <select className="input" required>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea className="input" rows="4" placeholder="Detailed description of the issue" required></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Suggested Action</label>
                      <textarea className="input" rows="2" placeholder="Recommended actions to resolve"></textarea>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Submit
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
