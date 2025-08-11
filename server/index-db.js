require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { initializeDatabase, loadSampleData, dbOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/activities/'))
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'activity-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database on startup
initializeDatabase().then(() => {
  console.log('📊 Database initialized successfully');
  // Load sample data
  loadSampleData();
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MMT Cause Quest API is running (Database Mode)',
    timestamp: new Date().toISOString(),
    mode: 'database'
  });
});

// Removed duplicate mock login endpoint - using database login only

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (name && email && password) {
    const newUser = {
      id: Date.now(), // Simple ID generation
      name,
      email,
      points: 0,
      level: 1,
      avatar: '',
      activitiesJoined: [],
      badges: []
    };
    
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: newUser
    });
  } else {
    res.status(400).json({ error: 'All fields are required' });
  }
});

// Mock endpoint removed - using proper auth implementation below

// Activities routes
app.get('/api/activities', async (req, res) => {
  try {
    const { category, city, search, organizer_id, userId, type } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (city) filters.city = city;
    if (search) filters.search = search;
    if (organizer_id) filters.organizer_id = organizer_id;
    if (userId) filters.userId = parseInt(userId);
    
    let activities;
    
    switch (type) {
      case 'my':
        activities = await dbOperations.getMyActivities(parseInt(userId), filters);
        break;
      case 'recommended':
        activities = await dbOperations.getRecommendedActivities(parseInt(userId), filters);
        break;
      case 'nearby':
        activities = await dbOperations.getNearbyActivities(parseInt(userId), filters);
        break;
      case 'all':
      default:
        activities = await dbOperations.getAllActivities(filters);
        break;
    }
    
    res.json({
      activities: activities,
      total: activities.length
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await dbOperations.getActivityById(parseInt(id));
    
    if (activity) {
      res.json({ activity });
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

app.post('/api/activities', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Creating new activity:', req.body.title || 'Unknown');
    console.log('📝 Request file:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Parse JSON fields that were sent as strings due to FormData
    const parsedLocation = JSON.parse(req.body.location || '{}');
    const parsedDateTime = JSON.parse(req.body.dateTime || '{}');
    const parsedCapacity = JSON.parse(req.body.capacity || '{}');
    const parsedRequirements = JSON.parse(req.body.requirements || '{}');
    const parsedPointsAwarded = JSON.parse(req.body.pointsAwarded || '{}');
    const parsedImpact = JSON.parse(req.body.impact || '{}');
    
    // Extract fields for database
    const activityData = {
      title: req.body.title,
      short_description: req.body.shortDescription,
      description: req.body.description,
      location: parsedLocation.address || `${parsedLocation.city}, ${parsedLocation.state}`,
      city: parsedLocation.city,
      state: parsedLocation.state,
      country: parsedLocation.country || 'India',
      date: parsedDateTime.start ? new Date(parsedDateTime.start).toISOString().split('T')[0] : null,
      time: parsedDateTime.start ? new Date(parsedDateTime.start).toTimeString().slice(0, 5) : null,
      end_date: parsedDateTime.end ? new Date(parsedDateTime.end).toISOString().split('T')[0] : null,
      end_time: parsedDateTime.end ? new Date(parsedDateTime.end).toTimeString().slice(0, 5) : null,
      duration: parseInt(req.body.duration) || 120,
      organizer_id: req.body.organizerId || 1,
      min_participants: parsedCapacity.min || 1,
      max_participants: parsedCapacity.max || 10,
      category: req.body.category,
      tags: JSON.stringify(req.body.tags ? JSON.parse(req.body.tags) : []),
      requirements: parsedRequirements.guidelines || '',
      requirements_age_min: parsedRequirements.ageLimit?.min || null,
      requirements_age_max: parsedRequirements.ageLimit?.max || null,
      requirements_skills: JSON.stringify(parsedRequirements.skills || []),
      requirements_items: JSON.stringify(parsedRequirements.items || []),
      impact_goal: parsedImpact.goal || '',
      impact_metrics: JSON.stringify(parsedImpact.metrics || []),
      points_participant: parsedPointsAwarded.participant || 50,
      points_organizer: parsedPointsAwarded.organizer || 100,
      image: null
    };


    // Add image URL if file was uploaded
    if (req.file) {
      activityData.image = `/uploads/activities/${req.file.filename}`;
      console.log('📸 Image uploaded:', activityData.image);
    }
    
    console.log('🔍 Activity data to be saved:', activityData);
    
    const newActivity = await dbOperations.createActivity(activityData);
    
    console.log('✅ Activity created successfully with ID:', newActivity.id);
    console.log('🎉 Points awarded to organizer for listing activity!');
    
    res.json({ 
      success: true, 
      activity: newActivity,
      message: 'Activity created successfully and points awarded!'
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity', details: error.message });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: 'File upload error', details: error.message });
  } else if (error) {
    console.error('Upload error:', error);
    return res.status(400).json({ error: 'Upload failed', details: error.message });
  }
  next();
});

app.post('/api/activities/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, userId, userName } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user is the organizer
    const activity = await dbOperations.getActivityById(parseInt(id));
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (activity.organizer_id === userId) {
      return res.status(400).json({ error: 'You cannot join your own activity' });
    }
    
    await dbOperations.joinActivity(parseInt(id), userId, userName || 'User');
    
    console.log('🎉 User joined activity and earned points!');
    
    res.json({ 
      success: true, 
      message: 'Successfully joined the activity!',
      pointsEarned: activity?.pointsAwarded?.participant || 50
    });
  } catch (error) {
    console.error('Error joining activity:', error);
    res.status(500).json({ error: error.message || 'Failed to join activity' });
  }
});

// Gamification routes
app.get('/api/gamification/leaderboard', async (req, res) => {
  try {
    const leaderboard = await dbOperations.getLeaderboard();
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/users/add-points', async (req, res) => {
  try {
    const { points, reason } = req.body;
    const userName = 'Demo User'; // In real app, get from auth token
    
    const result = await dbOperations.awardPointsToUser(userName, points, reason);
    
    res.json({
      success: true,
      totalPoints: result.totalPoints,
      level: result.level,
      pointsAdded: points
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

// User routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbOperations.getUserById(parseInt(id));
    
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/users/profile', async (req, res) => {
  try {
    // For demo purposes, always return user ID 1
    const user = await dbOperations.getUserById(1);
    
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Bookings routes (removed duplicate - using the enhanced version below)

app.get('/api/users/:id/suggestions', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Fetching suggestions for user ${id}`);
    
    // Get activity suggestions based on user's bookings
    const suggestions = await dbOperations.getActivitySuggestions(parseInt(id));
    
    console.log(`✅ Found ${suggestions.length} suggestions`);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching activity suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch activity suggestions' });
  }
});

app.get('/api/users/:id/joined-activities', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Fetching joined activities for user ${id}`);
    
    const joinedActivities = await dbOperations.getUserJoinedActivities(parseInt(id));
    
    console.log(`✅ Found ${joinedActivities.length} joined activities`);
    res.json({
      activities: joinedActivities,
      count: joinedActivities.length
    });
  } catch (error) {
    console.error('Error fetching joined activities:', error);
    res.status(500).json({ error: 'Failed to fetch joined activities' });
  }
});

app.put('/api/users/profile', (req, res) => {
  const user = {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    points: 1647,
    level: 2,
    avatar: '',
    activitiesJoined: [],
    badges: [{ name: 'Newcomer' }],
    ...req.body
  };
  res.json({ success: true, user });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: 'Internal server error'
  });
});

// Get user bookings
app.get('/api/users/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await dbOperations.getUserJoinedActivities(parseInt(id));
    const userActivities = await dbOperations.getUserOrganizedActivities(parseInt(id));
    
    res.json({
      success: true,
      bookings,
      userActivities
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// Create user booking
app.post('/api/users/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await dbOperations.createBooking(parseInt(id), req.body);
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user statistics
app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await dbOperations.getUserStats(parseInt(id));
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user points history
app.get('/api/users/:id/points-history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await dbOperations.getUserPointsHistory(parseInt(id));
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching user points history:', error);
    res.status(500).json({ error: 'Failed to fetch points history' });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbOperations.updateUserProfile(parseInt(id), req.body);
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbOperations.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate simple token (in production, use JWT)
    const token = `token_${user.id}_${Date.now()}`;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Check if user exists
    const existingUser = await dbOperations.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const newUser = await dbOperations.createUser({
      name,
      email,
      password,
      points: 0,
      level: 1,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    });

    // Generate token
    const token = `token_${newUser.id}_${Date.now()}`;

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user (for token validation)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Extract user ID from token (simple implementation)
    const userId = token.split('_')[1];
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await dbOperations.getUserById(parseInt(userId));
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// OTP Routes
app.post('/api/activities/:id/generate-otp', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user is the organizer
    const activity = await dbOperations.getActivityById(parseInt(id));
    if (!activity || activity.organizer_id !== userId) {
      return res.status(403).json({ error: 'Only the organizer can generate OTP' });
    }
    
    const result = await dbOperations.generateActivityOTP(parseInt(id));
    
    res.json({
      success: true,
      participantCount: result.participantCount,
      expiresAt: result.expiresAt,
      message: result.message + '. Participants can see their OTP in their profile.'
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: error.message || 'Failed to generate OTP' });
  }
});

app.post('/api/activities/:id/validate-otp', async (req, res) => {
  try {
    const { id } = req.params;
    const { otpCode, userId } = req.body;
    
    if (!otpCode || !userId) {
      return res.status(400).json({ error: 'OTP code and user ID are required' });
    }
    
    const result = await dbOperations.validateActivityOTP(parseInt(id), otpCode, userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error validating OTP:', error);
    res.status(400).json({ error: error.message || 'Failed to validate OTP' });
  }
});

app.post('/api/activities/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const result = await dbOperations.completeActivity(parseInt(id), userId);
    
    res.json(result);
  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(400).json({ error: error.message || 'Failed to complete activity' });
  }
});

// Review Routes
app.post('/api/activities/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, review } = req.body;
    
    if (!userId || !rating) {
      return res.status(400).json({ error: 'User ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const result = await dbOperations.submitActivityReview(parseInt(id), userId, rating, review);
    
    res.json(result);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(400).json({ error: error.message || 'Failed to submit review' });
  }
});

app.get('/api/activities/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await dbOperations.getActivityReviews(parseInt(id));
    const rating = await dbOperations.getActivityRating(parseInt(id));
    
    res.json({
      reviews,
      averageRating: rating.averageRating,
      totalReviews: rating.totalReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/activities/:id/user-status/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const status = await dbOperations.getUserActivityStatus(parseInt(id), parseInt(userId));
    
    res.json({ status });
  } catch (error) {
    console.error('Error fetching user activity status:', error);
    res.status(500).json({ error: 'Failed to fetch user activity status' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads/activities');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

app.listen(PORT, () => {
  console.log(`🚀 MMT Cause Quest API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Database mode: SQLite persistence enabled`);
  console.log(`🎯 Ready for frontend at http://localhost:3000`);
});
