import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, X, Save, AlertCircle } from 'lucide-react';
import { fetchAvailability, updateAvailability } from '../../redux/slices/agentSlice';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 24 * 2 }).map((_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const AvailabilityScheduler = () => {
  const dispatch = useDispatch();
  const { availability, loading, error } = useSelector((state: any) => state.agent);
  const [slots, setSlots] = useState<any[]>([]);
  const [maxAppointments, setMaxAppointments] = useState(8);
  const [timezone, setTimezone] = useState('UTC');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(fetchAvailability());
  }, [dispatch]);

  useEffect(() => {
    if (availability) {
      setSlots(availability.availabilitySlots || []);
      setMaxAppointments(availability.maxAppointmentsPerDay || 8);
      setTimezone(availability.timezone || 'UTC');
    }
  }, [availability]);

  const validateTimeSlots = (newSlots: any[]) => {
    for (const day of DAYS) {
      const daySlots = newSlots
        .filter(slot => slot.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      for (let i = 1; i < daySlots.length; i++) {
        if (daySlots[i].startTime <= daySlots[i-1].endTime) {
          return `Overlapping time slots detected for ${day}`;
        }
      }
    }
    return '';
  };

  const addSlot = () => {
    const newSlot = { 
      day: DAYS[0], 
      startTime: '09:00', 
      endTime: '17:00' 
    };
    const newSlots = [...slots, newSlot];
    const error = validateTimeSlots(newSlots);
    
    if (error) {
      setValidationError(error);
      return;
    }

    setSlots(newSlots);
    setValidationError('');
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
    setValidationError('');
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    
    const error = validateTimeSlots(newSlots);
    if (error) {
      setValidationError(error);
      return;
    }

    setSlots(newSlots);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateTimeSlots(slots);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await dispatch(updateAvailability({ 
        availabilitySlots: slots,
        maxAppointmentsPerDay: maxAppointments,
        timezone
      })).unwrap();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to update availability');
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={index} className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <select
                value={slot.day}
                onChange={(e) => updateSlot(index, 'day', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>

              <select
                value={slot.startTime}
                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

              <span className="text-gray-500">to</span>

              <select
                value={slot.endTime}
                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>

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

        <div className="flex flex-wrap gap-4">
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
            disabled={loading || !!validationError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityScheduler;