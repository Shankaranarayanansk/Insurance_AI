import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, X } from 'lucide-react';
import { addOutOfOffice, removeOutOfOffice } from '../../redux/slices/agentSlice';

const OutOfOfficeManager = () => {
  const dispatch = useDispatch();
  const { availability, loading } = useSelector((state: any) => state.agent);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addOutOfOffice({ startDate, endDate, reason }));
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleRemove = (id: string) => {
    dispatch(removeOutOfOffice(id));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Add Out of Office
        </button>
      </form>

      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Scheduled Out of Office</h4>
        <div className="space-y-4">
          {availability?.outOfOffice.map((item: any) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-md"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">{item.reason}</p>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutOfOfficeManager;