import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import materialService from '../services/material.service';

const MaterialsPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    materialId: '',
    quantity: '',
    unit: '',
    orderPriority: 'MEDIUM',
    requiredDate: '',
    purposeOfUse: '',

    // Supplier Details
    supplier: '',
    supplierContact: '',
    supplierEmail: '',
    supplierAddress: '',
    supplierGSTN: '',
    paymentTerms: '',

    // Cost Breakdown
    unitPrice: '',
    totalCost: '',
    gstPercentage: '18',
    gstAmount: '',
    transportCost: '',
    loadingUnloadingCost: '',
    discount: '',
    grandTotal: '',

    // Delivery Details
    expectedDelivery: '',
    deliveryAddress: '',
    deliveryContactPerson: '',
    deliveryContactNumber: '',
    shippingMethod: '',
    transporterName: '',
    deliveryInstructions: '',

    // Quality & Inspection
    qualityStandards: '',
    inspectionRequired: false,
    testCertificatesRequired: false,
    sampleRequired: false,
    materialGrade: '',
    brandPreference: '',

    // Terms & Conditions
    warrantyPeriod: '',
    returnPolicy: '',
    penaltyClause: '',
    advancePayment: '',
    creditPeriod: '',

    // Additional Details
    purchaseOrderNumber: '',
    requisitionNumber: '',
    budgetCode: '',
    approverName: '',
    specialInstructions: '',
    attachments: '',
    notes: ''
  });

  // Fetch materials and orders from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryResponse, ordersResponse] = await Promise.all([
        materialService.getInventory(),
        materialService.getOrders()
      ]);
      setMaterials(inventoryResponse.data.inventory || []);
      setOrders(ordersResponse.data.orders || []);
    } catch (error) {
      console.error('Failed to load materials data:', error);
      toast.error('Failed to load materials and orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await materialService.createOrder(formData);
      toast.success('Order created successfully!');
      setShowOrderModal(false);
      setCurrentSection(0);
      setFormData({
        materialId: '',
        quantity: '',
        unit: '',
        orderPriority: 'MEDIUM',
        requiredDate: '',
        purposeOfUse: '',
        supplier: '',
        supplierContact: '',
        supplierEmail: '',
        supplierAddress: '',
        supplierGSTN: '',
        paymentTerms: '',
        unitPrice: '',
        totalCost: '',
        gstPercentage: '18',
        gstAmount: '',
        transportCost: '',
        loadingUnloadingCost: '',
        discount: '',
        grandTotal: '',
        expectedDelivery: '',
        deliveryAddress: '',
        deliveryContactPerson: '',
        deliveryContactNumber: '',
        shippingMethod: '',
        transporterName: '',
        deliveryInstructions: '',
        qualityStandards: '',
        inspectionRequired: false,
        testCertificatesRequired: false,
        sampleRequired: false,
        materialGrade: '',
        brandPreference: '',
        warrantyPeriod: '',
        returnPolicy: '',
        penaltyClause: '',
        advancePayment: '',
        creditPeriod: '',
        purchaseOrderNumber: '',
        requisitionNumber: '',
        budgetCode: '',
        approverName: '',
        specialInstructions: '',
        attachments: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      adequate: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      low: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      IN_TRANSIT: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || colors.adequate;
  };

  // Calculate low stock items
  const lowStockItems = materials.filter(m =>
    parseFloat(m.currentStock || 0) < parseFloat(m.minStock || 0)
  );

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
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Materials</h3>
          <p className="text-3xl font-bold mt-2">{materials.length}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock Items</h3>
          <p className="text-3xl font-bold mt-2 text-yellow-600">
            {lowStockItems.length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</h3>
          <p className="text-3xl font-bold mt-2">
            {orders.filter(o => o.status === 'PENDING').length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{orders.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>

        <div className="mt-6">
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search materials..."
                  className="input flex-1 max-w-md"
                />
                <button className="btn-primary" onClick={() => setShowOrderModal(true)}>
                  + New Order
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Min Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price/Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.map(material => {
                      const isLowStock = parseFloat(material.currentStock || 0) < parseFloat(material.minStock || 0);
                      const status = isLowStock ? 'low' : 'adequate';
                      return (
                        <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 font-medium">{material.name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{material.category || 'N/A'}</td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold">{parseFloat(material.currentStock || 0).toFixed(2)}</span>
                            <span className="text-sm text-gray-500 ml-1">{material.unit}</span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                            {parseFloat(material.minStock || 0).toFixed(2)} {material.unit}
                          </td>
                          <td className="px-4 py-4 text-right font-medium">₹{parseFloat(material.unitPrice || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{material.supplier || 'N/A'}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              onClick={() => {
                                setFormData({...formData, materialId: material.id});
                                setShowOrderModal(true);
                              }}
                            >
                              Order
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No orders found
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{order.material?.name || 'Material Order'}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                            <p className="font-medium">{parseFloat(order.quantity || 0).toFixed(2)} {order.material?.unit || 'units'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Supplier</p>
                            <p className="font-medium">{order.supplier || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Order Date</p>
                            <p className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Expected Delivery</p>
                            <p className="font-medium">{new Date(order.expectedDelivery).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="text-lg font-bold">₹{parseFloat(order.totalCost || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create Purchase Order</h2>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setCurrentSection(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleCreateOrder}>
                  {/* Section Tabs */}
                  <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6 pb-2">
                    {[
                      { label: 'Basic', icon: '📦' },
                      { label: 'Supplier', icon: '🏢' },
                      { label: 'Cost', icon: '💰' },
                      { label: 'Delivery', icon: '🚚' },
                      { label: 'Quality', icon: '✅' },
                      { label: 'Terms', icon: '📄' },
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
                        <h3 className="text-lg font-semibold mb-4">Basic Order Information</h3>

                        <div>
                          <label className="block text-sm font-medium mb-2">Material *</label>
                          <select
                            className="input"
                            value={formData.materialId}
                            onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                            required
                          >
                            <option value="">Select Material</option>
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>{m.name} - {m.category}</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <label className="block text-sm font-medium mb-2">Unit</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Ton, KG, Bag"
                              value={formData.unit}
                              onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Order Priority</label>
                            <select
                              className="input"
                              value={formData.orderPriority}
                              onChange={(e) => setFormData({...formData, orderPriority: e.target.value})}
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Required Date *</label>
                          <input
                            type="date"
                            className="input"
                            value={formData.requiredDate}
                            onChange={(e) => setFormData({...formData, requiredDate: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Purpose of Use</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Specify where and how this material will be used..."
                            value={formData.purposeOfUse}
                            onChange={(e) => setFormData({...formData, purposeOfUse: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* Section 1: Supplier Details */}
                    {currentSection === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>

                        <div>
                          <label className="block text-sm font-medium mb-2">Supplier Name *</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Full name of supplier/vendor"
                            value={formData.supplier}
                            onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Contact Person</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of contact person"
                              value={formData.supplierContact}
                              onChange={(e) => setFormData({...formData, supplierContact: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                              type="email"
                              className="input"
                              placeholder="supplier@email.com"
                              value={formData.supplierEmail}
                              onChange={(e) => setFormData({...formData, supplierEmail: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Supplier Address</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Complete address of supplier"
                            value={formData.supplierAddress}
                            onChange={(e) => setFormData({...formData, supplierAddress: e.target.value})}
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">GSTIN Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="GST identification number"
                              value={formData.supplierGSTN}
                              onChange={(e) => setFormData({...formData, supplierGSTN: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Payment Terms</label>
                            <select
                              className="input"
                              value={formData.paymentTerms}
                              onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                            >
                              <option value="">Select Terms</option>
                              <option value="IMMEDIATE">Immediate Payment</option>
                              <option value="NET_7">Net 7 Days</option>
                              <option value="NET_15">Net 15 Days</option>
                              <option value="NET_30">Net 30 Days</option>
                              <option value="NET_45">Net 45 Days</option>
                              <option value="ADVANCE">Advance Payment</option>
                              <option value="COD">Cash on Delivery</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Cost Breakdown */}
                    {currentSection === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Unit Price (₹) *</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.unitPrice}
                              onChange={(e) => {
                                const unitPrice = parseFloat(e.target.value) || 0;
                                const quantity = parseFloat(formData.quantity) || 0;
                                const totalCost = unitPrice * quantity;
                                setFormData({...formData, unitPrice: e.target.value, totalCost: totalCost.toFixed(2)});
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Total Cost (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input bg-gray-50 dark:bg-gray-700"
                              placeholder="0.00"
                              value={formData.totalCost}
                              readOnly
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
                              <option value="0">0% - Exempt</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">GST Amount (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input bg-gray-50 dark:bg-gray-700"
                              value={((parseFloat(formData.totalCost) || 0) * (parseFloat(formData.gstPercentage) || 0) / 100).toFixed(2)}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Transport Cost (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.transportCost}
                              onChange={(e) => setFormData({...formData, transportCost: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Loading/Unloading (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              className="input"
                              placeholder="0.00"
                              value={formData.loadingUnloadingCost}
                              onChange={(e) => setFormData({...formData, loadingUnloadingCost: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Discount (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="input"
                            placeholder="0.00"
                            value={formData.discount}
                            onChange={(e) => setFormData({...formData, discount: e.target.value})}
                          />
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold mb-3">Order Summary</h4>
                          <div className="space-y-2 text-sm">
                            {(() => {
                              const baseAmount = parseFloat(formData.totalCost) || 0;
                              const gstAmount = baseAmount * ((parseFloat(formData.gstPercentage) || 0) / 100);
                              const transport = parseFloat(formData.transportCost) || 0;
                              const loading = parseFloat(formData.loadingUnloadingCost) || 0;
                              const discount = parseFloat(formData.discount) || 0;
                              const grandTotal = baseAmount + gstAmount + transport + loading - discount;

                              return (
                                <>
                                  <div className="flex justify-between"><span>Base Amount:</span><span>₹{baseAmount.toLocaleString('en-IN')}</span></div>
                                  <div className="flex justify-between"><span>GST ({formData.gstPercentage}%):</span><span>₹{gstAmount.toLocaleString('en-IN')}</span></div>
                                  <div className="flex justify-between"><span>Transport:</span><span>₹{transport.toLocaleString('en-IN')}</span></div>
                                  <div className="flex justify-between"><span>Loading/Unloading:</span><span>₹{loading.toLocaleString('en-IN')}</span></div>
                                  {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>- ₹{discount.toLocaleString('en-IN')}</span></div>}
                                  <div className="flex justify-between border-t-2 border-green-400 dark:border-green-600 pt-2 text-lg"><span className="font-bold">Grand Total:</span><span className="font-bold text-green-700 dark:text-green-400">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 3: Delivery Details */}
                    {currentSection === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>

                        <div>
                          <label className="block text-sm font-medium mb-2">Expected Delivery Date *</label>
                          <input
                            type="date"
                            className="input"
                            value={formData.expectedDelivery}
                            onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Complete delivery address with landmarks"
                            value={formData.deliveryAddress}
                            onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                            required
                          ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Contact Person</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of person at delivery site"
                              value={formData.deliveryContactPerson}
                              onChange={(e) => setFormData({...formData, deliveryContactPerson: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Contact Number</label>
                            <input
                              type="tel"
                              className="input"
                              placeholder="Phone number"
                              value={formData.deliveryContactNumber}
                              onChange={(e) => setFormData({...formData, deliveryContactNumber: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Shipping Method</label>
                            <select
                              className="input"
                              value={formData.shippingMethod}
                              onChange={(e) => setFormData({...formData, shippingMethod: e.target.value})}
                            >
                              <option value="">Select Method</option>
                              <option value="ROAD">Road Transport</option>
                              <option value="RAIL">Rail Transport</option>
                              <option value="AIR">Air Cargo</option>
                              <option value="SEA">Sea Freight</option>
                              <option value="COURIER">Courier</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Transporter Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of transport company"
                              value={formData.transporterName}
                              onChange={(e) => setFormData({...formData, transporterName: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Delivery Instructions</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Special instructions for delivery (timing, handling, etc.)"
                            value={formData.deliveryInstructions}
                            onChange={(e) => setFormData({...formData, deliveryInstructions: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {/* Section 4: Quality & Inspection */}
                    {currentSection === 4 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Quality & Inspection Requirements</h3>

                        <div>
                          <label className="block text-sm font-medium mb-2">Quality Standards</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Specify applicable quality standards (IS, ASTM, etc.)..."
                            value={formData.qualityStandards}
                            onChange={(e) => setFormData({...formData, qualityStandards: e.target.value})}
                          ></textarea>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="inspectionRequired"
                              checked={formData.inspectionRequired}
                              onChange={(e) => setFormData({...formData, inspectionRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="inspectionRequired" className="text-sm font-medium">
                              Inspection Required Before Acceptance
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="testCertificatesRequired"
                              checked={formData.testCertificatesRequired}
                              onChange={(e) => setFormData({...formData, testCertificatesRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="testCertificatesRequired" className="text-sm font-medium">
                              Test Certificates Required
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="sampleRequired"
                              checked={formData.sampleRequired}
                              onChange={(e) => setFormData({...formData, sampleRequired: e.target.checked})}
                              className="w-4 h-4"
                            />
                            <label htmlFor="sampleRequired" className="text-sm font-medium">
                              Sample Testing Required
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Material Grade</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., Grade A, M25, Fe500"
                              value={formData.materialGrade}
                              onChange={(e) => setFormData({...formData, materialGrade: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Brand Preference</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Preferred brand or equivalent"
                              value={formData.brandPreference}
                              onChange={(e) => setFormData({...formData, brandPreference: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 5: Terms & Conditions */}
                    {currentSection === 5 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Warranty Period</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="e.g., 12 months, 2 years"
                              value={formData.warrantyPeriod}
                              onChange={(e) => setFormData({...formData, warrantyPeriod: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Credit Period (Days)</label>
                            <input
                              type="number"
                              className="input"
                              placeholder="Number of credit days"
                              value={formData.creditPeriod}
                              onChange={(e) => setFormData({...formData, creditPeriod: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Return Policy</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Conditions for return/replacement of materials"
                            value={formData.returnPolicy}
                            onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})}
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Penalty Clause</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Penalties for late delivery, quality issues, etc."
                            value={formData.penaltyClause}
                            onChange={(e) => setFormData({...formData, penaltyClause: e.target.value})}
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Advance Payment (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            className="input"
                            placeholder="0.00"
                            value={formData.advancePayment}
                            onChange={(e) => setFormData({...formData, advancePayment: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {/* Section 6: Additional Details */}
                    {currentSection === 6 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Purchase Order Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="PO reference number"
                              value={formData.purchaseOrderNumber}
                              onChange={(e) => setFormData({...formData, purchaseOrderNumber: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Requisition Number</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Material requisition number"
                              value={formData.requisitionNumber}
                              onChange={(e) => setFormData({...formData, requisitionNumber: e.target.value.toUpperCase()})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Budget Code</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Budget allocation code"
                              value={formData.budgetCode}
                              onChange={(e) => setFormData({...formData, budgetCode: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Approver Name</label>
                            <input
                              type="text"
                              className="input"
                              placeholder="Name of approving authority"
                              value={formData.approverName}
                              onChange={(e) => setFormData({...formData, approverName: e.target.value})}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Attachments/References</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Document references, file paths"
                            value={formData.attachments}
                            onChange={(e) => setFormData({...formData, attachments: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Special Instructions</label>
                          <textarea
                            className="input"
                            rows="3"
                            placeholder="Any special requirements or instructions"
                            value={formData.specialInstructions}
                            onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Additional Notes</label>
                          <textarea
                            className="input"
                            rows="4"
                            placeholder="Any other information or remarks"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Step {currentSection + 1} of 7
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
                      {currentSection < 6 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentSection(currentSection + 1)}
                          className="btn-primary"
                        >
                          Next →
                        </button>
                      ) : (
                        <button type="submit" className="btn-primary">
                          ✓ Place Order
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                          setShowOrderModal(false);
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


export default MaterialsPage;
