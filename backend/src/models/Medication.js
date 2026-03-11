import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  dosage: {
    type: String,
    required: true,
    maxlength: 50
  },
  frequency: {
    type: String,
    required: true,
    enum: ['once daily', 'twice daily', 'three times daily', 'four times daily', 'weekly', 'monthly', 'as needed']
  },
  withFood: {
    type: Boolean,
    default: false
  },
  currentSupply: {
    type: Number,
    min: 0,
    required: true
  },
  totalSupply: {
    type: Number,
    min: 1,
    required: true
  },
  dailyDosage: {
    type: Number,
    min: 1,
    required: true
  },
  daysRemaining: {
    type: Number,
    min: 0
  },
  refillDate: {
    type: Date,
    required: true
  },
  pharmacy: {
    type: String,
    maxlength: 100
  },
  doctor: {
    type: String,
    maxlength: 100
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  lastRefill: {
    type: Date,
    default: Date.now
  },
  reminderLevel: {
    type: String,
    enum: ['critical', 'moderate', 'low'],
    default: 'low'
  }
}, {
  timestamps: true,
  collection: 'medications'
});

// Indexes for efficient querying
medicationSchema.index({ userId: 1, status: 1 });
medicationSchema.index({ userId: 1, refillDate: 1 });
medicationSchema.index({ userId: 1, reminderLevel: 1 });

const Medication = mongoose.model('Medication', medicationSchema);

// Drug Interaction Schema
const drugInteractionSchema = new mongoose.Schema({
  medications: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }],
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  effect: {
    type: String,
    required: true,
    maxlength: 200
  },
  recommendation: {
    type: String,
    required: true,
    maxlength: 300
  },
  mechanism: {
    type: String,
    maxlength: 200
  }
}, {
  collection: 'druginteractions'
});

drugInteractionSchema.index({ medications: 1 });

const DrugInteraction = mongoose.model('DrugInteraction', drugInteractionSchema);

// Drug Information Schema
const drugInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    maxlength: 50
  },
  commonDosages: [{
    type: String,
    maxlength: 20
  }],
  frequency: {
    type: String,
    maxlength: 50
  },
  withFood: {
    type: Boolean,
    default: false
  },
  precautions: [{
    type: String,
    maxlength: 100
  }],
  alternatives: [{
    type: String,
    maxlength: 100
  }]
}, {
  collection: 'druginfos'
});

const DrugInfo = mongoose.model('DrugInfo', drugInfoSchema);

export { Medication, DrugInteraction, DrugInfo };
