import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import projectService from '../services/project.service';
import boqService from '../services/boq.service';

const BOQPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [boqData, setBoqData] = useState(null);
  const [boqItems, setBoqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    category: '',
    subCategory: '',
    itemCode: '',
    name: '',
    description: '',
    unit: 'CUBIC_METER',
    quantity: '',
    rate: '',

    // Item Specifications
    specification: '',
    dimensions: '',
    grade: '',
    brand: '',
    standard: '',
    qualityGrade: '',
    color: '',
    finish: '',

    // Material Details
    materialType: '',
    materialQuantity: '',
    materialUnit: '',
    materialRate: '',
    materialWastage: '',
    materialSupplier: '',

    // Labor & Equipment
    laborType: '',
    laborQuantity: '',
    laborRate: '',
    equipmentRequired: '',
    equipmentHours: '',
    equipmentRate: '',

    // Cost Breakdown
    materialCost: '',
    laborCost: '',
    equipmentCost: '',
    overheadPercentage: '',
    profitMargin: '',
    gstPercentage: '',
    contingency: '',

    // Scheduling
    startDate: '',
    endDate: '',
    duration: '',
    prerequisite: '',
    priority: 'MEDIUM',

    // Quality & Standards
    testingRequired: false,
    inspectionRequired: false,
    certificationRequired: false,
    qualityStandard: '',
    testingFrequency: '',

    // Additional Details
    location: '',
    floor: '',
    zone: '',
    remarks: '',
    attachments: '',
    approvalStatus: 'DRAFT'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadBOQ();
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

  const loadBOQ = async () => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      const response = await boqService.getByProject(selectedProjectId);
      setBoqData(response.data.boq);
      setBoqItems(response.data.boq?.items || []);
    } catch (error) {
      console.error('Failed to load BOQ:', error);
      setBoqData(null);
      setBoqItems([]);
      // Don't show error toast - BOQ might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!boqData) {
      toast.error('Please create a BOQ first');
      return;
    }

    try {
      await boqService.addItem(boqData.id, formData);
      toast.success('BOQ item added successfully!');
      setShowAddItemModal(false);
      setCurrentSection(0);
      setFormData({
        category: '',
        subCategory: '',
        itemCode: '',
        name: '',
        description: '',
        unit: 'CUBIC_METER',
        quantity: '',
        rate: '',
        specification: '',
        dimensions: '',
        grade: '',
        brand: '',
        standard: '',
        qualityGrade: '',
        color: '',
        finish: '',
        materialType: '',
        materialQuantity: '',
        materialUnit: '',
        materialRate: '',
        materialWastage: '',
        materialSupplier: '',
        laborType: '',
        laborQuantity: '',
        laborRate: '',
        equipmentRequired: '',
        equipmentHours: '',
        equipmentRate: '',
        materialCost: '',
        laborCost: '',
        equipmentCost: '',
        overheadPercentage: '',
        profitMargin: '',
        gstPercentage: '',
        contingency: '',
        startDate: '',
        endDate: '',
        duration: '',
        prerequisite: '',
        priority: 'MEDIUM',
        testingRequired: false,
        inspectionRequired: false,
        certificationRequired: false,
        qualityStandard: '',
        testingFrequency: '',
        location: '',
        floor: '',
        zone: '',
        remarks: '',
        attachments: '',
        approvalStatus: 'DRAFT'
      });
      loadBOQ();
    } catch (error) {
      console.error('Failed to add BOQ item:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await boqService.deleteItem(itemId);
      toast.success('Item deleted successfully');
      loadBOQ();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const categories = [...new Set(boqItems.map(item => item.category))];
  const totalAmount = boqItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity || 0);
    const rate = parseFloat(item.rate || 0);
    return sum + (qty * rate);
  }, 0);

  const getCategorySummary = () => {
    return categories.map(category => {
      const categoryItems = boqItems.filter(item => item.category === category);
      const categoryTotal = categoryItems.reduce((sum, item) => {
        const qty = parseFloat(item.quantity || 0);
        const rate = parseFloat(item.rate || 0);
        return sum + (qty * rate);
      }, 0);
      return { category, total: categoryTotal, items: categoryItems.length };
    });
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bill of Quantities (BOQ)</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detailed cost estimation and quantities
          </p>
        </div>
        <div className="flex gap-3">
          <select
            className="input w-64"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={() => setShowAddItemModal(true)}
            disabled={!boqData}
          >
            + Add Item
          </button>
        </div>
      </div>

      {!boqData ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No BOQ found for this project
          </p>
          <button className="btn-primary">Create BOQ</button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total BOQ Value</h3>
              <p className="text-3xl font-bold mt-2">₹{(totalAmount / 10000000).toFixed(2)}Cr</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {boqItems.length} items
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
              <p className="text-3xl font-bold mt-2">{categories.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Work categories</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
              <p className="text-3xl font-bold mt-2">{boqData?.status || 'DRAFT'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Current state</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</h3>
              <p className="text-3xl font-bold mt-2">{boqData?.version || 1}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">BOQ revision</p>
            </div>
          </div>

          {/* Category Summary */}
          {categories.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Category-wise Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getCategorySummary().map((cat, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {cat.category}
                    </h4>
                    <p className="text-2xl font-bold">₹{(cat.total / 100000).toFixed(2)}L</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {cat.items} items • {totalAmount > 0 ? ((cat.total / totalAmount) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOQ Table */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detailed BOQ</h3>
              <div className="flex gap-2">
                <button className="btn-ghost text-sm">Export Excel</button>
                <button className="btn-ghost text-sm">Print PDF</button>
              </div>
            </div>

            {boqItems.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No items added yet. Click "Add Item" to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rate (₹)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount (₹)</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {boqItems.map((item, index) => {
                      const qty = parseFloat(item.quantity || 0);
                      const rate = parseFloat(item.rate || 0);
                      const amount = qty * rate;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-medium">{item.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            {item.description || '-'}
                          </td>
                          <td className="px-4 py-4 text-center text-sm">{item.unit}</td>
                          <td className="px-4 py-4 text-right font-medium">{qty.toFixed(2)}</td>
                          <td className="px-4 py-4 text-right">{rate.toLocaleString()}</td>
                          <td className="px-4 py-4 text-right font-bold">
                            {amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button className="text-primary-600 hover:text-primary-700 text-sm mr-2">Edit</button>
                            <button
                              className="text-red-600 hover:text-red-700 text-sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                      <td colSpan="7" className="px-4 py-4 text-right">Total BOQ Value:</td>
                      <td className="px-4 py-4 text-right text-lg">₹{totalAmount.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add BOQ Item</h2>
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setCurrentSection(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleAddItem}>
                  {/* Section Tabs */}
                  <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6 pb-2">
                    {[
                      { label: 'Basic', icon: '📋' },
                      { label: 'Specifications', icon: '📐' },
                      { label: 'Materials', icon: '🧱' },
                      { label: 'Labor & Equipment', icon: '👷' },
                      { label: 'Cost Analysis', icon: '💰' },
                      { label: 'Schedule', icon: '📅' },
                      { label: 'Quality', icon: '✅' },
                      { label: 'Additional', icon: '📝' }
                    ].map((section, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentSection(index)}
                        className={`flex items-center gap-2 px-4 py-2 whitespace-nowrap border-b-2 transition-colors ${
                          currentSection === index
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
                    {currentSection === 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select
                              className="input"
                              value={formData.category}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              required
                            >
                              <option value="">Select Category</option>
                              <option value="EXCAVATION">Excavation & Earthwork</option>
                              <option value="CONCRETE">Concrete Work</option>
                              <option value="MASONRY">Masonry Work</option>
                              <option value="STEEL">Steel & Reinforcement</option>
                              <option value="CARPENTRY">Carpentry & Woodwork</option>
                              <option value="FINISHING">Finishing Work</option>
                              <option value="PLUMBING">Plumbing & Sanitation</option>
                              <option value="ELECTRICAL">Electrical Work</option>
                              <option value="HVAC">HVAC Systems</option>
                              <option value="PAINTING">Painting & Polish</option>
                              <option value="WATERPROOFING">Waterproofing</option>
                              <option value="FLOORING">Flooring Work</option>
                              <option value="ROOFING">Roofing Work</option>
                              <option value="DOORS_WINDOWS">Doors & Windows</option>
                              <option value="GLASS">Glass & Glazing</option>
                              <option value="LANDSCAPE">Landscaping</option>
                              <option value="OTHERS">Others</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Sub-Category</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Foundation, Column, Beam"
                              value={formData.subCategory}
                              onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Item Code</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., BOQ-001, CONC-101"
                              value={formData.itemCode}
                              onChange={(e) => setFormData({...formData, itemCode: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Item Name *</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Item name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Detailed description of the work item..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Unit of Measurement *</label>
                            <select
                              className="input"
                              value={formData.unit}
                              onChange={(e) => setFormData({...formData, unit: e.target.value})}
                              required
                            >
                              <option value="CUBIC_METER">Cubic Meter (m³)</option>
                              <option value="SQUARE_METER">Square Meter (m²)</option>
                              <option value="RUNNING_METER">Running Meter (Rmt)</option>
                              <option value="TON">Ton (MT)</option>
                              <option value="KILOGRAM">Kilogram (Kg)</option>
                              <option value="PIECE">Piece (Nos)</option>
                              <option value="LITER">Liter (L)</option>
                              <option value="BAG">Bag</option>
                              <option value="BRASS">Brass</option>
                              <option value="SQFT">Square Feet (Sqft)</option>
                              <option value="CUFF">Cubic Feet (Cuft)</option>
                              <option value="LUMP_SUM">Lump Sum (LS)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Quantity *</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.quantity}
                              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Rate per Unit (₹) *</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.rate}
                              onChange={(e) => setFormData({...formData, rate: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Total Amount:</span>
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              ₹{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.rate) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 1: Item Specifications */}
                    {currentSection === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Item Specifications</h3>

                        <div>
                          <label className="block text-sm font-medium mb-2">Detailed Specification</label>
                          <textarea
                            className="input"
                            rows="4"
                            placeholder="Technical specifications, standards to be followed, quality requirements..."
                            value={formData.specification}
                            onChange={(e) => setFormData({...formData, specification: e.target.value})}
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Dimensions</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., 5m × 3m × 0.3m"
                              value={formData.dimensions}
                              onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Grade/Class</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., M25, Fe500, Grade A"
                              value={formData.grade}
                              onChange={(e) => setFormData({...formData, grade: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Brand/Manufacturer</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Preferred brand or equivalent"
                              value={formData.brand}
                              onChange={(e) => setFormData({...formData, brand: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Standard Code</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., IS 456:2000, ASTM A615"
                              value={formData.standard}
                              onChange={(e) => setFormData({...formData, standard: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Quality Grade</label>
                            <select
                              className="input"
                              value={formData.qualityGrade}
                              onChange={(e) => setFormData({...formData, qualityGrade: e.target.value})}
                            >
                              <option value="">Select Grade</option>
                              <option value="PREMIUM">Premium</option>
                              <option value="STANDARD">Standard</option>
                              <option value="ECONOMY">Economy</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Color</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Color specification"
                              value={formData.color}
                              onChange={(e) => setFormData({...formData, color: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Finish</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Matt, Glossy, Textured"
                              value={formData.finish}
                              onChange={(e) => setFormData({...formData, finish: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Material Details */}
                    {currentSection === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Material Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Type</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Cement, Steel, Bricks"
                              value={formData.materialType}
                              onChange={(e) => setFormData({...formData, materialType: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Supplier</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Preferred supplier name"
                              value={formData.materialSupplier}
                              onChange={(e) => setFormData({...formData, materialSupplier: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Quantity</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.materialQuantity}
                              onChange={(e) => setFormData({...formData, materialQuantity: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Unit</label>
                            <select
                              className="input"
                              value={formData.materialUnit}
                              onChange={(e) => setFormData({...formData, materialUnit: e.target.value})}
                            >
                              <option value="">Select Unit</option>
                              <option value="KG">Kilogram</option>
                              <option value="TON">Ton</option>
                              <option value="BAG">Bag</option>
                              <option value="CUM">Cubic Meter</option>
                              <option value="SQM">Square Meter</option>
                              <option value="NOS">Numbers</option>
                              <option value="LITER">Liter</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Rate (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.materialRate}
                              onChange={(e) => setFormData({...formData, materialRate: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Material Wastage (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="input"
                            placeholder="e.g., 5 for 5% wastage"
                            value={formData.materialWastage}
                            onChange={(e) => setFormData({...formData, materialWastage: e.target.value})}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Typical wastage allowance for material handling and cutting
                          </p>
                        </div>

                        {formData.materialQuantity && formData.materialRate && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Estimated Material Cost:</span>
                              <span className="text-xl font-bold text-blue-600">
                                ₹{((parseFloat(formData.materialQuantity) || 0) * (parseFloat(formData.materialRate) || 0) * (1 + (parseFloat(formData.materialWastage) || 0) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 3: Labor & Equipment */}
                    {currentSection === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Labor & Equipment Requirements</h3>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Labor Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Labor Type</label>
                              <select
                                className="input"
                                value={formData.laborType}
                                onChange={(e) => setFormData({...formData, laborType: e.target.value})}
                              >
                                <option value="">Select Type</option>
                                <option value="SKILLED">Skilled</option>
                                <option value="SEMI_SKILLED">Semi-Skilled</option>
                                <option value="UNSKILLED">Unskilled</option>
                                <option value="MASON">Mason</option>
                                <option value="CARPENTER">Carpenter</option>
                                <option value="ELECTRICIAN">Electrician</option>
                                <option value="PLUMBER">Plumber</option>
                                <option value="HELPER">Helper</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Labor Quantity (Man-days)</label>
                              <input
                                type="number"
                                step="0.1"
                                className="input"
                                placeholder="0.0"
                                value={formData.laborQuantity}
                                onChange={(e) => setFormData({...formData, laborQuantity: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Labor Rate (₹/day)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={formData.laborRate}
                                onChange={(e) => setFormData({...formData, laborRate: e.target.value})}
                              />
                            </div>
                          </div>
                          {formData.laborQuantity && formData.laborRate && (
                            <div className="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                              <span className="text-sm font-medium">Labor Cost: </span>
                              <span className="text-lg font-bold text-green-600">
                                ₹{((parseFloat(formData.laborQuantity) || 0) * (parseFloat(formData.laborRate) || 0)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Equipment Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Equipment Required</label>
                              <input
                                type="text"
                                className="input"
                                placeholder="e.g., Excavator, Mixer"
                                value={formData.equipmentRequired}
                                onChange={(e) => setFormData({...formData, equipmentRequired: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Equipment Hours</label>
                              <input
                                type="number"
                                step="0.1"
                                className="input"
                                placeholder="0.0"
                                value={formData.equipmentHours}
                                onChange={(e) => setFormData({...formData, equipmentHours: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Equipment Rate (₹/hr)</label>
                              <input
                                type="number"
                                step="0.01"
                                className="input"
                                placeholder="0.00"
                                value={formData.equipmentRate}
                                onChange={(e) => setFormData({...formData, equipmentRate: e.target.value})}
                              />
                            </div>
                          </div>
                          {formData.equipmentHours && formData.equipmentRate && (
                            <div className="mt-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                              <span className="text-sm font-medium">Equipment Cost: </span>
                              <span className="text-lg font-bold text-purple-600">
                                ₹{((parseFloat(formData.equipmentHours) || 0) * (parseFloat(formData.equipmentRate) || 0)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Section 4: Cost Analysis */}
                    {currentSection === 4 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Cost Breakdown & Analysis</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Cost (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.materialCost}
                              onChange={(e) => setFormData({...formData, materialCost: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Labor Cost (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.laborCost}
                              onChange={(e) => setFormData({...formData, laborCost: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Equipment Cost (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.equipmentCost}
                              onChange={(e) => setFormData({...formData, equipmentCost: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Overhead (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="input"
                              placeholder="e.g., 10 for 10%"
                              value={formData.overheadPercentage}
                              onChange={(e) => setFormData({...formData, overheadPercentage: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Profit Margin (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="input"
                              placeholder="e.g., 15 for 15%"
                              value={formData.profitMargin}
                              onChange={(e) => setFormData({...formData, profitMargin: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">GST (%)</label>
                            <select
                              className="input"
                              value={formData.gstPercentage}
                              onChange={(e) => setFormData({...formData, gstPercentage: e.target.value})}
                            >
                              <option value="">Select GST Rate</option>
                              <option value="0">0% - Exempt</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Contingency (%)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="input"
                              placeholder="e.g., 5 for 5%"
                              value={formData.contingency}
                              onChange={(e) => setFormData({...formData, contingency: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800 mt-4">
                          <h4 className="font-semibold mb-3">Cost Summary</h4>
                          <div className="space-y-2 text-sm">
                            {(() => {
                              const material = parseFloat(formData.materialCost) || 0;
                              const labor = parseFloat(formData.laborCost) || 0;
                              const equipment = parseFloat(formData.equipmentCost) || 0;
                              const subtotal = material + labor + equipment;
                              const overhead = subtotal * ((parseFloat(formData.overheadPercentage) || 0) / 100);
                              const profit = (subtotal + overhead) * ((parseFloat(formData.profitMargin) || 0) / 100);
                              const beforeTax = subtotal + overhead + profit;
                              const gst = beforeTax * ((parseFloat(formData.gstPercentage) || 0) / 100);
                              const contingencyAmt = (beforeTax + gst) * ((parseFloat(formData.contingency) || 0) / 100);
                              const grandTotal = beforeTax + gst + contingencyAmt;

                              return (
                                <>
                                  <div className="flex justify-between"><span>Material:</span><span>₹{material.toLocaleString('en-IN')}</span></div>
                                  <div className="flex justify-between"><span>Labor:</span><span>₹{labor.toLocaleString('en-IN')}</span></div>
                                  <div className="flex justify-between"><span>Equipment:</span><span>₹{equipment.toLocaleString('en-IN')}</span></div>
                                  <div className="flex justify-between border-t border-green-300 dark:border-green-700 pt-2"><span>Subtotal:</span><span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span></div>
                                  {overhead > 0 && <div className="flex justify-between"><span>Overhead ({formData.overheadPercentage}%):</span><span>₹{overhead.toLocaleString('en-IN')}</span></div>}
                                  {profit > 0 && <div className="flex justify-between"><span>Profit ({formData.profitMargin}%):</span><span>₹{profit.toLocaleString('en-IN')}</span></div>}
                                  {gst > 0 && <div className="flex justify-between"><span>GST ({formData.gstPercentage}%):</span><span>₹{gst.toLocaleString('en-IN')}</span></div>}
                                  {contingencyAmt > 0 && <div className="flex justify-between"><span>Contingency ({formData.contingency}%):</span><span>₹{contingencyAmt.toLocaleString('en-IN')}</span></div>}
                                  <div className="flex justify-between border-t-2 border-green-400 dark:border-green-600 pt-2 text-lg"><span className="font-bold">Grand Total:</span><span className="font-bold text-green-700 dark:text-green-400">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 5: Schedule */}
                    {currentSection === 5 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Schedule & Timeline</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <input
                              type="date"
                              className="input"
                              value={formData.startDate}
                              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <input
                              type="date"
                              className="input"
                              value={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Duration (Days)</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="e.g., 15"
                              value={formData.duration}
                              onChange={(e) => setFormData({...formData, duration: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Prerequisite Activities</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Activities that must be completed before this work can start..."
                            value={formData.prerequisite}
                            onChange={(e) => setFormData({...formData, prerequisite: e.target.value})}
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Priority Level</label>
                          <select
                            className="input"
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Section 6: Quality & Standards */}
                    {currentSection === 6 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Quality & Compliance</h3>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="testingRequired"
                              checked={formData.testingRequired}
                              onChange={(e) => setFormData({...formData, testingRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="testingRequired" className="text-sm font-medium">
                              Testing Required
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="inspectionRequired"
                              checked={formData.inspectionRequired}
                              onChange={(e) => setFormData({...formData, inspectionRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="inspectionRequired" className="text-sm font-medium">
                              Inspection Required
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="certificationRequired"
                              checked={formData.certificationRequired}
                              onChange={(e) => setFormData({...formData, certificationRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="certificationRequired" className="text-sm font-medium">
                              Certification Required
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Quality Standards</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="List applicable quality standards (IS codes, ASTM, BS, etc.)..."
                            value={formData.qualityStandard}
                            onChange={(e) => setFormData({...formData, qualityStandard: e.target.value})}
                          ></textarea>
                        </div>

                        {formData.testingRequired && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Testing Frequency</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., One sample per 100 cum, Daily testing"
                              value={formData.testingFrequency}
                              onChange={(e) => setFormData({...formData, testingFrequency: e.target.value})}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 7: Additional Details */}
                    {currentSection === 7 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Wing A, North Block"
                              value={formData.location}
                              onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Floor Level</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Ground Floor, 2nd Floor"
                              value={formData.floor}
                              onChange={(e) => setFormData({...formData, floor: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Zone/Area</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Zone-1, Area A"
                              value={formData.zone}
                              onChange={(e) => setFormData({...formData, zone: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Approval Status</label>
                          <select
                            className="input"
                            value={formData.approvalStatus}
                            onChange={(e) => setFormData({...formData, approvalStatus: e.target.value})}
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING_APPROVAL">Pending Approval</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="REVISED">Revised</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Attachments/References</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Drawing references, specification sheets, file paths..."
                            value={formData.attachments}
                            onChange={(e) => setFormData({...formData, attachments: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Remarks & Special Instructions</label>
                          <textarea
                            className="input"
                            rows="4"
                            placeholder="Any special notes, instructions, or considerations..."
                            value={formData.remarks}
                            onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Step {currentSection + 1} of 8
                    </div>
                    <div className="flex gap-3">
                      {currentSection > 0 && (
                        <button
                          type="button"
                          onClick={() => setCurrentSection(currentSection - 1)}
                          className="btn-ghost"
                        >
                          ← Previous
                        </button>
                      )}
                      {currentSection < 7 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentSection(currentSection + 1)}
                          className="btn-primary"
                        >
                          Next →
                        </button>
                      ) : (
                        <button type="submit" className="btn-primary">
                          ✓ Add BOQ Item
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setShowAddItemModal(false);
                          setCurrentSection(0);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOQPage;
