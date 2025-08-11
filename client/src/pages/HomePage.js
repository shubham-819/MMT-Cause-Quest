import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,


  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Flight,
  Hotel,
  Home,
  Train,
  DirectionsCar,
  LocalTaxi,
  TwoWheeler,
  DirectionsBus,
  ChevronLeft,
  ChevronRight,
  Hiking,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();


  // Indian states list for search
  const indianStates = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
    'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati', 'Chandigarh',
    'Hubli-Dharwad', 'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur',
    'Gurgaon', 'Moradabad', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar',
    'Warangal', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati',
    'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Nellore',
    'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
    'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi',
    'Ulhasnagar', 'Jammu', 'Sangli-Miraj & Kupwad', 'Mangalore', 'Erode', 'Belgaum',
    'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala'
  ];
  const [activities, setActivities] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    startDate: '',
    endDate: ''
  });
  const [filteredActivities, setFilteredActivities] = useState([]);

  const getUserDestinations = useCallback(() => {
    // Mock user destinations based on current user
    // In a real app, this would fetch from the user's actual bookings
    if (user?.name === 'Ritesh Roy') {
      return ['Gaya', 'Bihar'];
    } else if (user?.name === 'Meghana Kumari') {
      return ['Andaman', 'Havelock Island'];
    } else if (user?.name === 'Sanjana Sarma') {
      return ['Delhi', 'Shillong'];
    }
    return [];
  }, [user]);

  const filterActivities = useCallback(() => {
    let filtered = [...activities];
    
    console.log('🔍 Starting filter with:', {
      totalActivities: activities.length,
      searchFilters: searchFilters,
      sampleActivity: activities[0] ? { id: activities[0].id, title: activities[0].title, city: activities[0].city, date: activities[0].date } : 'none'
    });

    // Filter by city
    if (searchFilters.city && searchFilters.city.trim() !== '') {
      filtered = filtered.filter(activity => {
        const cityMatch = activity.city?.toLowerCase().includes(searchFilters.city.toLowerCase());
        const stateMatch = activity.state?.toLowerCase().includes(searchFilters.city.toLowerCase());
        const match = cityMatch || stateMatch;
        console.log(`🏙️ Activity "${activity.title}" in ${activity.city}: ${match ? 'MATCH' : 'NO MATCH'}`);
        return match;
      });
      console.log(`📍 After city filter (${searchFilters.city}): ${filtered.length} activities`);
    }

    // Filter by date range
    if (searchFilters.startDate || searchFilters.endDate) {
      console.log(`📅 Date filter inputs:`, {
        startDate: searchFilters.startDate,
        endDate: searchFilters.endDate,
        startDateType: typeof searchFilters.startDate,
        endDateType: typeof searchFilters.endDate
      });
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date);
        const startDate = searchFilters.startDate ? new Date(searchFilters.startDate) : null;
        const endDate = searchFilters.endDate ? new Date(searchFilters.endDate) : null;

        console.log(`🔍 Date comparison for "${activity.title}":`, {
          activityDate: activity.date,
          activityDateParsed: activityDate.toISOString(),
          startDateInput: searchFilters.startDate,
          startDateParsed: startDate ? startDate.toISOString() : null,
          endDateInput: searchFilters.endDate,
          endDateParsed: endDate ? endDate.toISOString() : null
        });

        let withinRange = true;
        if (startDate && endDate) {
          withinRange = activityDate >= startDate && activityDate <= endDate;
          console.log(`📅 Range check: ${activityDate.toISOString()} >= ${startDate.toISOString()} && <= ${endDate.toISOString()} = ${withinRange}`);
        } else if (startDate) {
          withinRange = activityDate >= startDate;
          console.log(`📅 Start check: ${activityDate.toISOString()} >= ${startDate.toISOString()} = ${withinRange}`);
        } else if (endDate) {
          withinRange = activityDate <= endDate;
          console.log(`📅 End check: ${activityDate.toISOString()} <= ${endDate.toISOString()} = ${withinRange}`);
        }

        console.log(`📅 Activity "${activity.title}" (${activity.date}): ${withinRange ? 'WITHIN RANGE' : 'OUTSIDE RANGE'}`);
        return withinRange;
      });
      console.log(`📅 After date filter: ${filtered.length} activities`);
    }

    // If no filters applied and user is logged in, prioritize based on user's travel destinations
    if (!searchFilters.city && !searchFilters.startDate && !searchFilters.endDate && user?.id) {
      // Get user's travel destinations (mocked for demo - in real app would fetch from API)
      const userDestinations = getUserDestinations();
      
      if (userDestinations.length > 0) {
        // Sort activities: user's destinations first, then others
        filtered = filtered.sort((a, b) => {
          const aInDestinations = userDestinations.some(dest => 
            a.city?.toLowerCase().includes(dest.toLowerCase()) || 
            a.state?.toLowerCase().includes(dest.toLowerCase())
          );
          const bInDestinations = userDestinations.some(dest => 
            b.city?.toLowerCase().includes(dest.toLowerCase()) || 
            b.state?.toLowerCase().includes(dest.toLowerCase())
          );
          
          if (aInDestinations && !bInDestinations) return -1;
          if (!aInDestinations && bInDestinations) return 1;
          return 0;
        });
      }
    }

    console.log('✅ Final filtered activities:', filtered.length, filtered.map(a => ({ id: a.id, title: a.title, city: a.city, date: a.date })));
    setFilteredActivities(filtered);
  }, [activities, searchFilters, user, getUserDestinations]);

  const fetchActivities = useCallback(async () => {
    try {
      // Add userId to exclude user's own activities from Hand Picked Destinations
      const params = new URLSearchParams();
      if (user?.id) {
        params.append('userId', user.id);
      }
      
      const url = `/api/activities${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]); // Refetch when user changes

  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  // Also filter when search filters change
  useEffect(() => {
    filterActivities();
  }, [searchFilters, filterActivities]);

  const handleSearch = () => {
    console.log('🔍 Search button clicked!');
    console.log('🔍 Current search filters:', searchFilters);
    filterActivities();
  };





  const navigationTabs = [
    { label: 'Home', active: true },
    { label: 'Where2Go', active: false },
  ];

  const navItems = [
    { icon: Flight, label: 'Flights' },
    { icon: Hotel, label: 'Hotels' },
    { icon: Home, label: 'Homestay' },
    { icon: Train, label: 'Trains' },
    { icon: DirectionsCar, label: 'Cars' },
    { icon: LocalTaxi, label: 'Cabs' },
    { icon: TwoWheeler, label: 'Bus' },
    { icon: DirectionsBus, label: 'Ferry' },
    { icon: Hiking, label: 'Activities', onClick: () => navigate('/dashboard') },
  ];

  const actionCards = [
    {
      title: 'Be a Cause',
      description: 'Curated for changemakers, leaders, and visionaries.',
      action: 'Organise Now',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      path: '/create-activity',
      color: '#008CFF'
    },
    {
      title: 'Join a Cause',
      description: 'Explore by Luxury brands, themes and top pics',
      action: 'Explore Activities',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
      path: '/dashboard',
      color: '#4CAF50'
    },
    {
      title: 'Leaderboard',
      description: 'Explore by Luxury brands, themes and top pics',
      action: 'View Rankings',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      path: '/leaderboard',
      color: '#FF9800'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
        backgroundAttachment: 'fixed',
        pb: 6
      }}
    >
      {/* Navigation Header */}
      <Container maxWidth="xl" sx={{ pt: 3, px: { xs: 2, md: 4 } }}>
        {/* Top Header with breadcrumb navigation */}
        <Paper
          sx={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50px',
            p: 1,
            mb: 3,
            width: 'fit-content',
            mx: 'auto',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {navigationTabs.map((tab, index) => (
              <Box
                key={index}
                onClick={() => {
                  if (tab.label === 'Where2Go') {
                    navigate('/dashboard');
                  }
                }}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '25px',
                  background: tab.active ? 'linear-gradient(135deg, rgba(229, 62, 62, 0.1) 0%, rgba(213, 63, 140, 0.15) 100%)' : 'transparent',
                  fontFamily: 'DM Sans',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: tab.active ? '#e53e3e' : '#4a5568',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: tab.active ? 'linear-gradient(135deg, rgba(229, 62, 62, 0.15) 0%, rgba(213, 63, 140, 0.2) 100%)' : 'rgba(229, 62, 62, 0.05)'
                  }
                }}
              >
                {tab.label}
              </Box>
            ))}
            <ChevronRight sx={{ fontSize: 16 }} />
          </Box>
        </Paper>

        {/* Main Hero Section */}
        <Paper
          id="cause-quest-section"
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '500px',
            mb: 6,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Background Image with Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&h=600&fit=crop) center/cover',
              opacity: 0.15,
              borderRadius: '20px'
            }}
          />
          
          {/* Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(229, 62, 62, 0.05) 0%, rgba(213, 63, 140, 0.1) 100%)',
              borderRadius: '20px'
            }}
          />

          {/* Content */}
          <Box sx={{ position: 'relative', p: { xs: 3, md: 6 } }}>
            <Grid container spacing={4} alignItems="center">
              {/* Left Content */}
              <Grid item xs={12} md={6}>
                <Typography
                  sx={{
                    fontFamily: 'DM Sans',
                    fontWeight: 400,
                    fontSize: { xs: '18px', md: '24px' },
                    color: '#4a5568',
                    mb: 1,
                    letterSpacing: '0px'
                  }}
                >
                  Introducing
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    component="img"
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='mmt-gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e53e3e'/%3E%3Cstop offset='100%25' style='stop-color:%23d53f8c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='120' height='120' rx='24' fill='url(%23mmt-gradient)'/%3E%3Cpath d='M25 35 Q25 25 35 25 L85 25 Q95 25 95 35 L95 60 Q95 70 85 70 L35 70 Q25 70 25 60 Z' fill='white' opacity='0.2'/%3E%3Ctext x='60' y='70' font-family='Arial Black' font-size='36' font-weight='900' text-anchor='middle' fill='white'%3Emy%3C/text%3E%3C/svg%3E"
                    alt="MakeMyTrip Logo"
                    sx={{ 
                      width: { xs: '48px', md: '60px' }, 
                      height: { xs: '48px', md: '60px' },
                      borderRadius: '12px',
                      boxShadow: '0 8px 25px rgba(229, 62, 62, 0.3)'
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: 'DM Sans',
                      fontWeight: 800,
                      fontSize: { xs: '36px', md: '48px', lg: '56px' },
                      lineHeight: { xs: '40px', md: '52px', lg: '60px' },
                      color: '#1a202c',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    Cause Quest
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontFamily: 'DM Sans',
                    fontWeight: 400,
                    fontSize: { xs: '15px', md: '16px' },
                    lineHeight: { xs: '22px', md: '24px' },
                    color: '#6b7280',
                    mb: 4,
                    maxWidth: '420px'
                  }}
                >
                  Be a cause. Join a cause. Travel with purpose,<br />
                  leave a mark with MMT
                </Typography>

                <Button
                  sx={{
                    background: 'linear-gradient(135deg, #e53e3e 0%, #d53f8c 100%)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontFamily: 'DM Sans',
                    fontWeight: 600,
                    fontSize: '14px',
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(229, 62, 62, 0.3)',
                    minWidth: '120px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dc2626 0%, #c2185b 100%)',
                      boxShadow: '0 12px 35px rgba(229, 62, 62, 0.4)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  Learn More
                </Button>
              </Grid>

              {/* Right Action Cards */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2} justifyContent="center">
                  {actionCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        sx={{
                          height: '340px',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                          }
                        }}
                        onClick={() => navigate(card.path)}
                      >
                        <CardMedia
                          component="img"
                          image={card.image}
                          alt={card.title}
                          sx={{ 
                            flex: 1,
                            objectFit: 'cover',
                            filter: 'brightness(0.9)'
                          }}
                        />
                        <CardContent
                          sx={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                            minHeight: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            p: 2.5
                          }}
                        >
                          <Typography
                            sx={{
                              fontFamily: 'DM Sans',
                              fontWeight: 700,
                              fontSize: '16px',
                              color: '#1a202c',
                              mb: 1,
                              lineHeight: '20px'
                            }}
                          >
                            {card.title}
                          </Typography>
                          
                          <Typography
                            sx={{
                              fontFamily: 'DM Sans',
                              fontWeight: 400,
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#4a5568',
                              mb: 1.5
                            }}
                          >
                            {card.description}
                          </Typography>

                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              background: card.color,
                              color: '#ffffff',
                              fontFamily: 'DM Sans',
                              fontWeight: 600,
                              fontSize: '14px',
                              borderRadius: '8px',
                              textTransform: 'none',
                              py: 1.2,
                              px: 4,
                              width: '100%',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              '&:hover': {
                                background: card.color,
                                opacity: 0.95,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {card.action}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Navigation Icons Section */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
            borderRadius: '20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            p: 4,
            mb: 6,
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Grid container spacing={2} justifyContent="center">
            {navItems.map((item, index) => (
              <Grid item key={index}>
                <Box
                  onClick={item.onClick}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    p: 2,
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(229, 62, 62, 0.05)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(229, 62, 62, 0.15)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(229, 62, 62, 0.1) 0%, rgba(213, 63, 140, 0.15) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <item.icon
                      sx={{
                        fontSize: 32,
                        color: '#e53e3e'
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: 'DM Sans',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#4a5568',
                      textAlign: 'center',
                      lineHeight: '16px'
                    }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Activity Search Section */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '24px',
            p: 5,
            mb: 6,
            boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          <Typography
            sx={{
              fontFamily: 'DM Sans',
              fontWeight: 800,
              fontSize: '32px',
              lineHeight: '40px',
              color: '#1a202c',
              mb: 4,
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}
          >
            Find Activities Near You
          </Typography>
          
          <Grid container spacing={4} alignItems="end" justifyContent="center">
            <Grid item xs={12} md={3}>
              <FormControl 
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e53e3e'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e53e3e'
                    }
                  }
                }}
              >
                <InputLabel 
                  sx={{ 
                    color: '#4a5568',
                    '&.Mui-focused': { color: '#e53e3e' }
                  }}
                >
                  Select City
                </InputLabel>
                <Select
                  value={searchFilters.city}
                  onChange={(e) => setSearchFilters(prev => ({...prev, city: e.target.value}))}
                  label="Select City"
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {indianStates.map(city => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={searchFilters.startDate}
                onChange={(e) => setSearchFilters(prev => ({...prev, startDate: e.target.value}))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e53e3e'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e53e3e'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#4a5568',
                    '&.Mui-focused': { color: '#e53e3e' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={searchFilters.endDate}
                onChange={(e) => setSearchFilters(prev => ({...prev, endDate: e.target.value}))}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e53e3e'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e53e3e'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: '#4a5568',
                    '&.Mui-focused': { color: '#e53e3e' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{
                  height: '56px',
                  borderRadius: '16px',
                  fontWeight: 600,
                  fontSize: '16px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #e53e3e 0%, #d53f8c 100%)',
                  boxShadow: '0 8px 20px rgba(229, 62, 62, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626 0%, #c2185b 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(229, 62, 62, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Featured Activity Section */}
        {activities.length > 0 && (
          <Paper
            sx={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
              borderRadius: '24px',
              p: 5,
              mb: 6,
              boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          >
            <Typography
              sx={{
                fontFamily: 'DM Sans',
                fontWeight: 800,
                fontSize: { xs: '28px', md: '36px' },
                lineHeight: { xs: '36px', md: '44px' },
                color: '#1a202c',
                mb: 4,
                textAlign: 'center',
                letterSpacing: '-0.5px'
              }}
            >
              {searchFilters.city || searchFilters.startDate || searchFilters.endDate ? 
                `Suggested Activities${searchFilters.city ? ` in ${searchFilters.city}` : ''}` : 
                'Hand Picked Destinations for You'
              }
            </Typography>

            {(searchFilters.city || searchFilters.startDate || searchFilters.endDate) && filteredActivities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" mb={2}>
                  No activities found matching your criteria
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search filters or explore all activities
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSearchFilters({ city: '', startDate: '', endDate: '' })}
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2.5} justifyContent="center">
                {(searchFilters.city || searchFilters.startDate || searchFilters.endDate ? 
                  filteredActivities : activities).slice(0, 4).map((activity, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
                  <Card
                    sx={{
                      height: '220px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                    onClick={() => navigate(`/activity/${activity.id}`)}
                  >
                    {/* Activity Image */}
                    <CardMedia
                      component="img"
                      height="150"
                      image={activity.image?.startsWith('/uploads') ? 
                        `http://localhost:5000${activity.image}` : 
                        activity.image || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400'
                      }
                      alt={activity.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    {/* Activity Info */}
                    <CardContent
                      sx={{
                        height: '70px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: 'center',
                        p: 1.5
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: 'DM Sans',
                          fontWeight: 700,
                          fontSize: '12px',
                          color: '#000000',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {activity.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'DM Sans',
                          fontWeight: 400,
                          fontSize: '10px',
                          color: '#666666'
                        }}
                      >
                        {activity.location?.city}, {activity.location?.state}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              </Grid>
            )}

            {/* Navigation Arrows */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
                mt: 3
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 29,
                  background: '#FFFFFF',
                  borderRadius: '50px 0px 0px 50px',
                  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft sx={{ color: '#0D99FF' }} />
              </Box>
              <Box
                sx={{
                  width: 34,
                  height: 29,
                  background: '#FFFFFF',
                  borderRadius: '0px 50px 50px 0px',
                  boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight sx={{ color: '#0D99FF' }} />
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;