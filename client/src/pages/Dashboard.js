import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  AccessTime,
  People,
  Star,
  Add,
  EmojiEvents,

  Share,
  BookmarkBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [selectedTab, searchTerm, categoryFilter, cityFilter]);

  const getActivityType = () => {
    switch (selectedTab) {
      case 0: return 'all';
      case 1: return 'my';
      case 2: return 'nearby';
      case 3: return 'recommended';
      default: return 'all';
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      params.append('type', getActivityType());
      if (user?.id) params.append('userId', user.id);
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (cityFilter) params.append('city', cityFilter);

      const response = await fetch(`/api/activities?${params.toString()}`);
      const data = await response.json();
      setActivities(data.activities || []);
      setFilteredActivities(data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setLoading(false);
    }
  };

  // Remove the separate filterActivities function since filtering is now done on the backend

  const handleActivityClick = (activityId) => {
    navigate(`/activity/${activityId}`);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getAvailableSpots = (activity) => {
    const maxSpots = activity.capacity?.max || activity.max_participants || 10;
    const registered = activity.registeredParticipants?.length || activity.current_participants || 0;
    return maxSpots - registered;
  };

  const categories = ['Environment', 'Education', 'Health', 'Culture', 'Community', 'Wildlife'];
  const tabLabels = ['All Activities', 'My Activities', 'Nearby', 'Recommended'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary" mb={2}>
          Discover Activities
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Find meaningful ways to make a difference while you travel
        </Typography>

        {/* User Stats Card */}
        {user && (
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user.avatar}
                    sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" fontWeight="bold">
                    Welcome back, {user.name}!
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Ready to make a difference today?
                  </Typography>
                </Grid>
                <Grid item>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">
                      {user.points || 0}
                    </Typography>
                    <Typography variant="caption">Points Earned</Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold">
                      {user.level || 1}
                    </Typography>
                    <Typography variant="caption">Current Level</Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/create-activity')}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                    }}
                  >
                    Create Activity
                  </Button>
                </Grid>
              </Grid>
              
              {/* Progress to next level */}
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Progress to Level {(user.level || 1) + 1}</Typography>
                  <Typography variant="body2">
                    {user.points || 0}/{((user.level || 1) + 1) * 1000} pts
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={((user.points || 0) % 1000) / 10}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 3 }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>

        {/* Search and Filters */}
        <Card sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="City"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                sx={{ height: 56 }}
              >
                More Filters
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Activities Grid */}
      <Grid container spacing={3}>
        {filteredActivities.map((activity) => (
          <Grid item xs={12} sm={6} md={4} key={activity.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => handleActivityClick(activity.id)}
            >
              <CardMedia
                component="img"
                height="200"
                image={activity.image}
                alt={activity.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Title and Description */}
                <Typography variant="h6" fontWeight="bold" mb={1} noWrap>
                  {activity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {(activity.shortDescription || activity.description || 'No description available').substring(0, 100)}...
                </Typography>

                {/* Category Chip */}
                <Chip
                  label={activity.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                {/* Activity Details */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {activity.location.city}, {activity.location.state}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(activity.dateTime.start)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {getAvailableSpots(activity)} spots available
                  </Typography>
                </Box>

                {/* Rating and Points */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                    <Typography variant="body2">
                      {activity.rating?.average?.toFixed(1) || '4.0'} ({activity.rating?.count || 0})
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmojiEvents sx={{ fontSize: 16, color: '#ffc107' }} />
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      +{activity.pointsAwarded?.participant || 50} pts
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box display="flex" gap={1}>
                  {activity.organizer_id === user?.id ? (
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      disabled
                    >
                      Your Activity
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      size="small"
                      disabled={getAvailableSpots(activity) === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity.id);
                      }}
                    >
                      {getAvailableSpots(activity) === 0 ? 'Full' : 'Join Activity'}
                    </Button>
                  )}
                  <Tooltip title="Save for later">
                    <IconButton
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookmarkBorder />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredActivities.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary" mb={2}>
            No activities found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Try adjusting your search filters or create a new activity
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/create-activity')}
          >
            Create New Activity
          </Button>
        </Box>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            Loading activities...
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
