import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, X, Save } from 'lucide-react';
import { fetchAvailability, updateAvailability } from '../../redux/slices/agentSlice';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityScheduler = () => {
  const dispatch = useDispatch();
  const { availability, loading } = useSelector((state: any) => state.agent);
  const [slots, setSlots] = useState<any[]>([]);
  const [maxAppointments, setMaxAppointments] = useState(8);

  useEffect(() => {
    dispatch(fetchAvailability());
  }, [dispatch]);

  useEffect(() => {
    if (availability) {
      setSlots(availability.availabilitySlots || []);
      setMaxAppointments(availability.maxAppointmentsPerDay || 8);
    }
  }, [availability]);

  const addSlot = () => {
    setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateAvailability({ 
      availabilitySlots: slots,
      maxAppointmentsPerDay: maxAppointments 
    }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maximum Appointments Per Day
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxAppointments}
            onChange={(e) => setMaxAppointments(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={index} className="flex items-center space-x-4">
              <select
                value={slot.day}
                onChange={(e) => updateSlot(index, 'day', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <span>to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={addSlot}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Time Slot
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Schedule
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityScheduler;