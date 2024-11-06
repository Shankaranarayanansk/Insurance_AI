import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:mm format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:mm format'
    }
  }
});

const outOfOfficeSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Reason must be at least 3 characters long'],
    maxlength: [200, 'Reason cannot exceed 200 characters']
  }
});

const agentAvailabilitySchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  availabilitySlots: [timeSlotSchema],
  outOfOffice: [outOfOfficeSchema],
  maxAppointmentsPerDay: {
    type: Number,
    default: 8,
    min: [1, 'Must allow at least 1 appointment per day'],
    max: [20, 'Cannot exceed 20 appointments per day']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'UTC',
    required: true
  }
}, {
  timestamps: true
});

// Middleware to validate non-overlapping time slots
agentAvailabilitySchema.pre('save', function(next) {
  const slots = this.availabilitySlots;
  
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
    const daySlots = slots.filter(slot => slot.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (let i = 1; i < daySlots.length; i++) {
      if (daySlots[i].startTime <= daySlots[i-1].endTime) {
        next(new Error(`Overlapping time slots detected for ${day}`));
        return;
      }
    }
  }
  next();
});

// Method to check if agent is available at a specific time
agentAvailabilitySchema.methods.isAvailable = function(date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const timeString = date.toTimeString().slice(0, 5);

  // Check if date falls within any out-of-office periods
  const isOutOfOffice = this.outOfOffice.some(period => 
    date >= period.startDate && date <= period.endDate
  );
  if (isOutOfOffice) return false;

  // Check if time falls within any availability slots for that day
  return this.availabilitySlots.some(slot => 
    slot.day === dayOfWeek && 
    slot.startTime <= timeString && 
    timeString <= slot.endTime
  );
};

// Method to get available slots for a specific day
agentAvailabilitySchema.methods.getAvailableSlotsForDay = function(date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if date falls within any out-of-office periods
  const isOutOfOffice = this.outOfOffice.some(period => 
    date >= period.startDate && date <= period.endDate
  );
  if (isOutOfOffice) return [];

  return this.availabilitySlots.filter(slot => slot.day === dayOfWeek);
};

export default mongoose.model('AgentAvailability', agentAvailabilitySchema);