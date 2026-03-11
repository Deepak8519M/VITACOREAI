import mongoose from 'mongoose';

const vitalSignsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['bmi', 'bloodPressure', 'heartRate', 'bloodSugar', 'temperature']
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // BMI specific fields
  height: {
    type: Number,
    min: 50, // cm
    max: 300, // cm
    required: function() { return this.type === 'bmi'; }
  },
  heightUnit: {
    type: String,
    enum: ['cm', 'inches'],
    default: 'cm'
  },
  weight: {
    type: Number,
    min: 1, // kg
    max: 500, // kg
    required: function() { return this.type === 'bmi'; }
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lbs'],
    default: 'kg'
  },
  bmi: {
    type: Number,
    min: 10,
    max: 100,
    required: function() { return this.type === 'bmi'; }
  },
  bmiCategory: {
    type: String,
    enum: ['Underweight', 'Normal weight', 'Overweight', 'Obese'],
    required: function() { return this.type === 'bmi'; }
  },
  
  // Blood Pressure specific fields
  systolic: {
    type: Number,
    min: 60,
    max: 300,
    required: function() { return this.type === 'bloodPressure'; }
  },
  diastolic: {
    type: Number,
    min: 30,
    max: 200,
    required: function() { return this.type === 'bloodPressure'; }
  },
  pulse: {
    type: Number,
    min: 30,
    max: 250
  },
  bpPosition: {
    type: String,
    enum: ['sitting', 'standing', 'lying'],
    default: 'sitting'
  },
  bpCategory: {
    type: String,
    enum: ['Normal', 'Elevated', 'Stage 1 Hypertension', 'Stage 2 Hypertension', 'Hypertensive Crisis'],
    required: function() { return this.type === 'bloodPressure'; }
  },
  
  // Heart Rate specific fields
  heartRate: {
    type: Number,
    min: 20,
    max: 300,
    required: function() { return this.type === 'heartRate'; }
  },
  activity: {
    type: String,
    enum: ['resting', 'walking', 'running', 'cycling', 'swimming', 'strength'],
    default: 'resting'
  },
  duration: {
    type: Number,
    min: 0,
    max: 1440 // minutes in a day
  },
  hrZone: {
    type: String,
    enum: ['Bradycardia', 'Normal', 'Tachycardia', 'Recovery', 'Fat Burn', 'Cardio', 'Peak', 'Maximum'],
    required: function() { return this.type === 'heartRate'; }
  },
  
  // Blood Sugar specific fields
  glucose: {
    type: Number,
    min: 20,
    max: 600,
    required: function() { return this.type === 'bloodSugar'; }
  },
  timing: {
    type: String,
    enum: ['fasting', 'post-meal', 'random'],
    default: 'fasting'
  },
  meal: {
    type: String,
    maxlength: 100
  },
  medication: {
    type: String,
    maxlength: 100
  },
  bsCategory: {
    type: String,
    enum: ['Hypoglycemia', 'Normal', 'Prediabetes', 'Diabetes'],
    required: function() { return this.type === 'bloodSugar'; }
  },
  
  // Temperature specific fields
  temperature: {
    type: Number,
    min: 25,
    max: 45,
    required: function() { return this.type === 'temperature'; }
  },
  unit: {
    type: String,
    enum: ['celsius', 'fahrenheit'],
    default: 'celsius'
  },
  symptoms: [{
    type: String,
    maxlength: 50
  }],
  tempCategory: {
    type: String,
    enum: ['Hypothermia', 'Normal', 'Fever', 'High Fever', 'Very High Fever'],
    required: function() { return this.type === 'temperature'; }
  },
  
  // Common fields
  notes: {
    type: String,
    maxlength: 500
  },
  risk: {
    type: String,
    enum: ['low', 'normal', 'moderate', 'high', 'critical']
  },
  color: {
    type: String,
    enum: ['blue', 'emerald', 'amber', 'orange', 'rose', 'red']
  }
}, {
  timestamps: true,
  collection: 'vitalsigns'
});

// Compound indexes for better query performance
vitalSignsSchema.index({ userId: 1, type: 1, date: -1 });
vitalSignsSchema.index({ userId: 1, date: -1 });

// Prevent duplicate entries within same hour for same user and type
vitalSignsSchema.index(
  { userId: 1, type: 1, date: 1 },
  { unique: true, 
    partialFilterExpression: { 
      date: { $gte: new Date() } 
    } 
  }
);

const VitalSigns = mongoose.model('VitalSigns', vitalSignsSchema);

export default VitalSigns;
