import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import resourceService from '../services/resource.service';
import projectService from '../services/project.service';

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('workers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workerFormData, setWorkerFormData] = useState({
    // Personal Information
    name: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: '',
    fatherName: '',
    contactNumber: '',
    alternateNumber: '',
    email: '',

    // Address Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    permanentAddress: '',

    // Identification Documents
    aadharNumber: '',
    panNumber: '',
    voterId: '',
    drivingLicense: '',
    passportNumber: '',

    // Professional Details
    skillType: '',
    qualification: '',
    certifications: '',
    experienceYears: '',
    previousEmployer: '',
    specializations: '',

    // Employment Details
    joiningDate: '',
    employmentType: 'DAILY_WAGE',
    contractDuration: '',
    hourlyRate: '',
    overtimeRate: '',
    monthlySalary: '',

    // Health & Safety
    medicalFitness: 'FIT',
    safetyTrainingCompleted: false,
    safetyTrainingDate: '',
    ppeIssued: false,
    insurancePolicyNumber: '',

    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactNumber: '',

    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',

    // Additional Information
    languagesKnown: '',
    workPreference: '',
    availability: 'FULL_TIME',
    transportationMode: '',
    skills: '',
    remarks: '',
    status: 'ACTIVE'
  });

  const [currentWorkerSection, setCurrentWorkerSection] = useState(0);
  const [currentEquipmentSection, setCurrentEquipmentSection] = useState(0);
  const [equipmentFormData, setEquipmentFormData] = useState({
    // Basic Information
    name: '',
    equipmentType: '',
    category: '',
    manufacturer: '',
    manufacturingYear: '',
    condition: 'EXCELLENT',

    // Technical Specifications
    model: '',
    serialNumber: '',
    registrationNumber: '',
    capacity: '',
    powerRating: '',
    voltage: '',
    fuelType: '',
    dimensions: '',
    weight: '',

    // Purchase Information
    supplierName: '',
    supplierContact: '',
    purchaseDate: '',
    purchasePrice: '',
    invoiceNumber: '',
    warrantyPeriod: '',
    warrantyExpiryDate: '',

    // Operational Details
    operatingHours: '',
    fuelConsumption: '',
    efficiencyRating: '',
    operatorRequired: true,
    operatorLicenseType: '',
    safetyFeatures: '',

    // Financial Details
    rentalCostPerDay: '',
    rentalCostPerHour: '',
    depreciationRate: '',
    currentValue: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',

    // Compliance & Safety
    safetyCertifications: '',
    lastInspectionDate: '',
    nextInspectionDate: '',
    inspectionAuthority: '',
    pollutionCertificate: '',
    fitnessCertificate: '',
    permits: '',

    // Location & Assignment
    currentLocation: '',
    assignedProject: '',
    assignedOperator: '',
    siteAddress: '',
    availabilityStatus: 'AVAILABLE',

    // Maintenance
    lastServiceDate: '',
    nextServiceDue: '',
    serviceProvider: '',
    maintenanceSchedule: '',
    maintenanceHistory: '',
    spareParts: '',

    // Additional
    remarks: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    loadData();
    loadProjects();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersResponse, equipmentResponse] = await Promise.all([
        resourceService.getWorkers(),
        resourceService.getEquipment()
      ]);
      setWorkers(workersResponse.data.workers || []);
      setEquipment(equipmentResponse.data.equipment || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      await resourceService.createWorker(workerFormData);
      toast.success('Worker added successfully!');
      setShowAddModal(false);
      setCurrentWorkerSection(0);
      setWorkerFormData({
        name: '',
        dateOfBirth: '',
        gender: 'MALE',
        bloodGroup: '',
        fatherName: '',
        contactNumber: '',
        alternateNumber: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        permanentAddress: '',
        aadharNumber: '',
        panNumber: '',
        voterId: '',
        drivingLicense: '',
        passportNumber: '',
        skillType: '',
        qualification: '',
        certifications: '',
        experienceYears: '',
        previousEmployer: '',
        specializations: '',
        joiningDate: '',
        employmentType: 'DAILY_WAGE',
        contractDuration: '',
        hourlyRate: '',
        overtimeRate: '',
        monthlySalary: '',
        medicalFitness: 'FIT',
        safetyTrainingCompleted: false,
        safetyTrainingDate: '',
        ppeIssued: false,
        insurancePolicyNumber: '',
        emergencyContactName: '',
        emergencyContactRelation: '',
        emergencyContactNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        languagesKnown: '',
        workPreference: '',
        availability: 'FULL_TIME',
        transportationMode: '',
        skills: '',
        remarks: '',
        status: 'ACTIVE'
      });
      loadData();
    } catch (error) {
      console.error('Failed to add worker:', error);
      toast.error(error.response?.data?.message || 'Failed to add worker');
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      await resourceService.createEquipment(equipmentFormData);
      toast.success('Equipment added successfully!');
      setShowAddModal(false);
      setCurrentEquipmentSection(0);
      setEquipmentFormData({
        name: '',
        equipmentType: '',
        category: '',
        manufacturer: '',
        manufacturingYear: '',
        condition: 'EXCELLENT',
        model: '',
        serialNumber: '',
        registrationNumber: '',
        capacity: '',
        powerRating: '',
        voltage: '',
        fuelType: '',
        dimensions: '',
        weight: '',
        supplierName: '',
        supplierContact: '',
        purchaseDate: '',
        purchasePrice: '',
        invoiceNumber: '',
        warrantyPeriod: '',
        warrantyExpiryDate: '',
        operatingHours: '',
        fuelConsumption: '',
        efficiencyRating: '',
        operatorRequired: true,
        operatorLicenseType: '',
        safetyFeatures: '',
        rentalCostPerDay: '',
        rentalCostPerHour: '',
        depreciationRate: '',
        currentValue: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceExpiryDate: '',
        safetyCertifications: '',
        lastInspectionDate: '',
        nextInspectionDate: '',
        inspectionAuthority: '',
        pollutionCertificate: '',
        fitnessCertificate: '',
        permits: '',
        currentLocation: '',
        assignedProject: '',
        assignedOperator: '',
        siteAddress: '',
        availabilityStatus: 'AVAILABLE',
        lastServiceDate: '',
        nextServiceDue: '',
        serviceProvider: '',
        maintenanceSchedule: '',
        maintenanceHistory: '',
        spareParts: '',
        remarks: '',
        status: 'AVAILABLE'
      });
      loadData();
    } catch (error) {
      console.error('Failed to add equipment:', error);
      toast.error(error.response?.data?.message || 'Failed to add equipment');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    try {
      await resourceService.deleteWorker(workerId);
      toast.success('Worker deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete worker:', error);
      toast.error('Failed to delete worker');
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await resourceService.deleteEquipment(equipmentId);
      toast.success('Equipment deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      toast.error('Failed to delete equipment');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      ON_LEAVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      AVAILABLE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      IN_USE: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      MAINTENANCE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return colors[status] || colors.ACTIVE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Workers</h3>
          <p className="text-3xl font-bold mt-2">{workers.length}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {workers.filter(w => w.status === 'ACTIVE').length} active
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Equipment</h3>
          <p className="text-3xl font-bold mt-2">{equipment.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {equipment.filter(e => e.status === 'AVAILABLE' || e.status === 'IN_USE').length} operational
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Use</h3>
          <p className="text-3xl font-bold mt-2">
            {equipment.filter(e => e.status === 'IN_USE').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Equipment active</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">
            {equipment.filter(e => e.status === 'MAINTENANCE').length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Under maintenance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'workers'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('workers')}
            >
              Workers
            </button>
            <button
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'equipment'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('equipment')}
            >
              Equipment
            </button>
          </div>
          <button className="btn-primary mb-3" onClick={() => setShowAddModal(true)}>
            + Add {activeTab === 'workers' ? 'Worker' : 'Equipment'}
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'workers' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {workers.length === 0 ? (
                <p className="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">
                  No workers found. Click "Add Worker" to get started.
                </p>
              ) : (
                workers.map(worker => (
                  <div key={worker.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{worker.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{worker.skillType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                        {worker.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                        <span className="font-medium">{worker.experienceYears || 0} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Hourly Rate:</span>
                        <span className="font-medium">₹{parseFloat(worker.hourlyRate || 0).toFixed(2)}</span>
                      </div>
                      {worker.contactNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                          <span className="font-medium">{worker.contactNumber}</span>
                        </div>
                      )}
                      {worker.email && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Email:</span>
                          <span className="font-medium text-xs">{worker.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="btn-ghost text-sm flex-1">View Details</button>
                      <button
                        className="btn-ghost text-sm text-red-600"
                        onClick={() => handleDeleteWorker(worker.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="overflow-x-auto">
              {equipment.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No equipment found. Click "Add Equipment" to get started.
                </p>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Equipment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Model</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Serial #</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rate/Day</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {equipment.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-4 font-medium">{item.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.equipmentType}</td>
                        <td className="px-4 py-4 text-sm">{item.model || '-'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{item.serialNumber || '-'}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-medium">
                          ₹{parseFloat(item.rentalCostPerDay || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button className="text-primary-600 hover:text-primary-700 text-sm mr-2">Details</button>
                          <button
                            className="text-red-600 hover:text-red-700 text-sm"
                            onClick={() => handleDeleteEquipment(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white dark:bg-gray-800 rounded-xl w-full max-h-[95vh] shadow-2xl flex flex-col ${
            activeTab === 'workers' ? 'max-w-5xl' : 'max-w-2xl'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    Add {activeTab === 'workers' ? 'Worker' : 'Equipment'}
                  </h2>
                  {activeTab === 'workers' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Complete worker profile with all necessary details
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setCurrentWorkerSection(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-6">

              {activeTab === 'workers' ? (
                <div>
                  {/* Worker Section Tabs */}
                  <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:border-gray-900 -mx-6 px-6">
                    {[
                      { id: 0, label: '👤 Personal', icon: '👤' },
                      { id: 1, label: '📍 Address', icon: '📍' },
                      { id: 2, label: '🆔 Documents', icon: '🆔' },
                      { id: 3, label: '💼 Professional', icon: '💼' },
                      { id: 4, label: '💰 Employment', icon: '💰' },
                      { id: 5, label: '🏥 Health & Safety', icon: '🏥' },
                      { id: 6, label: '🚨 Emergency', icon: '🚨' },
                      { id: 7, label: '🏦 Bank Details', icon: '🏦' }
                    ].map(section => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setCurrentWorkerSection(section.id)}
                        className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                          currentWorkerSection === section.id
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleAddWorker} className="mt-6">
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                      {/* Section 0: Personal Information */}
                      {currentWorkerSection === 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Complete name as per official documents"
                              value={workerFormData.name}
                              onChange={(e) => setWorkerFormData({...workerFormData, name: e.target.value})}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Date of Birth</label>
                              <input
                                type="date"
                                className="input"
                                value={workerFormData.dateOfBirth}
                                onChange={(e) => setWorkerFormData({...workerFormData, dateOfBirth: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Gender</label>
                              <select
                                className="input"
                                value={workerFormData.gender}
                                onChange={(e) => setWorkerFormData({...workerFormData, gender: e.target.value})}
                              >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Blood Group</label>
                              <select
                                className="input"
                                value={workerFormData.bloodGroup}
                                onChange={(e) => setWorkerFormData({...workerFormData, bloodGroup: e.target.value})}
                              >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Father's Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Father's full name"
                              value={workerFormData.fatherName}
                              onChange={(e) => setWorkerFormData({...workerFormData, fatherName: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Primary Contact Number *</label>
                              <input
                                type="tel"
                                className="input"
                                placeholder="+91 XXXXX XXXXX"
                                value={workerFormData.contactNumber}
                                onChange={(e) => setWorkerFormData({...workerFormData, contactNumber: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Alternate Number</label>
                              <input
                                type="tel"
                                className="input"
                                placeholder="+91 XXXXX XXXXX"
                                value={workerFormData.alternateNumber}
                                onChange={(e) => setWorkerFormData({...workerFormData, alternateNumber: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                              type="email"
                              className="input"
                              placeholder="worker@example.com"
                              value={workerFormData.email}
                              onChange={(e) => setWorkerFormData({...workerFormData, email: e.target.value})}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 1: Address Information */}
                      {currentWorkerSection === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Address Information</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Current Address</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="House/Flat no., Street, Landmark"
                              value={workerFormData.address}
                              onChange={(e) => setWorkerFormData({...workerFormData, address: e.target.value})}
                            ></textarea>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">City</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="City name"
                                value={workerFormData.city}
                                onChange={(e) => setWorkerFormData({...workerFormData, city: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">State</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="State name"
                                value={workerFormData.state}
                                onChange={(e) => setWorkerFormData({...workerFormData, state: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">PIN Code</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="XXXXXX"
                                maxLength="6"
                                value={workerFormData.pincode}
                                onChange={(e) => setWorkerFormData({...workerFormData, pincode: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Permanent Address</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Complete permanent address (if different from current)"
                              value={workerFormData.permanentAddress}
                              onChange={(e) => setWorkerFormData({...workerFormData, permanentAddress: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* Section 2: Identification Documents */}
                      {currentWorkerSection === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Identification Documents</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Aadhar Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="XXXX XXXX XXXX"
                                maxLength="12"
                                value={workerFormData.aadharNumber}
                                onChange={(e) => setWorkerFormData({...workerFormData, aadharNumber: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">PAN Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="ABCDE1234F"
                                maxLength="10"
                                value={workerFormData.panNumber}
                                onChange={(e) => setWorkerFormData({...workerFormData, panNumber: e.target.value.toUpperCase()})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Voter ID</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Voter ID number"
                                value={workerFormData.voterId}
                                onChange={(e) => setWorkerFormData({...workerFormData, voterId: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Driving License</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="DL number (if applicable)"
                                value={workerFormData.drivingLicense}
                                onChange={(e) => setWorkerFormData({...workerFormData, drivingLicense: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Passport Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Passport number (if available)"
                              value={workerFormData.passportNumber}
                              onChange={(e) => setWorkerFormData({...workerFormData, passportNumber: e.target.value})}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 3: Professional Details */}
                      {currentWorkerSection === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Professional Details</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Skill Type *</label>
                              <select
                                className="input"
                                value={workerFormData.skillType}
                                onChange={(e) => setWorkerFormData({...workerFormData, skillType: e.target.value})}
                                required
                              >
                                <option value="">Select Skill</option>
                                <option value="MASON">Mason</option>
                                <option value="CARPENTER">Carpenter</option>
                                <option value="ELECTRICIAN">Electrician</option>
                                <option value="PLUMBER">Plumber</option>
                                <option value="PAINTER">Painter</option>
                                <option value="WELDER">Welder</option>
                                <option value="STEEL_FIXER">Steel Fixer</option>
                                <option value="TILE_LAYER">Tile Layer</option>
                                <option value="HELPER">Helper/Labour</option>
                                <option value="OPERATOR">Equipment Operator</option>
                                <option value="SUPERVISOR">Supervisor</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Experience (years)</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="Years of experience"
                                min="0"
                                value={workerFormData.experienceYears}
                                onChange={(e) => setWorkerFormData({...workerFormData, experienceYears: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Educational Qualification</label>
                              <select
                                className="input"
                                value={workerFormData.qualification}
                                onChange={(e) => setWorkerFormData({...workerFormData, qualification: e.target.value})}
                              >
                                <option value="">Select</option>
                                <option value="BELOW_10TH">Below 10th</option>
                                <option value="10TH">10th Pass</option>
                                <option value="12TH">12th Pass</option>
                                <option value="ITI">ITI/Diploma</option>
                                <option value="GRADUATE">Graduate</option>
                                <option value="POSTGRADUATE">Post Graduate</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Previous Employer</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Last company/contractor name"
                                value={workerFormData.previousEmployer}
                                onChange={(e) => setWorkerFormData({...workerFormData, previousEmployer: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Certifications</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="List any technical certifications or training certificates"
                              value={workerFormData.certifications}
                              onChange={(e) => setWorkerFormData({...workerFormData, certifications: e.target.value})}
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Specializations/Skills</label>
                            <textarea
                              className="input"
                              rows="2"
                              placeholder="Specific skills, tools expertise, special techniques..."
                              value={workerFormData.specializations}
                              onChange={(e) => setWorkerFormData({...workerFormData, specializations: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* Section 4: Employment Details */}
                      {currentWorkerSection === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Employment Details</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Joining Date</label>
                              <input
                                type="date"
                                className="input"
                                value={workerFormData.joiningDate}
                                onChange={(e) => setWorkerFormData({...workerFormData, joiningDate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Employment Type</label>
                              <select
                                className="input"
                                value={workerFormData.employmentType}
                                onChange={(e) => setWorkerFormData({...workerFormData, employmentType: e.target.value})}
                              >
                                <option value="DAILY_WAGE">Daily Wage</option>
                                <option value="HOURLY">Hourly</option>
                                <option value="MONTHLY">Monthly</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="PIECE_RATE">Piece Rate</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Hourly Rate (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={workerFormData.hourlyRate}
                                onChange={(e) => setWorkerFormData({...workerFormData, hourlyRate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Overtime Rate (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={workerFormData.overtimeRate}
                                onChange={(e) => setWorkerFormData({...workerFormData, overtimeRate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Monthly Salary (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={workerFormData.monthlySalary}
                                onChange={(e) => setWorkerFormData({...workerFormData, monthlySalary: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Contract Duration</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="E.g., 6 months, 1 year"
                                value={workerFormData.contractDuration}
                                onChange={(e) => setWorkerFormData({...workerFormData, contractDuration: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Availability</label>
                              <select
                                className="input"
                                value={workerFormData.availability}
                                onChange={(e) => setWorkerFormData({...workerFormData, availability: e.target.value})}
                              >
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="WEEKENDS">Weekends Only</option>
                                <option value="ON_CALL">On Call</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                              className="input"
                              value={workerFormData.status}
                              onChange={(e) => setWorkerFormData({...workerFormData, status: e.target.value})}
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="INACTIVE">Inactive</option>
                              <option value="ON_LEAVE">On Leave</option>
                              <option value="TERMINATED">Terminated</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Section 5: Health & Safety */}
                      {currentWorkerSection === 5 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Health & Safety</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Medical Fitness</label>
                              <select
                                className="input"
                                value={workerFormData.medicalFitness}
                                onChange={(e) => setWorkerFormData({...workerFormData, medicalFitness: e.target.value})}
                              >
                                <option value="FIT">Medically Fit</option>
                                <option value="PARTIALLY_FIT">Partially Fit</option>
                                <option value="UNFIT">Unfit</option>
                                <option value="PENDING">Pending Checkup</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Safety Training Date</label>
                              <input
                                type="date"
                                className="input"
                                value={workerFormData.safetyTrainingDate}
                                onChange={(e) => setWorkerFormData({...workerFormData, safetyTrainingDate: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={workerFormData.safetyTrainingCompleted}
                                onChange={(e) => setWorkerFormData({...workerFormData, safetyTrainingCompleted: e.target.checked})}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm font-medium">Safety Training Completed</span>
                            </label>

                            <label className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={workerFormData.ppeIssued}
                                onChange={(e) => setWorkerFormData({...workerFormData, ppeIssued: e.target.checked})}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm font-medium">PPE (Personal Protective Equipment) Issued</span>
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Insurance Policy Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Worker insurance policy number"
                              value={workerFormData.insurancePolicyNumber}
                              onChange={(e) => setWorkerFormData({...workerFormData, insurancePolicyNumber: e.target.value})}
                            />
                          </div>
                        </div>
                      )}

                      {/* Section 6: Emergency Contact */}
                      {currentWorkerSection === 6 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Emergency Contact Information</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Emergency Contact Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of person to contact in emergency"
                              value={workerFormData.emergencyContactName}
                              onChange={(e) => setWorkerFormData({...workerFormData, emergencyContactName: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Relationship</label>
                              <select
                                className="input"
                                value={workerFormData.emergencyContactRelation}
                                onChange={(e) => setWorkerFormData({...workerFormData, emergencyContactRelation: e.target.value})}
                              >
                                <option value="">Select</option>
                                <option value="FATHER">Father</option>
                                <option value="MOTHER">Mother</option>
                                <option value="SPOUSE">Spouse</option>
                                <option value="BROTHER">Brother</option>
                                <option value="SISTER">Sister</option>
                                <option value="SON">Son</option>
                                <option value="DAUGHTER">Daughter</option>
                                <option value="FRIEND">Friend</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Contact Number</label>
                              <input
                                type="tel"
                                className="input"
                                placeholder="+91 XXXXX XXXXX"
                                value={workerFormData.emergencyContactNumber}
                                onChange={(e) => setWorkerFormData({...workerFormData, emergencyContactNumber: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 7: Bank Details */}
                      {currentWorkerSection === 7 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Bank & Payment Details</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Bank Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of the bank"
                              value={workerFormData.bankName}
                              onChange={(e) => setWorkerFormData({...workerFormData, bankName: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Account Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Bank account number"
                                value={workerFormData.accountNumber}
                                onChange={(e) => setWorkerFormData({...workerFormData, accountNumber: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">IFSC Code</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="IFSC code"
                                value={workerFormData.ifscCode}
                                onChange={(e) => setWorkerFormData({...workerFormData, ifscCode: e.target.value.toUpperCase()})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">UPI ID</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="UPI ID for digital payments"
                                value={workerFormData.upiId}
                                onChange={(e) => setWorkerFormData({...workerFormData, upiId: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Transportation Mode</label>
                              <select
                                className="input"
                                value={workerFormData.transportationMode}
                                onChange={(e) => setWorkerFormData({...workerFormData, transportationMode: e.target.value})}
                              >
                                <option value="">Select</option>
                                <option value="OWN_VEHICLE">Own Vehicle</option>
                                <option value="PUBLIC_TRANSPORT">Public Transport</option>
                                <option value="COMPANY_PROVIDED">Company Provided</option>
                                <option value="CARPOOL">Carpool</option>
                                <option value="WALKING">Walking Distance</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Languages Known</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="E.g., Hindi, English, Marathi, Tamil..."
                              value={workerFormData.languagesKnown}
                              onChange={(e) => setWorkerFormData({...workerFormData, languagesKnown: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Additional Remarks</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Any additional information, special notes, or preferences..."
                              value={workerFormData.remarks}
                              onChange={(e) => setWorkerFormData({...workerFormData, remarks: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Step {currentWorkerSection + 1} of 8
                      </div>
                      <div className="flex gap-3">
                        {currentWorkerSection > 0 && (
                          <button
                            type="button"
                            onClick={() => setCurrentWorkerSection(currentWorkerSection - 1)}
                            className="btn-ghost"
                          >
                            ← Previous
                          </button>
                        )}
                        {currentWorkerSection < 7 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentWorkerSection(currentWorkerSection + 1)}
                            className="btn-primary"
                          >
                            Next →
                          </button>
                        ) : (
                          <button type="submit" className="btn-primary">
                            ✓ Add Worker
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => {
                            setShowAddModal(false);
                            setCurrentWorkerSection(0);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto">
                  <form onSubmit={handleAddEquipment}>
                    {/* Section Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6 pb-2">
                      {[
                        { label: 'Basic', icon: '🏗️' },
                        { label: 'Technical', icon: '⚙️' },
                        { label: 'Purchase', icon: '🛒' },
                        { label: 'Operational', icon: '⚡' },
                        { label: 'Financial', icon: '💰' },
                        { label: 'Compliance', icon: '✅' },
                        { label: 'Location', icon: '📍' },
                        { label: 'Maintenance', icon: '🔧' }
                      ].map((section, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentEquipmentSection(index)}
                          className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap border-b-2 transition-colors ${
                            currentEquipmentSection === index
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          <span>{section.icon}</span>
                          <span className="text-sm font-medium">{section.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Section Content */}
                    <div className="space-y-4">
                      {/* Section 0: Basic Information */}
                      {currentEquipmentSection === 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Equipment Name *</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Tower Crane TC-5013"
                              value={equipmentFormData.name}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, name: e.target.value})}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Equipment Type *</label>
                              <select
                                className="input"
                                value={equipmentFormData.equipmentType}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, equipmentType: e.target.value})}
                                required
                              >
                                <option value="">Select Type</option>
                                <option value="CRANE">Crane</option>
                                <option value="EXCAVATOR">Excavator</option>
                                <option value="BULLDOZER">Bulldozer</option>
                                <option value="LOADER">Loader</option>
                                <option value="CONCRETE_MIXER">Concrete Mixer</option>
                                <option value="CONCRETE_PUMP">Concrete Pump</option>
                                <option value="FORKLIFT">Forklift</option>
                                <option value="GENERATOR">Generator</option>
                                <option value="COMPACTOR">Compactor</option>
                                <option value="SCAFFOLDING">Scaffolding</option>
                                <option value="WELDING_MACHINE">Welding Machine</option>
                                <option value="CUTTING_MACHINE">Cutting Machine</option>
                                <option value="VIBRATOR">Vibrator</option>
                                <option value="HOIST">Hoist</option>
                                <option value="DUMP_TRUCK">Dump Truck</option>
                                <option value="TRAILER">Trailer</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Category</label>
                              <select
                                className="input"
                                value={equipmentFormData.category}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, category: e.target.value})}
                              >
                                <option value="">Select Category</option>
                                <option value="HEAVY_MACHINERY">Heavy Machinery</option>
                                <option value="LIGHT_EQUIPMENT">Light Equipment</option>
                                <option value="POWER_TOOLS">Power Tools</option>
                                <option value="SAFETY_EQUIPMENT">Safety Equipment</option>
                                <option value="MATERIAL_HANDLING">Material Handling</option>
                                <option value="EARTHMOVING">Earthmoving</option>
                                <option value="LIFTING">Lifting Equipment</option>
                                <option value="CONCRETE_EQUIPMENT">Concrete Equipment</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Manufacturer</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Manufacturer name"
                                value={equipmentFormData.manufacturer}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, manufacturer: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Manufacturing Year</label>
                              <input
                                type="number"
                                className="input"
                                placeholder="YYYY"
                                min="1900"
                                max={new Date().getFullYear()}
                                value={equipmentFormData.manufacturingYear}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, manufacturingYear: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Condition</label>
                            <select
                              className="input"
                              value={equipmentFormData.condition}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, condition: e.target.value})}
                            >
                              <option value="EXCELLENT">Excellent</option>
                              <option value="GOOD">Good</option>
                              <option value="FAIR">Fair</option>
                              <option value="POOR">Poor</option>
                              <option value="NEEDS_REPAIR">Needs Repair</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Section 1: Technical Specifications */}
                      {currentEquipmentSection === 1 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Model Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Model number"
                                value={equipmentFormData.model}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, model: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Serial Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Serial number"
                                value={equipmentFormData.serialNumber}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, serialNumber: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Registration Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Vehicle/Equipment registration number"
                              value={equipmentFormData.registrationNumber}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, registrationNumber: e.target.value.toUpperCase()})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Capacity</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 5 Ton, 100 HP"
                                value={equipmentFormData.capacity}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, capacity: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Power Rating</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 100 KW, 150 HP"
                                value={equipmentFormData.powerRating}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, powerRating: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Voltage</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 440V, 3-Phase"
                                value={equipmentFormData.voltage}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, voltage: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Fuel Type</label>
                              <select
                                className="input"
                                value={equipmentFormData.fuelType}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, fuelType: e.target.value})}
                              >
                                <option value="">Select Fuel Type</option>
                                <option value="DIESEL">Diesel</option>
                                <option value="PETROL">Petrol</option>
                                <option value="ELECTRIC">Electric</option>
                                <option value="HYBRID">Hybrid</option>
                                <option value="CNG">CNG</option>
                                <option value="LPG">LPG</option>
                                <option value="BATTERY">Battery</option>
                                <option value="SOLAR">Solar</option>
                                <option value="MANUAL">Manual</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Dimensions (L×W×H)</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 6m × 2.5m × 3m"
                                value={equipmentFormData.dimensions}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, dimensions: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Weight</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 5000 kg, 5 Ton"
                                value={equipmentFormData.weight}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, weight: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 2: Purchase Information */}
                      {currentEquipmentSection === 2 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Purchase Information</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Supplier Name</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Name of supplier/dealer"
                                value={equipmentFormData.supplierName}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, supplierName: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Supplier Contact</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Phone number"
                                value={equipmentFormData.supplierContact}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, supplierContact: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Purchase Date</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.purchaseDate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, purchaseDate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Purchase Price (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={equipmentFormData.purchasePrice}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, purchasePrice: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Invoice Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Purchase invoice number"
                              value={equipmentFormData.invoiceNumber}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, invoiceNumber: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Warranty Period</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 2 years, 24 months"
                                value={equipmentFormData.warrantyPeriod}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, warrantyPeriod: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Warranty Expiry Date</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.warrantyExpiryDate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, warrantyExpiryDate: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 3: Operational Details */}
                      {currentEquipmentSection === 3 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Operational Details</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Operating Hours</label>
                              <input
                                type="number"
                                step="0.1"
                                className="input"
                                placeholder="Total operating hours"
                                value={equipmentFormData.operatingHours}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, operatingHours: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Fuel Consumption</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., 10 L/hr"
                                value={equipmentFormData.fuelConsumption}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, fuelConsumption: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Efficiency Rating</label>
                            <select
                              className="input"
                              value={equipmentFormData.efficiencyRating}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, efficiencyRating: e.target.value})}
                            >
                              <option value="">Select Rating</option>
                              <option value="5_STAR">5 Star - Excellent</option>
                              <option value="4_STAR">4 Star - Very Good</option>
                              <option value="3_STAR">3 Star - Good</option>
                              <option value="2_STAR">2 Star - Average</option>
                              <option value="1_STAR">1 Star - Below Average</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="operatorRequired"
                              checked={equipmentFormData.operatorRequired}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, operatorRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="operatorRequired" className="text-sm font-medium">
                              Operator Required
                            </label>
                          </div>

                          {equipmentFormData.operatorRequired && (
                            <div>
                              <label className="block text-sm font-medium mb-2">Operator License Type Required</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., Heavy Vehicle License, Crane Operator Certificate"
                                value={equipmentFormData.operatorLicenseType}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, operatorLicenseType: e.target.value})}
                              />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium mb-2">Safety Features</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List all safety features and equipment..."
                              value={equipmentFormData.safetyFeatures}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, safetyFeatures: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* Section 4: Financial Details */}
                      {currentEquipmentSection === 4 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Financial Details</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Rental Cost per Day (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={equipmentFormData.rentalCostPerDay}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, rentalCostPerDay: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Rental Cost per Hour (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={equipmentFormData.rentalCostPerHour}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, rentalCostPerHour: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Depreciation Rate (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="e.g., 10"
                                value={equipmentFormData.depreciationRate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, depreciationRate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Current Value (₹)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={equipmentFormData.currentValue}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, currentValue: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Insurance Provider</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Insurance company name"
                              value={equipmentFormData.insuranceProvider}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, insuranceProvider: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Insurance Policy Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Policy number"
                                value={equipmentFormData.insurancePolicyNumber}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, insurancePolicyNumber: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Insurance Expiry Date</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.insuranceExpiryDate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, insuranceExpiryDate: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section 5: Compliance & Safety */}
                      {currentEquipmentSection === 5 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Compliance & Safety</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Safety Certifications</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List all safety certifications and compliance documents..."
                              value={equipmentFormData.safetyCertifications}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, safetyCertifications: e.target.value})}
                            ></textarea>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Last Inspection Date</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.lastInspectionDate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, lastInspectionDate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Next Inspection Date</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.nextInspectionDate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, nextInspectionDate: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Inspection Authority</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of inspection authority/agency"
                              value={equipmentFormData.inspectionAuthority}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, inspectionAuthority: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Pollution Certificate Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="PUC certificate number"
                                value={equipmentFormData.pollutionCertificate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, pollutionCertificate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Fitness Certificate Number</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="Fitness certificate number"
                                value={equipmentFormData.fitnessCertificate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, fitnessCertificate: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Permits & Licenses</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List all required permits, licenses, and approvals..."
                              value={equipmentFormData.permits}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, permits: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      )}

                      {/* Section 6: Location & Assignment */}
                      {currentEquipmentSection === 6 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Location & Assignment</h3>

                          <div>
                            <label className="block text-sm font-medium mb-2">Current Location</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Current storage/deployment location"
                              value={equipmentFormData.currentLocation}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, currentLocation: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Assigned Project</label>
                            <select
                              className="input"
                              value={equipmentFormData.assignedProject}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, assignedProject: e.target.value})}
                            >
                              <option value="">Not Assigned</option>
                              {projects.map((project) => (
                                <option key={project._id} value={project._id}>
                                  {project.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Assigned Operator</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of assigned operator"
                              value={equipmentFormData.assignedOperator}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, assignedOperator: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Site Address</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Complete site address where equipment is deployed..."
                              value={equipmentFormData.siteAddress}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, siteAddress: e.target.value})}
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Availability Status</label>
                            <select
                              className="input"
                              value={equipmentFormData.availabilityStatus}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, availabilityStatus: e.target.value})}
                            >
                              <option value="AVAILABLE">Available</option>
                              <option value="IN_USE">In Use</option>
                              <option value="MAINTENANCE">Under Maintenance</option>
                              <option value="REPAIR">Under Repair</option>
                              <option value="RESERVED">Reserved</option>
                              <option value="BREAKDOWN">Breakdown</option>
                              <option value="RETIRED">Retired</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Section 7: Maintenance */}
                      {currentEquipmentSection === 7 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-4">Maintenance & Service</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Last Service Date</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.lastServiceDate}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, lastServiceDate: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Next Service Due</label>
                              <input
                                type="date"
                                className="input"
                                value={equipmentFormData.nextServiceDue}
                                onChange={(e) => setEquipmentFormData({...equipmentFormData, nextServiceDue: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Service Provider</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of service provider/vendor"
                              value={equipmentFormData.serviceProvider}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, serviceProvider: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Maintenance Schedule</label>
                            <select
                              className="input"
                              value={equipmentFormData.maintenanceSchedule}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, maintenanceSchedule: e.target.value})}
                            >
                              <option value="">Select Schedule</option>
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                              <option value="BI_WEEKLY">Bi-Weekly</option>
                              <option value="MONTHLY">Monthly</option>
                              <option value="QUARTERLY">Quarterly (Every 3 months)</option>
                              <option value="HALF_YEARLY">Half-Yearly (Every 6 months)</option>
                              <option value="YEARLY">Yearly (Annual)</option>
                              <option value="AS_NEEDED">As Needed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Maintenance History</label>
                            <textarea
                              className="input"
                              rows="4"
                              placeholder="Record of past maintenance activities, repairs, and replacements..."
                              value={equipmentFormData.maintenanceHistory}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, maintenanceHistory: e.target.value})}
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Spare Parts Inventory</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="List of available spare parts and their quantities..."
                              value={equipmentFormData.spareParts}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, spareParts: e.target.value})}
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Additional Remarks</label>
                            <textarea
                              className="input"
                              rows="3"
                              placeholder="Any additional information, notes, or special instructions..."
                              value={equipmentFormData.remarks}
                              onChange={(e) => setEquipmentFormData({...equipmentFormData, remarks: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Step {currentEquipmentSection + 1} of 8
                      </div>
                      <div className="flex gap-3">
                        {currentEquipmentSection > 0 && (
                          <button
                            type="button"
                            onClick={() => setCurrentEquipmentSection(currentEquipmentSection - 1)}
                            className="btn-ghost"
                          >
                            ← Previous
                          </button>
                        )}
                        {currentEquipmentSection < 7 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentEquipmentSection(currentEquipmentSection + 1)}
                            className="btn-primary"
                          >
                            Next →
                          </button>
                        ) : (
                          <button type="submit" className="btn-primary">
                            ✓ Add Equipment
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => {
                            setShowAddModal(false);
                            setCurrentEquipmentSection(0);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
