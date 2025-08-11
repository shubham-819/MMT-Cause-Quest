const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    points: 1647,
    level: 2,
    avatar: '',
    activitiesJoined: [],
    badges: [{ name: 'Newcomer' }]
  }
];

const mockActivities = [
  {
    id: 1,
    title: 'Beach Cleanup Drive',
    shortDescription: 'Join us for a community beach cleanup in Goa. Help preserve marine life and enjoy the beach!',
    description: 'Join us for a comprehensive beach cleanup drive in beautiful Goa. We will work together to remove plastic waste, protect marine life, and raise awareness about ocean conservation. This is a great opportunity to meet like-minded people while making a positive impact on the environment.',
    category: 'Environment',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    location: { 
      city: 'Goa', 
      state: 'Goa',
      address: 'Baga Beach, North Goa',
      coordinates: { latitude: 15.5557, longitude: 73.7537 }
    },
    dateTime: { 
      start: new Date('2024-02-15T09:00:00'),
      end: new Date('2024-02-15T12:00:00')
    },
    duration: 180,
    capacity: { min: 5, max: 30 },
    registeredParticipants: Array(15).fill().map((_, i) => ({
      user: { id: i + 10, name: `Volunteer ${i + 1}` },
      status: 'registered'
    })),
    rating: { average: 4.5, count: 12 },
    organizer: { id: 2, name: 'Green Warriors NGO' },
    pointsAwarded: { participant: 50, organizer: 100 },
    status: 'published',
    verification: { status: 'approved', temScore: 85 },
    reviews: [
      {
        id: 1,
        user: { name: 'Sarah Kumar', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9567afe?w=100' },
        rating: 5,
        comment: 'Amazing experience! Well organized and made a real impact.',
        date: '2024-01-15'
      },
      {
        id: 2,
        user: { name: 'Raj Patel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        rating: 4,
        comment: 'Great initiative. Would love to participate in more such activities.',
        date: '2024-01-20'
      }
    ],
    requirements: {
      guidelines: 'Wear comfortable clothing and bring your own water bottle. Sun protection recommended.',
      items: ['Water bottle', 'Sun hat', 'Comfortable shoes', 'Hand gloves']
    }
  },
  {
    id: 2,
    title: 'Teaching Children at Local School',
    shortDescription: 'Volunteer to teach English and basic computer skills to underprivileged children.',
    description: 'Make a difference in the lives of underprivileged children by volunteering as a teacher. We need volunteers to help with English language skills, basic computer literacy, and general academic support. No formal teaching experience required - just enthusiasm and patience!',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400',
    location: { 
      city: 'Delhi', 
      state: 'Delhi',
      address: 'Government Primary School, Karol Bagh',
      coordinates: { latitude: 28.6515, longitude: 77.1900 }
    },
    dateTime: { 
      start: new Date('2024-02-18T10:00:00'),
      end: new Date('2024-02-18T14:00:00')
    },
    duration: 240,
    capacity: { min: 3, max: 15 },
    registeredParticipants: Array(8).fill().map((_, i) => ({
      user: { id: i + 20, name: `Teacher ${i + 1}` },
      status: 'registered'
    })),
    rating: { average: 4.8, count: 20 },
    organizer: { id: 3, name: 'Shiksha Foundation' },
    pointsAwarded: { participant: 75, organizer: 150 },
    status: 'published',
    verification: { status: 'approved', temScore: 92 },
    reviews: [
      {
        id: 1,
        user: { name: 'Maya Singh', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        rating: 5,
        comment: 'Wonderful experience teaching the kids. They are so eager to learn!',
        date: '2024-01-18'
      }
    ],
    requirements: {
      guidelines: 'Please bring educational materials if possible. Patience and enthusiasm required!',
      items: ['Notebooks', 'Pens/Pencils', 'Teaching materials (optional)']
    }
  },
  {
    id: 3,
    title: 'Tree Plantation Drive',
    shortDescription: 'Plant trees and create awareness about environmental conservation in Bangalore.',
    description: 'Join our tree plantation drive to combat climate change and improve air quality in Bangalore. We will plant native tree species, learn about sustainable practices, and contribute to creating a greener city. Tools and saplings will be provided.',
    category: 'Environment',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    location: { 
      city: 'Bangalore', 
      state: 'Karnataka',
      address: 'Cubbon Park, Central Bangalore',
      coordinates: { latitude: 12.9716, longitude: 77.5946 }
    },
    dateTime: { 
      start: new Date('2024-02-20T07:00:00'),
      end: new Date('2024-02-20T09:00:00')
    },
    duration: 120,
    capacity: { min: 10, max: 50 },
    registeredParticipants: Array(25).fill().map((_, i) => ({
      user: { id: i + 30, name: `Volunteer ${i + 1}` },
      status: 'registered'
    })),
    rating: { average: 4.6, count: 18 },
    organizer: { id: 4, name: 'Eco Warriors' },
    pointsAwarded: { participant: 60, organizer: 120 },
    status: 'published',
    verification: { status: 'approved', temScore: 88 },
    reviews: [
      {
        id: 1,
        user: { name: 'Arjun Reddy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
        rating: 5,
        comment: 'Great way to contribute to the environment. Very well organized!',
        date: '2024-01-22'
      },
      {
        id: 2,
        user: { name: 'Priya Gupta', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
        rating: 4,
        comment: 'Loved planting trees and learning about conservation.',
        date: '2024-01-25'
      }
    ],
    requirements: {
      guidelines: 'Early morning activity. Please wear comfortable clothes and bring your own water.',
      items: ['Water bottle', 'Comfortable shoes', 'Hat/Cap', 'Garden gloves (optional)']
    }
  }
];

// Mock leaderboard data
const mockLeaderboard = [
  {
    id: 1,
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9567afe?w=100',
    points: 2850,
    level: 5,
    activitiesCompleted: 28,
    location: 'Mumbai, Maharashtra',
    badges: ['Environment Champion', 'Community Leader', 'Travel Enthusiast'],
    rank: 1,
    growth: '+250 pts this month'
  },
  {
    id: 2,
    name: 'Rahul Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    points: 2640,
    level: 4,
    activitiesCompleted: 24,
    location: 'Delhi, Delhi',
    badges: ['Education Advocate', 'Green Warrior'],
    rank: 2,
    growth: '+180 pts this month'
  },
  {
    id: 3,
    name: 'Ananya Patel',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    points: 2420,
    level: 4,
    activitiesCompleted: 22,
    location: 'Bangalore, Karnataka',
    badges: ['Healthcare Hero', 'Tech for Good'],
    rank: 3,
    growth: '+320 pts this month'
  }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MMT Cause Quest API is running (Standalone Mode)',
    timestamp: new Date().toISOString(),
    mode: 'demo'
  });
});

// Auth routes (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  if (email && password) {
    const user = mockUsers[0];
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: user
    });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (name && email && password) {
    const newUser = {
      id: mockUsers.length + 1,
      name,
      email,
      points: 0,
      level: 1,
      avatar: '',
      activitiesJoined: [],
      badges: []
    };
    
    mockUsers.push(newUser);
    
    res.json({
      success: true,
      token: 'mock-jwt-token',
      user: newUser
    });
  } else {
    res.status(400).json({ error: 'All fields are required' });
  }
});

