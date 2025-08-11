import React, { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  People,
  Star,
  EmojiEvents,
  Share,
  Bookmark,
  Check,
  Phone,
  Email,

} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addPoints } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  const fetchActivityDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities/${id}`);
      const data = await response.json();
      setActivity(data.activity);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchActivityDetails();
  }, [fetchActivityDetails]);

  const handleJoinActivity = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoinLoading(true);
    try {
      const response = await fetch(`/api/activities/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          userId: user.id,
          userName: user.name
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        if (data.pointsEarned) {
          addPoints(data.pointsEarned, 'Joined activity');
        }
        setJoinDialogOpen(false);
        fetchActivityDetails(); // Refresh activity data
      } else {
        toast.error(data.message || 'Failed to join activity');
      }
    } catch (error) {
      toast.error('An error occurred while joining the activity');
    } finally {
      setJoinLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getAvailableSpots = () => {
    if (!activity) return 0;
    const maxSpots = activity.capacity?.max || activity.max_participants || 10;
    const registered = activity.registeredParticipants?.length || activity.current_participants || 0;
    return maxSpots - registered;
  };

  const isUserRegistered = () => {
    if (!user || !activity || !activity.registeredParticipants) return false;
    return activity.registeredParticipants.some(
      participant => participant.user.id === user.id
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" textAlign="center">
          Loading activity details...
        </Typography>
      </Container>
    );
  }

  if (!activity) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" textAlign="center" color="error">
          Activity not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Hero Image */}
          <CardMedia
            component="img"
            height="400"
            image={activity.image}
            alt={activity.title}
            sx={{ borderRadius: 2, mb: 3 }}
          />

          {/* Title and Basic Info */}
          <Box mb={3}>
            <Typography variant="h3" component="h1" fontWeight="bold" mb={2}>
              {activity.title}
            </Typography>
            
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              <Chip label={activity.category} color="primary" />
              <Chip
                icon={<Star />}
                label={`${activity.rating?.average?.toFixed(1) || '4.0'} (${activity.rating?.count || 0} reviews)`}
                variant="outlined"
              />
              <Chip
                icon={<EmojiEvents />}
                label={`+${activity.pointsAwarded?.participant || 50} points`}
                color="secondary"
              />
            </Box>

            <Box display="flex" gap={3} mb={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOn color="action" />
                <Typography color="text.secondary">
                  {activity.location.address}, {activity.location.city}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime color="action" />
                <Typography color="text.secondary">
                  {formatDate(activity.dateTime.start)}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <People color="action" />
                <Typography color="text.secondary">
                  {getAvailableSpots()} spots available
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                About This Activity
              </Typography>
              <Typography variant="body1" paragraph>
                {activity.description}
              </Typography>
              
              {activity.requirements && (
                <>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    Requirements
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {activity.requirements.guidelines}
                  </Typography>
                  
                  {activity.requirements?.items && activity.requirements.items.length > 0 && (
                    <>
                      <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        What to bring:
                      </Typography>
                      <List dense>
                        {activity.requirements.items.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={`• ${item}`} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Impact Goals */}
          {activity.impact && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                  Expected Impact
                </Typography>
                <Typography variant="body1" paragraph>
                  {activity.impact.goal}
                </Typography>
                
                {activity.impact.metrics && activity.impact.metrics.map((metric, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{metric.name}</Typography>
                      <Typography variant="body2">
                        {metric.achieved}/{metric.target} {metric.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.achieved / metric.target) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Reviews ({activity.reviews?.length || 0})
              </Typography>
              
              {!activity.reviews || activity.reviews.length === 0 ? (
                <Typography color="text.secondary">
                  No reviews yet. Be the first to review this activity!
                </Typography>
              ) : (
                <List>
                  {(activity.reviews || []).map((review, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>{review.user.name.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography fontWeight="bold">{review.user.name}</Typography>
                              <Rating value={review.rating} readOnly size="small" />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.primary" paragraph>
                                {review.comment}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(review.createdAt)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < (activity.reviews?.length || 0) - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Join Activity Card */}
          <Card sx={{ mb: 3, position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Join This Activity
              </Typography>
              
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Available Spots
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {getAvailableSpots()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {activity.capacity?.max || activity.max_participants || 10}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(activity.registeredParticipants?.length || activity.current_participants || 0) / (activity.capacity?.max || activity.max_participants || 1) * 100}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Points You'll Earn
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmojiEvents sx={{ color: '#ffc107' }} />
                  <Typography variant="h5" fontWeight="bold">
                    +{activity.pointsAwarded?.participant || 50}
                  </Typography>
                </Box>
              </Box>

              {activity.organizer_id === user?.id ? (
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  disabled
                  sx={{ mb: 2 }}
                >
                  You are the organizer
                </Button>
              ) : isUserRegistered() ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<Check />}
                  disabled
                  sx={{ mb: 2 }}
                >
                  Already Registered
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={getAvailableSpots() === 0 || !user}
                  onClick={() => setJoinDialogOpen(true)}
                  sx={{ mb: 2 }}
                >
                  {!user ? 'Login to Join' : getAvailableSpots() === 0 ? 'Activity Full' : 'Join Activity'}
                </Button>
              )}

              <Box display="flex" gap={1}>
                <Button variant="outlined" fullWidth startIcon={<Share />}>
                  Share
                </Button>
                <Button variant="outlined" fullWidth startIcon={<Bookmark />}>
                  Save
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Organizer
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 50, height: 50 }}>
                  {activity.organizer.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">{activity.organizer.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.organizationType}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={1}>
                <Button variant="outlined" size="small" startIcon={<Phone />}>
                  Contact
                </Button>
                <Button variant="outlined" size="small" startIcon={<Email />}>
                  Message
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Verification Badge */}
          {activity.verification?.status === 'approved' && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Check sx={{ color: 'success.main' }} />
                  <Typography fontWeight="bold" color="success.main">
                    TEM Verified
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  This activity has been verified by our Trusted Experience Moderators.
                  Score: {activity.verification.temScore}/100
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Join Activity Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join Activity</DialogTitle>
        <DialogContent>
          <Typography variant="body1" mb={3}>
            You're about to join "{activity.title}". Please let the organizer know why you're interested in participating.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message to Organizer (Optional)"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            placeholder="Tell the organizer about your motivation, experience, or any questions you have..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleJoinActivity}
            disabled={joinLoading}
          >
            {joinLoading ? 'Joining...' : 'Confirm Join'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ActivityDetails;
