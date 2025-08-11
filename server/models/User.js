const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile information
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Gamification
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: Date,
    icon: String
  }],
  
  // Activity tracking
  activitiesJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  activitiesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  
  // Reviews and ratings
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  // User preferences
  interests: [{
    type: String,
    enum: ['Environment', 'Education', 'Health', 'Culture', 'Community', 'Wildlife', 'Elderly Care', 'Disaster Relief']
  }],
  
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add points to user
userSchema.methods.addPoints = async function(points, reason = '') {
  this.points += points;
  
  // Level up logic (every 1000 points = new level)
  const newLevel = Math.floor(this.points / 1000) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    // Could trigger badge earning here
  }
  
  await this.save();
  return this.points;
};

// Calculate user ranking
userSchema.methods.getRanking = async function() {
  const usersAbove = await this.constructor.countDocuments({
    points: { $gt: this.points }
  });
  return usersAbove + 1;
};

// Get user's activity statistics
userSchema.methods.getActivityStats = function() {
  return {
    joined: this.activitiesJoined.length,
    created: this.activitiesCreated.length,
    points: this.points,
    level: this.level,
    badges: this.badges.length,
    rating: this.rating.average
  };
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
