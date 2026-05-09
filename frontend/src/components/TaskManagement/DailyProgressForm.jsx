import { useState } from 'react';
import { Plus, Minus, X, Cloud, CloudRain, CloudSnow, Sun, Wind, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';
import useProgressStore from '../../stores/progressStore';

/**
 * DailyProgressForm Component
 * Mobile-responsive form for submitting daily progress reports
 * Includes labor attendance, equipment usage, material consumption, and weather conditions
 */
const DailyProgressForm = ({ taskId, onClose }) => {
  const { submitDailyReport } = useProgressStore();

  const [formData, setFormData] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    progressToday: 0,
    cumulativeProgress: 0,
    progressDescription: '',
    laborAttendance: [],
    equipmentUsage: [],
    materialsConsumed: [],
    weatherConditions: {
      condition: 'CLEAR',
      temperature: '',
      rainfall: 0,
      workingHours: 8
    },
    issues: [],
    safetyIncidents: [],
    photos: []
  });

  const [submitting, setSubmitting] = useState(false);

  // Labor category options
  const laborCategories = [
    { id: 'MASON', label: 'Mason', defaultWage: 800 },
    { id: 'HELPER', label: 'Helper', defaultWage: 500 },
    { id: 'CARPENTER', label: 'Carpenter', defaultWage: 750 },
    { id: 'ELECTRICIAN', label: 'Electrician', defaultWage: 900 },
    { id: 'PLUMBER', label: 'Plumber', defaultWage: 850 },
    { id: 'PAINTER', label: 'Painter', defaultWage: 700 },
    { id: 'WELDER', label: 'Welder', defaultWage: 950 },
    { id: 'SUPERVISOR', label: 'Supervisor', defaultWage: 1200 }
  ];

  const weatherOptions = [
    { value: 'CLEAR', label: 'Clear', icon: Sun },
    { value: 'CLOUDY', label: 'Cloudy', icon: Cloud },
    { value: 'RAINY', label: 'Rainy', icon: CloudRain },
    { value: 'STORMY', label: 'Stormy', icon: Wind }
  ];

  const addLabor = () => {
    setFormData({
      ...formData,
      laborAttendance: [
        ...formData.laborAttendance,
        { category: 'MASON', count: 1, hours_worked: 8, wage_rate: 800 }
      ]
    });
  };

  const removeLabor = (index) => {
    setFormData({
      ...formData,
      laborAttendance: formData.laborAttendance.filter((_, i) => i !== index)
    });
  };

  const updateLabor = (index, field, value) => {
    const updated = [...formData.laborAttendance];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-update wage rate when category changes
    if (field === 'category') {
      const category = laborCategories.find(c => c.id === value);
      updated[index].wage_rate = category?.defaultWage || 0;
    }

    setFormData({ ...formData, laborAttendance: updated });
  };

  const addEquipment = () => {
    setFormData({
      ...formData,
      equipmentUsage: [
        ...formData.equipmentUsage,
        { equipment_type: '', hours_used: 0, hourly_rate: 0, operator_name: '' }
      ]
    });
  };

  const removeEquipment = (index) => {
    setFormData({
      ...formData,
      equipmentUsage: formData.equipmentUsage.filter((_, i) => i !== index)
    });
  };

  const updateEquipment = (index, field, value) => {
    const updated = [...formData.equipmentUsage];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, equipmentUsage: updated });
  };

  const addMaterial = () => {
    setFormData({
      ...formData,
      materialsConsumed: [
        ...formData.materialsConsumed,
        { material_name: '', quantity: 0, unit: '', rate: 0, supplier: '' }
      ]
    });
  };

  const removeMaterial = (index) => {
    setFormData({
      ...formData,
      materialsConsumed: formData.materialsConsumed.filter((_, i) => i !== index)
    });
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...formData.materialsConsumed];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, materialsConsumed: updated });
  };

  const addIssue = () => {
    const issue = prompt('Describe the issue:');
    if (issue) {
      setFormData({
        ...formData,
        issues: [...formData.issues, { description: issue, reportedAt: new Date().toISOString() }]
      });
    }
  };

  const removeIssue = (index) => {
    setFormData({
      ...formData,
      issues: formData.issues.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.progressToday < 0 || formData.progressToday > 100) {
      toast.error('Progress today must be between 0 and 100%');
      return;
    }

    if (formData.cumulativeProgress < 0 || formData.cumulativeProgress > 100) {
      toast.error('Cumulative progress must be between 0 and 100%');
      return;
    }

    setSubmitting(true);
    try {
      await submitDailyReport(taskId, {
        ...formData,
        totalLaborCount: formData.laborAttendance.reduce((sum, labor) => sum + labor.count, 0)
      });
      toast.success('Daily report submitted successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error submitting daily report:', error);
      toast.error('Failed to submit daily report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Daily Progress Report</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date & Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Today (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.progressToday}
                  onChange={(e) => setFormData({ ...formData, progressToday: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cumulative Progress (%) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.cumulativeProgress}
                  onChange={(e) => setFormData({ ...formData, cumulativeProgress: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Progress Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Description *
              </label>
              <textarea
                required
                value={formData.progressDescription}
                onChange={(e) => setFormData({ ...formData, progressDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Describe today's work activities..."
              />
            </div>

            {/* Labor Attendance */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Labor Attendance</h3>
                <button
                  type="button"
                  onClick={addLabor}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Labor
                </button>
              </div>

              <div className="space-y-3">
                {formData.laborAttendance.map((labor, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-3 rounded-lg">
                    <select
                      value={labor.category}
                      onChange={(e) => updateLabor(index, 'category', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {laborCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Count"
                      value={labor.count}
                      onChange={(e) => updateLabor(index, 'count', parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="1"
                    />

                    <input
                      type="number"
                      placeholder="Hours"
                      value={labor.hours_worked}
                      onChange={(e) => updateLabor(index, 'hours_worked', parseFloat(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      step="0.5"
                    />

                    <input
                      type="number"
                      placeholder="Wage/day"
                      value={labor.wage_rate}
                      onChange={(e) => updateLabor(index, 'wage_rate', parseFloat(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                    />

                    <button
                      type="button"
                      onClick={() => removeLabor(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Usage */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Equipment Usage</h3>
                <button
                  type="button"
                  onClick={addEquipment}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Equipment
                </button>
              </div>

              <div className="space-y-3">
                {formData.equipmentUsage.map((equipment, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-3 rounded-lg">
                    <input
                      type="text"
                      placeholder="Equipment Type"
                      value={equipment.equipment_type}
                      onChange={(e) => updateEquipment(index, 'equipment_type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Hours Used"
                      value={equipment.hours_used}
                      onChange={(e) => updateEquipment(index, 'hours_used', parseFloat(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      step="0.5"
                    />

                    <input
                      type="number"
                      placeholder="Rate/Hour"
                      value={equipment.hourly_rate}
                      onChange={(e) => updateEquipment(index, 'hourly_rate', parseFloat(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                    />

                    <input
                      type="text"
                      placeholder="Operator Name"
                      value={equipment.operator_name}
                      onChange={(e) => updateEquipment(index, 'operator_name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials Consumed */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Materials Consumed</h3>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Material
                </button>
              </div>

              <div className="space-y-3">
                {formData.materialsConsumed.map((material, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-3 rounded-lg">
                    <input
                      type="text"
                      placeholder="Material Name"
                      value={material.material_name}
                      onChange={(e) => updateMaterial(index, 'material_name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2"
                    />

                    <input
                      type="number"
                      placeholder="Quantity"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      step="0.01"
                    />

                    <input
                      type="text"
                      placeholder="Unit"
                      value={material.unit}
                      onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Rate"
                      value={material.rate}
                      onChange={(e) => updateMaterial(index, 'rate', parseFloat(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                    />

                    <button
                      type="button"
                      onClick={() => removeMaterial(index)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Conditions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Conditions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {weatherOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      weatherConditions: { ...formData.weatherConditions, condition: option.value }
                    })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      formData.weatherConditions.condition === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <option.icon className="w-8 h-8 text-gray-600" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input
                  type="number"
                  placeholder="Temperature (°C)"
                  value={formData.weatherConditions.temperature}
                  onChange={(e) => setFormData({
                    ...formData,
                    weatherConditions: { ...formData.weatherConditions, temperature: e.target.value }
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Working Hours"
                  value={formData.weatherConditions.workingHours}
                  onChange={(e) => setFormData({
                    ...formData,
                    weatherConditions: { ...formData.weatherConditions, workingHours: parseFloat(e.target.value) }
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max="24"
                  step="0.5"
                />
              </div>
            </div>

            {/* Issues */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Issues & Challenges</h3>
                <button
                  type="button"
                  onClick={addIssue}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Issue
                </button>
              </div>

              <div className="space-y-2">
                {formData.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg">
                    <p className="flex-1 text-sm text-gray-700">{issue.description}</p>
                    <button
                      type="button"
                      onClick={() => removeIssue(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {formData.issues.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No issues reported</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressForm;
