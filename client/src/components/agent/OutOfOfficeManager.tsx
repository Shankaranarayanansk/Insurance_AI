import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, X, AlertCircle } from 'lucide-react';
import { addOutOfOffice, removeOutOfOffice } from '../../redux/slices/agentSlice';

interface OutOfOfficeFormData {
  startDate: string;
  endDate: string;
  reason: string;
}

const OutOfOfficeManager = () => {
  const dispatch = useDispatch();
  const { availability, loading, error } = useSelector((state: any) => state.agent);
  const [formData, setFormData] = useState<OutOfOfficeFormData>({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [validationError, setValidationError] = useState('');

  const validateDates = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      return 'End date must be after start date';
    }

    // Check for overlaps with existing periods
    const hasOverlap = availability?.outOfOffice.some((period: any) => 
      (startDate <= new Date(period.endDate) && endDate >= new Date(period.startDate))
    );

    if (hasOverlap) {
      return 'New out-of-office period overlaps with existing ones';
    }

    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateDates(formData.startDate, formData.endDate);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await dispatch(addOutOfOffice(formData)).unwrap();
      setFormData({ startDate: '', endDate: '', reason: '' });
      setValidationError('');
    } catch (err: any) {
      setValidationError(err.message || 'Failed to add out-of-office period');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await dispatch(removeOutOfOffice(id)).unwrap();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to remove out-of-office period');
    }
  };

  return (
    <div className="space-y-6">
      {(error || validationError) && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error || validationError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            name="reason"
            required
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter reason for out-of-office period"
            maxLength={200}
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.reason.length}/200 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !!validationError}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar className="h-5 w-5 mr-2" />
          {loading ? 'Adding...' : 'Add Out of Office'}
        </button>
      </form>

      <div className="mt-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Scheduled Out of Office Periods</h4>
        <div className="space-y-4">
          {availability?.outOfOffice.map((item: any) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">{item.reason}</p>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                disabled={loading}
                className="ml-4 inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          {availability?.outOfOffice.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No out-of-office periods scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutOfOfficeManager;