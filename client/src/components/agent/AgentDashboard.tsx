import React from 'react';
import { Calendar, Clock, UserX } from 'lucide-react';
import AvailabilityScheduler from './AvailabilityScheduler';
import OutOfOfficeManager from './OutOfOfficeManager';

const AgentDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Agent Dashboard
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Availability Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Availability Schedule</h3>
            </div>
            <div className="mt-4">
              <AvailabilityScheduler />
            </div>
          </div>

          {/* Out of Office Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserX className="h-6 w-6 text-blue-600" />
              <h3 className="ml-2 text-lg font-medium text-gray-900">Out of Office</h3>
            </div>
            <div className="mt-4">
              <OutOfOfficeManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;