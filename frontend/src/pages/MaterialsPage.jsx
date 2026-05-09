import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import materialService from '../services/material.service';

const MaterialsPage = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    materialId: '',
    quantity: '',
    expectedDelivery: '',
    supplier: '',
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
      setFormData({
        materialId: '',
        quantity: '',
        expectedDelivery: '',
        supplier: '',
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Order</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleCreateOrder}>
                <div>
                  <label className="block text-sm font-medium mb-2">Material</label>
                  <select
                    className="input"
                    value={formData.materialId}
                    onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                    required
                  >
                    <option value="">Select material</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Delivery</label>
                    <input
                      type="date"
                      className="input"
                      value={formData.expectedDelivery}
                      onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Supplier name"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Place Order
                  </button>
                  <button
                    type="button"
                    className="btn-ghost flex-1"
                    onClick={() => setShowOrderModal(false)}
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


export default MaterialsPage;
