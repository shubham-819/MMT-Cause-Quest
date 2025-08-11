import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Paper,
  Avatar,
  LinearProgress,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import {
  Flight,
  Hotel,
  DirectionsCar,
  Hiking,
  CalendarToday,
  LocationOn,
  InfoOutlined,
  Security,
  Star,
  RateReview,
  PlayArrow,
  CheckCircle,
  Share,
  ContentCopy,
  WhatsApp,
  Facebook,
  Twitter,
  LinkedIn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import OTPValidation from '../components/OTPValidation';
import ActivityReview from '../components/ActivityReview';

const MyTrips = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [userBookings, setUserBookings] = useState({
    flights: [],
    hotels: [],
    cabs: [],
    activities: []
  });
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [userStats, setUserStats] = useState({
    totalTrips: 0,
    totalActivities: 0,
    pointsEarned: 0,
    causesSupported: 0
  });
  
  // OTP and Review Dialog States
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Share Dialog States
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState('');

  const fetchSuggestedActivities = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      // Use the proper API endpoint for user suggestions
      const response = await fetch(`/api/users/${user.id}/suggestions`);
      const data = await response.json();
      
      if (data.suggestions && data.suggestions.length > 0) {
        const suggestions = data.suggestions.map(activity => ({
          id: activity.id,
          title: activity.title,
          location: `${activity.city}, ${activity.state}`,
          date: activity.date,
          category: activity.category,
          points: activity.pointsAwarded?.participant || 50,
          image: activity.image || '/api/placeholder/400/300',
          reason: `Based on your travel destinations`
        }));

        setSuggestedActivities(suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggested activities:', error);
      // Show relevant activity suggestions for Ritesh's trip to Gaya
      setSuggestedActivities([
        {
          id: 'farming-gaya',
          title: 'Traditional Farming Experience & Local Cuisine Journey',
          location: 'Gaya, Bihar',
          date: '2024-08-29',
          category: 'Culture',
          points: 100,
          image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
          reason: 'Based on your travel to Gaya',
          organizer: 'Deepak Kumar (Local Farmer)',
          description: 'Experience wheat farming, traditional methods, and authentic Bihari cuisine. Daily sessions 10 AM to 1 PM.'
        }
      ]);
    }
  }, [user]);

  const fetchUserActivities = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      // Fetch activities organized by this user using the updated bookings endpoint
      const response = await fetch(`/api/users/${user.id}/bookings`);
      const data = await response.json();
      
      if (data.userActivities && data.userActivities.length > 0) {
        setUserActivities(data.userActivities);
      } else {
        setUserActivities([]);
      }
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setUserActivities([]);
    }
  }, [user]);

  

  const fetchUserStats = useCallback(async () => {
    try {
      const userId = user?.id || 1; // Default to demo user
      const response = await fetch(`/api/users/${userId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Ritesh Roy's statistics
      setUserStats({
        totalTrips: 1,
        totalActivities: 0,
        pointsEarned: 150,
        causesSupported: 0
      });
    }
  }, [user]);

  const fetchUserBookings = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      // Fetch user's joined activities
      const joinedResponse = await fetch(`/api/users/${user.id}/joined-activities`);
      const joinedData = await joinedResponse.json();
      
      // For demo purposes, show hardcoded bookings but use real joined activities
      const userBookings = {
        flights: [
          {
            id: 1,
            type: 'flight',
            from: 'Bangalore (BLR)',
            to: 'Gaya (GAY)',
            date: '2024-08-28',
            airline: 'IndiGo',
            flightNumber: '6E-237',
            status: 'confirmed',
            amount: 8500
          },
          {
            id: 2,
            type: 'flight',
            from: 'Gaya (GAY)',
            to: 'Bangalore (BLR)', 
            date: '2024-09-01',
            airline: 'Air India',
            flightNumber: 'AI-865',
            status: 'confirmed',
            amount: 9200
          }
        ],
        hotels: [
          {
            id: 1,
            type: 'hotel',
            name: 'Gaya Heritage Hotel',
            location: 'Gaya, Bihar',
            checkIn: '2024-08-28',
            checkOut: '2024-09-01',
            guests: 3,
            status: 'confirmed',
            amount: 12000
          }
        ],
        cabs: [],
        activities: joinedData.activities || []
      };
      
      setUserBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setUserBookings({
        flights: [],
        hotels: [],
        cabs: [],
        activities: []
      });
    }
  }, [user]);

  useEffect(() => {
    fetchUserBookings();
    fetchSuggestedActivities();
    fetchUserActivities();
    fetchUserStats();
  }, [fetchUserBookings, fetchSuggestedActivities, fetchUserActivities, fetchUserStats]);

  // Handle OTP validation for organizers
  const handleOTPValidation = (activity) => {
    setSelectedActivity(activity);
    setOtpDialogOpen(true);
  };

  // Handle activity review for participants
  const handleActivityReview = (activity) => {
    setSelectedActivity(activity);
    setReviewDialogOpen(true);
  };

  // Complete activity (for organizers)
  const completeActivity = async (activityId) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh activities to show updated status
        fetchUserActivities();
        fetchUserBookings();
        fetchUserStats();
      } else {
        console.error('Failed to complete activity:', data.error);
      }
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  // Handle activity started (refresh data)
  const handleActivityStarted = () => {
    fetchUserActivities();
    fetchUserBookings();
  };

  // Handle review submitted (refresh data)
  const handleReviewSubmitted = () => {
    fetchUserStats();
    fetchUserBookings();
  };

  // Share functionality
  const handleShare = (activity) => {
    const isOrganizer = user?.id === activity.organizer_id;
    const role = isOrganizer ? 'organizing' : 'joining';
    const points = isOrganizer ? activity.points_organizer : activity.points_participant;
    
    const shareText = `Hey, I earned ${points} points while ${role} "${activity.title}" activity on MakeMyTrip! 🌟 Join me in making a positive impact through travel. #MakeMyTrip #CommunityService #ImpactTravel`;
    
    setShareContent(shareText);
    setShareDialogOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareContent);
      toast.success('Copied to clipboard!');
      setShareDialogOpen(false);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy text');
    }
  };

  const shareToSocial = (platform) => {
    const encodedText = encodeURIComponent(shareContent);
    let url = '';
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodedText}`;
        break;
      default:
        console.warn(`Unknown platform: ${platform}`);
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      setShareDialogOpen(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'primary';
      case 'joined': return 'success';
      case 'upcoming': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'flight': return <Flight />;
      case 'hotel': return <Hotel />;
      case 'cab': return <DirectionsCar />;
      case 'activity': return <Hiking />;
      default: return null;
    }
  };

  const BookingCard = ({ booking }) => (
    <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {getStatusIcon(booking.type)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {booking.name || booking.title || (booking.from && booking.to ? `${booking.from} → ${booking.to}` : 'Activity')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.location || 
               (booking.organizer_name ? `Organized by ${booking.organizer_name}` : '') ||
               `${booking.airline || booking.cabType || ''} ${booking.flightNumber || ''}`}
            </Typography>
          </Box>
          <Chip 
            label={booking.status || 'joined'} 
            color={getStatusColor(booking.status || 'joined')} 
            size="small"
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {booking.date || booking.checkIn || booking.joinedAt}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" textAlign="right">
              {booking.amount && `₹${booking.amount}`}
              {booking.pointsAwarded?.participant && `${booking.pointsAwarded.participant} points earned`}
              {booking.pointsEarned && `${booking.pointsEarned} points earned`}
            </Typography>
          </Grid>
        </Grid>

        {/* Add review button for completed activities */}
        {booking.type === 'activity' && booking.activity_completed && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RateReview />}
              onClick={() => handleActivityReview(booking)}
              sx={{ borderRadius: 2 }}
            >
              Rate & Review Activity
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const SuggestedActivityCard = ({ activity }) => (
    <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
      <Box
        sx={{
          height: 200,
          backgroundImage: `url(${activity.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={1}>
          {activity.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {activity.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {activity.date}
          </Typography>
        </Box>
        <Chip label={activity.reason} size="small" color="primary" variant="outlined" sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="primary" fontWeight={600}>
            {activity.points} points
          </Typography>
          {activity.organizer_id === user?.id ? (
            <Button 
              variant="outlined" 
              size="small"
              disabled
              sx={{ borderRadius: '20px' }}
            >
              Your Activity
            </Button>
          ) : (
            <Button 
              variant="contained" 
              size="small"
              onClick={() => navigate(`/activity/${activity.id}`)}
              sx={{ borderRadius: '20px' }}
            >
              Join Now
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const ActivityCard = ({ activity }) => {
    const isOrganizer = user?.id === activity.organizer_id;
    const [activityRating, setActivityRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    // Fetch activity rating
    useEffect(() => {
      const fetchRating = async () => {
        try {
          const response = await fetch(`/api/activities/${activity.id}/reviews`);
          const data = await response.json();
          if (response.ok) {
            setActivityRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
          }
        } catch (error) {
          console.error('Error fetching rating:', error);
        }
      };

      if (activity.id) {
        fetchRating();
      }
    }, [activity.id]);

    // Determine activity status for display
    const getActivityStatus = () => {
      if (activity.status === 'completed') return { label: 'Completed', color: 'success' };
      if (activity.activity_started) return { label: 'In Progress', color: 'warning' };
      if (activity.activity_completed) return { label: 'Completed', color: 'success' };
      return { label: 'Active', color: 'primary' };
    };

    const status = getActivityStatus();

    return (
      <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <Hiking />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {activity.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.category} • {activity.location}
              </Typography>
              {/* Rating Display */}
              {totalReviews > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {activityRating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                  </Typography>
                </Box>
              )}
            </Box>
            <Chip 
              label={status.label} 
              color={status.color} 
              size="small"
            />
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {activity.date}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" textAlign="right">
                {activity.participants || 0} / {activity.maxParticipants || 0} participants
              </Typography>
            </Grid>
          </Grid>

          {/* OTP Status Section */}
          {!isOrganizer && activity.otp_code && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.50', 
              borderRadius: 2, 
              border: '1px solid', 
              borderColor: 'primary.200',
              mb: 2
            }}>
              <Typography variant="subtitle2" fontWeight={600} color="primary">
                🔐 Your Activity OTP
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary" letterSpacing={1}>
                {activity.otp_code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Show this code to the organizer to confirm your attendance
              </Typography>
            </Box>
          )}

          {/* Points Status Section */}
          <Box sx={{ mb: 2 }}>
            {isOrganizer ? (
              // Organizer Points Status
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {activity.activity_completed ? (
                  <Chip 
                    label={`🎉 ${activity.points_organizer || 100} Points Earned!`}
                    color="success" 
                    size="medium"
                    icon={<CheckCircle />}
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Chip 
                    label={`💰 ${activity.points_organizer || 100} Points Promised`}
                    color="info" 
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            ) : (
              // Participant Points Status
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {activity.points_awarded ? (
                  <Chip 
                    label={`🎉 ${activity.points_participant || 50} Points Earned!`}
                    color="success" 
                    size="medium"
                    icon={<CheckCircle />}
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Chip 
                    label={`💰 ${activity.points_participant || 50} Points Promised`}
                    color="info" 
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {isOrganizer ? (
              // Organizer Actions
              <>
                {/* Generate OTP Button - only show if no OTPs generated yet and has participants */}
                {activity.otp_generation_available && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Security />}
                    onClick={() => handleOTPValidation(activity)}
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    🔐 Generate OTP
                  </Button>
                )}
                
                {/* Validate OTP Button - show if OTPs generated but not all verified */}
                {activity.otp_validation_available && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Security />}
                    onClick={() => handleOTPValidation(activity)}
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    }}
                  >
                    🔐 Enter OTP
                  </Button>
                )}

                {/* Complete Activity Button - show if activity started but not completed */}
                {activity.activity_started && !activity.activity_completed && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<CheckCircle />}
                    onClick={() => completeActivity(activity.id)}
                    color="success"
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    ✅ Complete Activity
                  </Button>
                )}

                {/* No participants message */}
                {!activity.has_participants && (
                  <Chip 
                    label="⏳ Waiting for participants" 
                    color="default" 
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </>
            ) : (
              // Participant Actions
              <>
                {/* Rate & Review Button - only show if activity completed and not reviewed yet */}
                {activity.activity_completed && !activity.has_reviewed && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<RateReview />}
                    onClick={() => handleActivityReview(activity)}
                    color="warning"
                    sx={{ 
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                    }}
                  >
                    ⭐ Rate & Get Points
                  </Button>
                )}

                {/* Status Chips for different states */}
                {!activity.otp_code && !activity.activity_started && (
                  <Chip 
                    label="⏳ Waiting for OTP generation" 
                    color="default" 
                    size="medium"
                    icon={<Security />}
                    sx={{ fontWeight: 600 }}
                  />
                )}
                
                {activity.activity_started && !activity.activity_completed && (
                  <Chip 
                    label="🚀 Activity in Progress" 
                    color="warning" 
                    size="medium"
                    icon={<PlayArrow />}
                    sx={{ fontWeight: 600 }}
                  />
                )}

                {/* Show review completed status */}
                {activity.activity_completed && activity.has_reviewed && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip 
                      label="✅ Review Submitted" 
                      color="success" 
                      size="medium"
                      icon={<CheckCircle />}
                      sx={{ fontWeight: 600 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleShare(activity)}
                      title="Share this achievement"
                      color="primary"
                      sx={{ 
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        width: 32,
                        height: 32
                      }}
                    >
                      <Share fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Show share button for organizer completed activities */}
                {activity.activity_completed && isOrganizer && (
                  <IconButton
                    size="small"
                    onClick={() => handleShare(activity)}
                    title="Share this achievement"
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 32,
                      height: 32
                    }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const tabData = [
    { label: 'All Bookings', value: 0 },
    { label: 'Flights', value: 1 },
    { label: 'Hotels', value: 2 },
    { label: 'Cabs', value: 3 },
    { 
      label: 'Joined Activities', 
      value: 4, 
      tooltip: 'Activities you have participated in or joined from other organizers'
    },
    { 
      label: 'My Organized Activities', 
      value: 5, 
      tooltip: 'Activities you have created and are organizing for others to join'
    }
  ];

  const getAllBookings = () => {
    return [
      ...userBookings.flights,
      ...userBookings.hotels,
      ...userBookings.cabs,
      ...userBookings.activities
    ].sort((a, b) => new Date(b.date || b.checkIn) - new Date(a.date || a.checkIn));
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 0: return getAllBookings();
      case 1: return userBookings.flights;
      case 2: return userBookings.hotels;
      case 3: return userBookings.cabs;
      case 4: return userBookings.activities;
      case 5: return userActivities;
      default: return [];
    }
  };

  // Helper function to categorize activities by completion status
  const categorizeActivities = (activities) => {
    const upcoming = activities.filter(activity => !activity.activity_completed);
    const completed = activities.filter(activity => activity.activity_completed);
    return { upcoming, completed };
  };

  // Helper function to categorize joined activities
  const categorizeJoinedActivities = (activities) => {
    const upcoming = activities.filter(activity => !activity.activity_completed);
    const completed = activities.filter(activity => activity.activity_completed);
    return { upcoming, completed };
  };

  // Component to render activity sections
  const ActivitySection = ({ title, activities, isOrganizedActivities = false }) => {
    if (activities.length === 0) {
      return (
        <Box textAlign="center" py={2}>
          <Typography variant="body2" color="text.secondary">
            No {title.toLowerCase()} activities
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={600} color="primary">
            {title}
          </Typography>
          <Chip 
            label={activities.length} 
            size="small" 
            color={title.includes('Upcoming') ? 'warning' : 'success'}
          />
        </Box>
        {activities.map((activity) => (
          <ActivityCard key={`activity-${activity.id}`} activity={activity} />
        ))}
      </Box>
    );
  };

  // Component to render joined activity sections
  const JoinedActivitySection = ({ title, activities }) => {
    if (activities.length === 0) {
      return (
        <Box textAlign="center" py={2}>
          <Typography variant="body2" color="text.secondary">
            No {title.toLowerCase()} activities
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" fontWeight={600} color="primary">
            {title}
          </Typography>
          <Chip 
            label={activities.length} 
            size="small" 
            color={title.includes('Upcoming') ? 'info' : 'success'}
          />
        </Box>
        {activities.map((activity) => (
          <ActivityCard key={`joined-${activity.id}`} activity={activity} />
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: '20px', background: 'linear-gradient(135deg, #0D99FF 0%, #1768FF 100%)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight={800} color="white" mb={1}>
                {user?.name ? `${user.name}'s Trips & Activities` : 'My Trips & Activities'}
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.9)">
                Track your bookings and discover meaningful activities during your travels
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={700} color="white">
                      {userStats.totalTrips}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Total Trips
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h5" fontWeight={700} color="white">
                      {userStats.pointsEarned}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Points Earned
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Bookings Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: '20px', mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Your Bookings
              </Typography>
              
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                {tabData.map((tab) => (
                  tab.tooltip ? (
                    <Tooltip 
                      key={tab.value} 
                      title={tab.tooltip} 
                      arrow 
                      placement="top"
                    >
                      <Tab 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {tab.label}
                            <InfoOutlined sx={{ fontSize: 14, opacity: 0.7 }} />
                          </Box>
                        } 
                      />
                    </Tooltip>
                  ) : (
                    <Tab key={tab.value} label={tab.label} />
                  )
                ))}
              </Tabs>

              <Box>
                {activeTab === 5 ? (
                  // My Organized Activities tab - segmented view
                  <>
                    {userActivities.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color="text.secondary">
                          No activities organized yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Start by creating your first activity!
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {(() => {
                          const { upcoming, completed } = categorizeActivities(userActivities);
                          return (
                            <>
                              {upcoming.length > 0 && (
                                <>
                                  <ActivitySection 
                                    title="Upcoming Activities" 
                                    activities={upcoming}
                                    isOrganizedActivities={true}
                                  />
                                  {completed.length > 0 && <Divider sx={{ my: 3 }} />}
                                </>
                              )}
                              {completed.length > 0 && (
                                <ActivitySection 
                                  title="Completed Activities" 
                                  activities={completed}
                                  isOrganizedActivities={true}
                                />
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </>
                ) : activeTab === 4 ? (
                  // Joined Activities tab - segmented view
                  <>
                    {userBookings.activities.length === 0 ? (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color="text.secondary">
                          No activities joined yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Browse activities to join your first one!
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {(() => {
                          const { upcoming, completed } = categorizeJoinedActivities(userBookings.activities);
                          return (
                            <>
                              {upcoming.length > 0 && (
                                <>
                                  <JoinedActivitySection 
                                    title="Upcoming Activities" 
                                    activities={upcoming}
                                  />
                                  {completed.length > 0 && <Divider sx={{ my: 3 }} />}
                                </>
                              )}
                              {completed.length > 0 && (
                                <JoinedActivitySection 
                                  title="Completed Activities" 
                                  activities={completed}
                                />
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </>
                ) : (
                  // Other tabs - use BookingCard
                  <>
                    {getTabContent().map((booking) => (
                      <BookingCard key={`${booking.type}-${booking.id}`} booking={booking} />
                    ))}
                    {getTabContent().length === 0 && (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color="text.secondary">
                          No bookings found
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Suggestions Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, borderRadius: '20px', mb: 4 }}>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Suggested Activities
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Based on your travel destinations
              </Typography>
              
              <Grid container spacing={3}>
                {suggestedActivities.map((activity) => (
                  <Grid item xs={12} key={activity.id}>
                    <SuggestedActivityCard activity={activity} />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Stats Section */}
            <Paper sx={{ p: 4, borderRadius: '20px' }}>
              <Typography variant="h6" fontWeight={700} mb={3}>
                Impact Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h4" fontWeight={700} color="primary">
                      {userStats.totalActivities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activities Joined
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center" mb={2}>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {userStats.causesSupported}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Causes Supported
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Your Impact Level
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(userStats.pointsEarned / 1000) * 100} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {userStats.pointsEarned}/1000 points to next level
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* OTP Validation Dialog */}
      <OTPValidation
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        activity={selectedActivity}
        onActivityStarted={handleActivityStarted}
      />

      {/* Activity Review Dialog */}
      <ActivityReview
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        activity={selectedActivity}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Your Achievement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          <Box display="flex" gap={1} mt={2} justifyContent="center">
            <IconButton onClick={() => shareToSocial('whatsapp')} color="success" title="Share on WhatsApp">
              <WhatsApp />
            </IconButton>
            <IconButton onClick={() => shareToSocial('facebook')} color="primary" title="Share on Facebook">
              <Facebook />
            </IconButton>
            <IconButton onClick={() => shareToSocial('twitter')} sx={{ color: '#1DA1F2' }} title="Share on Twitter">
              <Twitter />
            </IconButton>
            <IconButton onClick={() => shareToSocial('linkedin')} sx={{ color: '#0077B5' }} title="Share on LinkedIn">
              <LinkedIn />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={copyToClipboard} startIcon={<ContentCopy />} variant="outlined">
            Copy Text
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTrips;