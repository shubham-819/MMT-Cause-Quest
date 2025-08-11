const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Basic activity information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 300
  },
  
  // Activity categorization
  category: {
    type: String,
    required: true,
    enum: ['Environment', 'Education', 'Health', 'Culture', 'Community', 'Wildlife', 'Elderly Care', 'Disaster Relief']
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Location details
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    landmark: String
  },
  
  // Timing information
  dateTime: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  // Capacity and registration
  capacity: {
    min: { type: Number, default: 1 },
    max: { type: Number, required: true }
  },
  registeredParticipants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'no-show', 'cancelled'],
      default: 'registered'
    },
    checkIn: {
      timestamp: Date,
      location: {
        latitude: Number,
        longitude: Number
      },
      verified: { type: Boolean, default: false }
    }
  }],
  
  // Organization details
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationType: {
    type: String,
    enum: ['individual', 'ngo', 'corporate', 'government'],
    default: 'individual'
  },
  
  // Requirements and guidelines
  requirements: {
    ageLimit: {
      min: { type: Number, default: 16 },
      max: { type: Number, default: 65 }
    },
    skills: [String],
    items: [String], // Items participants should bring
    guidelines: String
  },
  
  // Impact and goals
  impact: {
    goal: String,
    metrics: [{
      name: String,
      target: Number,
      achieved: { type: Number, default: 0 },
      unit: String
    }]
  },
  
  // Media and documentation
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Verification and quality
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    notes: String,
    temScore: { type: Number, default: 0 } // TEM system score
  },
  
  // Activity status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Reviews and feedback
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    photos: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  // Points and rewards
  pointsAwarded: {
    organizer: { type: Number, default: 100 },
    participant: { type: Number, default: 50 }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
activitySchema.index({ 'location.city': 1, 'dateTime.start': 1 });
activitySchema.index({ category: 1, status: 1 });
activitySchema.index({ organizer: 1 });
activitySchema.index({ 'dateTime.start': 1, status: 1 });

// Update the updatedAt field before saving
activitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate average rating
activitySchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
};

// Check if user is registered
activitySchema.methods.isUserRegistered = function(userId) {
  return this.registeredParticipants.some(
    participant => participant.user.toString() === userId.toString()
  );
};

// Get available spots
activitySchema.methods.getAvailableSpots = function() {
  const registeredCount = this.registeredParticipants.filter(
    p => p.status !== 'cancelled'
  ).length;
  return this.capacity.max - registeredCount;
};

// Check if activity is full
activitySchema.methods.isFull = function() {
  return this.getAvailableSpots() <= 0;
};

// Check if registration is open
activitySchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    this.dateTime.start > now &&
    !this.isFull()
  );
};

// Get activity summary
activitySchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    shortDescription: this.shortDescription,
    category: this.category,
    location: this.location,
    dateTime: this.dateTime,
    capacity: this.capacity,
    registeredCount: this.registeredParticipants.length,
    availableSpots: this.getAvailableSpots(),
    rating: this.rating,
    images: this.images.slice(0, 3), // First 3 images
    organizer: this.organizer,
    pointsAwarded: this.pointsAwarded
  };
};

module.exports = mongoose.model('Activity', activitySchema);