app.get('/api/auth/me', (req, res) => {
  // Mock current user
  res.json({ user: mockUsers[0] });
});

// Activities routes
app.get('/api/activities', (req, res) => {
  const { category, city, search } = req.query;
  let filteredActivities = mockActivities;
  
  if (category) {
    filteredActivities = filteredActivities.filter(a => a.category === category);
  }
  
  if (city) {
    filteredActivities = filteredActivities.filter(a => a.location.city.toLowerCase().includes(city.toLowerCase()));
  }
  
  if (search) {
    filteredActivities = filteredActivities.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    activities: filteredActivities,
    total: filteredActivities.length
  });
});

app.get('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  const activity = mockActivities.find(a => a.id === parseInt(id));
  
  if (activity) {
    res.json({ activity });
  } else {
    res.status(404).json({ error: 'Activity not found' });
  }
});

app.post('/api/activities', (req, res) => {
  const newActivity = {
    id: mockActivities.length + 1,
    ...req.body,
    organizer: { id: 1, name: 'Demo User' },
    registeredParticipants: [],
    rating: { average: 0, count: 0 },
    status: 'published',
    verification: { status: 'pending', temScore: 0 },
    reviews: [],
    requirements: {
      guidelines: req.body.requirements?.guidelines || 'Please follow the activity guidelines.',
      items: req.body.requirements?.items || []
    }
  };
  
  mockActivities.push(newActivity);
  res.json({ success: true, activity: newActivity });
});

app.post('/api/activities/:id/join', (req, res) => {
  const { id } = req.params;
  const activity = mockActivities.find(a => a.id === parseInt(id));
  
  if (activity) {
    const participant = {
      user: { id: 1, name: 'Demo User' },
      status: 'registered',
      registeredAt: new Date()
    };
    
    activity.registeredParticipants.push(participant);
    
    res.json({ 
      success: true, 
      message: 'Successfully joined the activity!',
      pointsEarned: activity.pointsAwarded.participant
    });
  } else {
    res.status(404).json({ error: 'Activity not found' });
  }
});

// Gamification routes
app.get('/api/gamification/leaderboard', (req, res) => {
  res.json({ leaderboard: mockLeaderboard });
});

app.post('/api/users/add-points', (req, res) => {
  const { points, reason } = req.body;
  const user = mockUsers[0];
  
  user.points += points;
  user.level = Math.floor(user.points / 1000) + 1;
  
  res.json({
    success: true,
    totalPoints: user.points,
    level: user.level,
    pointsAdded: points
  });
});

// User routes
app.get('/api/users/profile', (req, res) => {
  res.json({ user: mockUsers[0] });
});

app.put('/api/users/profile', (req, res) => {
  const user = mockUsers[0];
  Object.assign(user, req.body);
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 MMT Cause Quest API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Demo mode: No database required`);
  console.log(`🎯 Ready for frontend at http://localhost:3000`);
});
