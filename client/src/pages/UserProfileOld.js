import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import {
  Edit,
  EmojiEvents,
  Star,
  LocationOn,
  CalendarToday,
  TrendingUp,
  Share,
  Settings,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no ID provided, show current user's profile
    if (!id && currentUser) {
      setUser(currentUser);
      setLoading(false);
    } else if (id) {
      fetchUserProfile();
    }
  }, [id, currentUser]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const isOwnProfile = !id || (currentUser && user && currentUser.id === user.id);

  const mockStats = {
    activitiesJoined: 15,
    activitiesCreated: 3,
    totalImpactHours: 45,
    peopleHelped: 120,
    treesPlanted: 25,
    wasteCollected: '15 kg'
  };

  const mockActivities = [
    {
      id: 1,
      title: 'Beach Cleanup Drive',
      date: '2024-02-15',
      status: 'completed',
      type: 'joined',
      impact: 'Collected 5kg of plastic waste'
    },
    {
      id: 2,
      title: 'Teaching Workshop',
      date: '2024-02-10',
      status: 'completed',
      type: 'organized',
      impact: 'Taught 20 children basic computer skills'
    },
    {
      id: 3,
      title: 'Tree Plantation',
      date: '2024-02-20',
      status: 'upcoming',
      type: 'joined',
      impact: null
    }
  ];

  const mockBadges = [
    { name: 'Environment Champion', description: 'Completed 10 environmental activities', earned: '2024-01-15' },
    { name: 'Community Leader', description: 'Organized 5 successful activities', earned: '2024-02-01' },
    { name: 'Green Warrior', description: 'Planted 20+ trees', earned: '2024-02-10' },
    { name: 'Travel Enthusiast', description: 'Participated in activities across 5 cities', earned: '2024-02-05' }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" textAlign="center">
          Loading profile...
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" textAlign="center" color="error">
          User not found
        </Typography>
      </Container>
    );
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0: // Activities
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Recent Activities
              </Typography>
              <List>
                {mockActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: activity.type === 'organized' ? 'primary.main' : 'secondary.main' }}>
                          {activity.type === 'organized' ? '📋' : '🤝'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography fontWeight="bold">{activity.title}</Typography>
                            <Chip
                              label={activity.status}
                              size="small"
                              color={activity.status === 'completed' ? 'success' : 'primary'}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {activity.type === 'organized' ? 'Organized' : 'Participated'} • {activity.date}
                            </Typography>
                            {activity.impact && (
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                Impact: {activity.impact}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < mockActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        );

      case 1: // Badges
        return (
          <Grid container spacing={3}>
            {mockBadges.map((badge, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>🏆</Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {badge.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {badge.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Earned on {badge.earned}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2: // Impact
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {mockStats.totalImpactHours}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impact Hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {mockStats.peopleHelped}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    People Helped
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {mockStats.treesPlanted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trees Planted
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold" color="primary">
                    {mockStats.wasteCollected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Waste Collected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user.avatar}
                    sx={{ width: 120, height: 120, fontSize: '3rem' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </Grid>
                
                <Grid item xs>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" mb={1}>
                        {user.name}
                      </Typography>
                      
                      {user.bio && (
                        <Typography variant="body1" color="text.secondary" mb={2}>
                          {user.bio}
                        </Typography>
                      )}
                      
                      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                        {user.location && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {user.location.city}, {user.location.state}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Joined {new Date(user.createdAt || '2024-01-01').toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {user.interests?.map((interest, index) => (
                          <Chip key={index} label={interest} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      {isOwnProfile && (
                        <Button variant="outlined" startIcon={<Edit />}>
                          Edit Profile
                        </Button>
                      )}
                      <Button variant="outlined" startIcon={<Share />}>
                        Share
                      </Button>
                      {isOwnProfile && (
                        <Button variant="outlined" startIcon={<Settings />}>
                          Settings
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                    <EmojiEvents sx={{ color: '#ffc107' }} />
                    <Typography variant="h4" fontWeight="bold">
                      {user.points || 0}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Points
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                    <Star sx={{ color: '#1976d2' }} />
                    <Typography variant="h4" fontWeight="bold">
                      {user.level || 1}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Level
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {mockStats.activitiesJoined}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activities Joined
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {mockStats.activitiesCreated}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Activities Created
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Level Progress */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Progress to Level {(user.level || 1) + 1}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="success.main" fontWeight="bold">
                    +{Math.floor(Math.random() * 100)} pts this month
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {user.points || 0} / {((user.level || 1) + 1) * 1000} points
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {((user.level || 1) + 1) * 1000 - (user.points || 0)} points to go
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={((user.points || 0) % 1000) / 10}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Activities" />
              <Tab label="Badges" />
              <Tab label="Impact" />
            </Tabs>
          </Paper>

          {renderTabContent()}
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;
