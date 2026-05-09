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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'daily' ? 'Submit Daily Report' : 'Report Site Issue'}
                </h2>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setCurrentSection(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {activeTab === 'daily' ? (
                <>
                  {/* Daily Report Tabs */}
                  <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {['Project Info', 'Weather & Site', 'Attendance', 'Progress', 'Materials', 'Equipment', 'Safety', 'Quality', 'Challenges', 'Tomorrow\'s Plan'].map((section, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentSection(index)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                          currentSection === index
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {['📋', '🌤️', '👷', '📊', '🧱', '🚜', '🛡️', '✅', '⚠️', '📅'][index]} {section}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateReport}>
                    <div className="max-h-[calc(90vh-280px)] overflow-y-auto px-1">
                      {/* Section 0: Project Info */}
                      {currentSection === 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Project Information</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Project *</label>
                              <select
                                className="input"
                                value={reportFormData.projectId}
                                onChange={(e) => setReportFormData({ ...reportFormData, projectId: e.target.value })}
                                required
                              >
                                <option value="">Select project</option>
                                {projects.map(project => (
                                  <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Date *</label>
                              <input
                                type="date"
                                className="input"
                                value={reportFormData.date}
                                onChange={(e) => setReportFormData({ ...reportFormData, date: e.target.value })}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Reported By *</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Engineer/Supervisor name"
                                value={reportFormData.reportedBy}
                                onChange={(e) => setReportFormData({ ...reportFormData, reportedBy: e.target.value })}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Shift *</label>
                              <select
                                className="input"
                                value={reportFormData.shift}
                                onChange={(e) => setReportFormData({ ...reportFormData, shift: e.target.value })}
                              >
                                <option value="DAY">Day Shift</option>
                                <option value="NIGHT">Night Shift</option>
                                <option value="BOTH">Both Shifts</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 1: Weather & Site */}
                      {currentSection === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🌤️ Weather & Site Conditions</h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Weather Condition</label>
                              <select
                                className="input"
                                value={reportFormData.weather}
                                onChange={(e) => setReportFormData({ ...reportFormData, weather: e.target.value })}
                              >
                                <option value="">Select weather</option>
                                <option value="SUNNY">Sunny</option>
                                <option value="CLOUDY">Cloudy</option>
                                <option value="RAINY">Rainy</option>
                                <option value="STORMY">Stormy</option>
                                <option value="FOGGY">Foggy</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Temperature (°C)</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="e.g., 28"
                                value={reportFormData.temperature}
                                onChange={(e) => setReportFormData({ ...reportFormData, temperature: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Humidity (%)</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="e.g., 65"
                                value={reportFormData.humidity}
                                onChange={(e) => setReportFormData({ ...reportFormData, humidity: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Site Conditions</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Describe overall site conditions (muddy, dry, dusty, etc.)"
                              value={reportFormData.siteConditions}
                              onChange={(e) => setReportFormData({ ...reportFormData, siteConditions: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 2: Attendance */}
                      {currentSection === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">👷 Workforce Attendance</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Total Workers Present *</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="e.g., 45"
                                value={reportFormData.workersCount}
                                onChange={(e) => setReportFormData({ ...reportFormData, workersCount: e.target.value })}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Absent Workers</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="e.g., 5"
                                value={reportFormData.absentCount}
                                onChange={(e) => setReportFormData({ ...reportFormData, absentCount: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Regular Work Hours</label>
                              <input
                                type="number"
                                step="0.5"
                                className="input"
                                placeholder="e.g., 8"
                                value={reportFormData.workHours}
                                onChange={(e) => setReportFormData({ ...reportFormData, workHours: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Overtime Hours</label>
                              <input
                                type="number"
                                step="0.5"
                                className="input"
                                placeholder="e.g., 2"
                                value={reportFormData.overtimeHours}
                                onChange={(e) => setReportFormData({ ...reportFormData, overtimeHours: e.target.value })}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-2">Skill Breakdown</label>
                              <textarea
                                className="input"
                                rows="2"
                                placeholder="e.g., Masons: 10, Helpers: 15, Electricians: 8, Plumbers: 5"
                                value={reportFormData.skillType}
                                onChange={(e) => setReportFormData({ ...reportFormData, skillType: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 3: Progress */}
                      {currentSection === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Work Progress</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Daily Summary *</label>
                            <textarea
                              className="input"
                              rows="4"
                              placeholder="Describe the overall work completed today in detail"
                              value={reportFormData.summary}
                              onChange={(e) => setReportFormData({ ...reportFormData, summary: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Completed Tasks</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List all tasks completed today (one per line)"
                              value={reportFormData.completedTasks}
                              onChange={(e) => setReportFormData({ ...reportFormData, completedTasks: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Pending Tasks</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List tasks that are still in progress"
                              value={reportFormData.pendingTasks}
                              onChange={(e) => setReportFormData({ ...reportFormData, pendingTasks: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Completion Percentage (%)</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="e.g., 15"
                                min="0"
                                max="100"
                                value={reportFormData.completionPercentage}
                                onChange={(e) => setReportFormData({ ...reportFormData, completionPercentage: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Delays / Reasons</label>
                              <textarea
                                className="input"
                                rows="1"
                                placeholder="Any delays encountered and reasons"
                                value={reportFormData.delaysReasons}
                                onChange={(e) => setReportFormData({ ...reportFormData, delaysReasons: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 4: Materials */}
                      {currentSection === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🧱 Material Consumption</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Materials Used Today</label>
                            <textarea
                              className="input"
                              rows="4"
                              placeholder="List materials used with quantities (e.g., Cement: 50 bags, Steel: 2 tons, Bricks: 5000 nos)"
                              value={reportFormData.materialsUsed}
                              onChange={(e) => setReportFormData({ ...reportFormData, materialsUsed: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Material Wastage</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Describe any material wastage and estimated quantity"
                              value={reportFormData.materialWastage}
                              onChange={(e) => setReportFormData({ ...reportFormData, materialWastage: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Material Shortage</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="List any materials that are running low or out of stock"
                              value={reportFormData.materialShortage}
                              onChange={(e) => setReportFormData({ ...reportFormData, materialShortage: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 5: Equipment */}
                      {currentSection === 5 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚜 Equipment Usage</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Equipment Used Today</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List all equipment used (e.g., Excavator: 8 hrs, Mixer: 6 hrs, Crane: 4 hrs)"
                              value={reportFormData.equipmentUsed}
                              onChange={(e) => setReportFormData({ ...reportFormData, equipmentUsed: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Equipment Breakdown / Issues</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Report any equipment failures or maintenance issues"
                              value={reportFormData.equipmentBreakdown}
                              onChange={(e) => setReportFormData({ ...reportFormData, equipmentBreakdown: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Equipment Idle Time</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Note any equipment that remained idle and reasons"
                              value={reportFormData.equipmentIdleTime}
                              onChange={(e) => setReportFormData({ ...reportFormData, equipmentIdleTime: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 6: Safety */}
                      {currentSection === 6 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🛡️ Safety & Compliance</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Safety Observations</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Describe any safety observations or concerns noted today"
                              value={reportFormData.safetyObservations}
                              onChange={(e) => setReportFormData({ ...reportFormData, safetyObservations: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Accidents / Incidents</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Report any accidents, near-misses, or incidents (provide details)"
                              value={reportFormData.accidentsIncidents}
                              onChange={(e) => setReportFormData({ ...reportFormData, accidentsIncidents: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">PPE Compliance Status</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Note PPE compliance level and any violations observed"
                              value={reportFormData.ppeCompliance}
                              onChange={(e) => setReportFormData({ ...reportFormData, ppeCompliance: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Safety Violations</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="List any safety violations and corrective actions taken"
                              value={reportFormData.safetyViolations}
                              onChange={(e) => setReportFormData({ ...reportFormData, safetyViolations: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 7: Quality */}
                      {currentSection === 7 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">✅ Quality Control</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Quality Inspections Conducted</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List all quality inspections performed today with results"
                              value={reportFormData.qualityInspections}
                              onChange={(e) => setReportFormData({ ...reportFormData, qualityInspections: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Quality Issues Identified</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Report any quality defects or non-conformances"
                              value={reportFormData.qualityIssues}
                              onChange={(e) => setReportFormData({ ...reportFormData, qualityIssues: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Testing Results</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Note any material testing or quality test results"
                              value={reportFormData.testingResults}
                              onChange={(e) => setReportFormData({ ...reportFormData, testingResults: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 8: Challenges */}
                      {currentSection === 8 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ Challenges & Issues</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Major Challenges Faced</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Describe major challenges or problems encountered today"
                              value={reportFormData.challenges}
                              onChange={(e) => setReportFormData({ ...reportFormData, challenges: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Obstacles Encountered</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List specific obstacles that hindered progress"
                              value={reportFormData.obstaclesEncountered}
                              onChange={(e) => setReportFormData({ ...reportFormData, obstaclesEncountered: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Remedial Actions Taken</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Describe actions taken to resolve the challenges"
                              value={reportFormData.remedialActions}
                              onChange={(e) => setReportFormData({ ...reportFormData, remedialActions: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 9: Tomorrow's Plan */}
                      {currentSection === 9 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📅 Tomorrow's Plan</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Planned Activities</label>
                            <textarea
                              className="input"
                              rows="4"
                              placeholder="List all activities planned for tomorrow"
                              value={reportFormData.plannedActivities}
                              onChange={(e) => setReportFormData({ ...reportFormData, plannedActivities: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Required Resources</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List materials, equipment, and manpower required for tomorrow"
                              value={reportFormData.requiredResources}
                              onChange={(e) => setReportFormData({ ...reportFormData, requiredResources: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Critical Activities</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Highlight any critical activities that need special attention"
                              value={reportFormData.criticalActivities}
                              onChange={(e) => setReportFormData({ ...reportFormData, criticalActivities: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Visitor Details</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Note any client visits or inspections scheduled"
                              value={reportFormData.visitorDetails}
                              onChange={(e) => setReportFormData({ ...reportFormData, visitorDetails: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Photographs / Attachments</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Photo references or document links"
                              value={reportFormData.photographs}
                              onChange={(e) => setReportFormData({ ...reportFormData, photographs: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Additional Remarks</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Any other important information or comments"
                              value={reportFormData.remarks}
                              onChange={(e) => setReportFormData({ ...reportFormData, remarks: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Step {currentSection + 1} of 10
                      </div>
                      <div className="flex gap-3">
                        {currentSection > 0 && (
                          <button
                            type="button"
                            onClick={() => setCurrentSection(currentSection - 1)}
                            className="btn-ghost"
                          >
                            Previous
                          </button>
                        )}
                        {currentSection < 9 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentSection(currentSection + 1)}
                            className="btn-primary"
                          >
                            Next
                          </button>
                        ) : (
                          <button type="submit" className="btn-primary">
                            Submit Report
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  {/* Site Issue Tabs */}
                  <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {['Basic Info', 'Location', 'Impact', 'Root Cause', 'Actions', 'Responsibility', 'Documentation', 'Additional'].map((section, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentSection(index)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                          currentSection === index
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {['📋', '📍', '💥', '🔍', '🔧', '👤', '📎', '📝'][index]} {section}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateIssue}>
                    <div className="max-h-[calc(90vh-280px)] overflow-y-auto px-1">
                      {/* Section 0: Basic Info */}
                      {currentSection === 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Basic Information</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Issue Title *</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Brief, descriptive title of the issue"
                              value={issueFormData.title}
                              onChange={(e) => setIssueFormData({ ...issueFormData, title: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Project *</label>
                            <select
                              className="input"
                              value={issueFormData.projectId}
                              onChange={(e) => setIssueFormData({ ...issueFormData, projectId: e.target.value })}
                              required
                            >
                              <option value="">Select project</option>
                              {projects.map(project => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Severity *</label>
                              <select
                                className="input"
                                value={issueFormData.severity}
                                onChange={(e) => setIssueFormData({ ...issueFormData, severity: e.target.value })}
                              >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Issue Type *</label>
                              <select
                                className="input"
                                value={issueFormData.issueType}
                                onChange={(e) => setIssueFormData({ ...issueFormData, issueType: e.target.value })}
                              >
                                <option value="QUALITY">Quality Issue</option>
                                <option value="SAFETY">Safety Concern</option>
                                <option value="SCHEDULE">Schedule Delay</option>
                                <option value="RESOURCE">Resource Problem</option>
                                <option value="DESIGN">Design Issue</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Detailed Description *</label>
                            <textarea
                              className="input"
                              rows="5"
                              placeholder="Provide a detailed description of the issue, including when it was discovered and current status"
                              value={issueFormData.description}
                              onChange={(e) => setIssueFormData({ ...issueFormData, description: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 1: Location */}
                      {currentSection === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📍 Location Details</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">General Location</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Building A, West Wing"
                              value={issueFormData.location}
                              onChange={(e) => setIssueFormData({ ...issueFormData, location: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Floor / Level</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 3rd Floor, Basement"
                                value={issueFormData.floor}
                                onChange={(e) => setIssueFormData({ ...issueFormData, floor: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Zone / Area</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., Zone B, North Section"
                                value={issueFormData.zone}
                                onChange={(e) => setIssueFormData({ ...issueFormData, zone: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Specific Area</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., Column C-15, Beam B-23"
                                value={issueFormData.specificArea}
                                onChange={(e) => setIssueFormData({ ...issueFormData, specificArea: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 2: Impact */}
                      {currentSection === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💥 Impact Assessment</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Impact Level</label>
                            <select
                              className="input"
                              value={issueFormData.impactLevel}
                              onChange={(e) => setIssueFormData({ ...issueFormData, impactLevel: e.target.value })}
                            >
                              <option value="MINOR">Minor - No significant impact</option>
                              <option value="MODERATE">Moderate - Some impact on progress</option>
                              <option value="MAJOR">Major - Significant impact</option>
                              <option value="SEVERE">Severe - Critical impact</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Affected Area / Work</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Describe what work or areas are affected by this issue"
                              value={issueFormData.affectedArea}
                              onChange={(e) => setIssueFormData({ ...issueFormData, affectedArea: e.target.value })}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Estimated Cost Impact (₹)</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="e.g., 50000"
                                value={issueFormData.estimatedCost}
                                onChange={(e) => setIssueFormData({ ...issueFormData, estimatedCost: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Time Impact (days)</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 3 days delay"
                                value={issueFormData.timeImpact}
                                onChange={(e) => setIssueFormData({ ...issueFormData, timeImpact: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 3: Root Cause */}
                      {currentSection === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔍 Root Cause Analysis</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Root Cause</label>
                            <textarea
                              className="input"
                              rows="4"
                              placeholder="Identify and describe the root cause of the issue"
                              value={issueFormData.rootCause}
                              onChange={(e) => setIssueFormData({ ...issueFormData, rootCause: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Cause Category</label>
                            <select
                              className="input"
                              value={issueFormData.causeCategory}
                              onChange={(e) => setIssueFormData({ ...issueFormData, causeCategory: e.target.value })}
                            >
                              <option value="">Select category</option>
                              <option value="MATERIAL">Material Related</option>
                              <option value="WORKMANSHIP">Workmanship</option>
                              <option value="DESIGN">Design Issue</option>
                              <option value="EQUIPMENT">Equipment Failure</option>
                              <option value="WEATHER">Weather Related</option>
                              <option value="MANAGEMENT">Management/Planning</option>
                              <option value="EXTERNAL">External Factors</option>
                            </select>
                          </div>

                          <div>
                            <label className="flex items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={issueFormData.preventable}
                                onChange={(e) => setIssueFormData({ ...issueFormData, preventable: e.target.checked })}
                              />
                              This issue was preventable
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Section 4: Actions */}
                      {currentSection === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔧 Corrective & Preventive Actions</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Immediate Action Taken</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Describe immediate actions taken to address the issue"
                              value={issueFormData.immediateAction}
                              onChange={(e) => setIssueFormData({ ...issueFormData, immediateAction: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Suggested Corrective Action</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Recommend long-term corrective actions"
                              value={issueFormData.suggestedAction}
                              onChange={(e) => setIssueFormData({ ...issueFormData, suggestedAction: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Corrective Action Plan</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Detailed plan to fix the issue"
                              value={issueFormData.correctiveAction}
                              onChange={(e) => setIssueFormData({ ...issueFormData, correctiveAction: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Preventive Action</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Actions to prevent recurrence of similar issues"
                              value={issueFormData.preventiveAction}
                              onChange={(e) => setIssueFormData({ ...issueFormData, preventiveAction: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 5: Responsibility */}
                      {currentSection === 5 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">👤 Responsibility & Timeline</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Responsible Person / Department</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name or department responsible for the issue"
                              value={issueFormData.responsiblePerson}
                              onChange={(e) => setIssueFormData({ ...issueFormData, responsiblePerson: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Assigned To (for Resolution)</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Person assigned to resolve the issue"
                              value={issueFormData.assignedTo}
                              onChange={(e) => setIssueFormData({ ...issueFormData, assignedTo: e.target.value })}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Target Resolution Date</label>
                            <input
                              type="date"
                              className="input"
                              value={issueFormData.targetResolutionDate}
                              onChange={(e) => setIssueFormData({ ...issueFormData, targetResolutionDate: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 6: Documentation */}
                      {currentSection === 6 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📎 Documentation</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Evidence Photos</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Photo links or references"
                              value={issueFormData.evidencePhotos}
                              onChange={(e) => setIssueFormData({ ...issueFormData, evidencePhotos: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated photo URLs or file references</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Related Documents</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Document references"
                              value={issueFormData.relatedDocuments}
                              onChange={(e) => setIssueFormData({ ...issueFormData, relatedDocuments: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Drawings, specifications, or other relevant documents</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Witness Details</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Names and details of witnesses who can verify the issue"
                              value={issueFormData.witnessDetails}
                              onChange={(e) => setIssueFormData({ ...issueFormData, witnessDetails: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 7: Additional */}
                      {currentSection === 7 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📝 Additional Information</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Priority Level</label>
                            <select
                              className="input"
                              value={issueFormData.priorityLevel}
                              onChange={(e) => setIssueFormData({ ...issueFormData, priorityLevel: e.target.value })}
                            >
                              <option value="LOW">Low Priority</option>
                              <option value="MEDIUM">Medium Priority</option>
                              <option value="HIGH">High Priority</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={issueFormData.escalationRequired}
                                onChange={(e) => setIssueFormData({ ...issueFormData, escalationRequired: e.target.checked })}
                              />
                              Escalation to management required
                            </label>

                            <label className="flex items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={issueFormData.notifyStakeholders}
                                onChange={(e) => setIssueFormData({ ...issueFormData, notifyStakeholders: e.target.checked })}
                              />
                              Notify stakeholders (Client/Consultant)
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Additional Remarks</label>
                            <textarea
                              className="input"
                              rows="4"
                              placeholder="Any other relevant information or comments"
                              value={issueFormData.remarks}
                              onChange={(e) => setIssueFormData({ ...issueFormData, remarks: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Step {currentSection + 1} of 8
                      </div>
                      <div className="flex gap-3">
                        {currentSection > 0 && (
                          <button
                            type="button"
                            onClick={() => setCurrentSection(currentSection - 1)}
                            className="btn-ghost"
                          >
                            Previous
                          </button>
                        )}
                        {currentSection < 7 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentSection(currentSection + 1)}
                            className="btn-primary"
                          >
                            Next
                          </button>
                        ) : (
                          <button type="submit" className="btn-primary">
                            Report Issue
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
