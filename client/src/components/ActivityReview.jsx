import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Rating,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import {
  Star,
  ReviewsOutlined,
  EmojiEvents,
  ThumbUp
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ActivityReview = ({ open, onClose, activity, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userStatus, setUserStatus] = useState(null);
  const [step, setStep] = useState('review'); // 'review', 'success'

  useEffect(() => {
    if (open && activity?.id && user?.id) {
      fetchReviews();
      fetchUserStatus();
    }
  }, [open, activity?.id, user?.id]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/activities/${activity.id}/reviews`);
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const response = await fetch(`/api/activities/${activity.id}/user-status/${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
    }
  };

  const submitReview = async () => {
    if (!rating || !user?.id || !activity?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id,
          rating,
          review: review.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('success');
        toast.success('Thank you for your review! Points have been awarded.');
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        // Refresh reviews to show the new one
        setTimeout(fetchReviews, 500);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred while submitting review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setStep('review');
    onClose();
  };

  const canSubmitReview = () => {
    return userStatus && 
           userStatus.activity_completed && 
           !userStatus.has_reviewed;
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <ReviewsOutlined color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Activity Reviews & Ratings
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {activity?.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {step === 'review' && (
          <Box>
            {/* Activity Rating Summary */}
            <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box textAlign="center">
                        <Typography variant="h3" fontWeight={700} color="primary">
                          {averageRating.toFixed(1)}
                        </Typography>
                        <Rating value={averageRating} readOnly precision={0.1} />
                        <Typography variant="body2" color="text.secondary">
                          {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Activity Status
                      </Typography>
                      {userStatus?.activity_completed ? (
                        <Chip 
                          label="Completed" 
                          color="success" 
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      ) : userStatus?.activity_started ? (
                        <Chip 
                          label="In Progress" 
                          color="warning" 
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        <Chip 
                          label="Not Started" 
                          color="default" 
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Submit Review Section */}
            {canSubmitReview() ? (
              <Card sx={{ mb: 3, border: '2px solid', borderColor: 'success.main' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Star color="warning" />
                    <Typography variant="h6" fontWeight={600}>
                      Rate This Activity
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Your feedback helps other travelers discover great activities and helps organizers improve.
                  </Typography>

                  <Box mb={3}>
                    <Typography variant="subtitle2" mb={1}>
                      How was your experience?
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Rating
                        value={rating}
                        onChange={(event, newValue) => setRating(newValue)}
                        size="large"
                        precision={1}
                      />
                      {rating > 0 && (
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          {getRatingText(rating)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Share your experience (optional)"
                    placeholder="What did you like about this activity? Any suggestions for improvement?"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />

                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Earn Points:</strong> Submit your review to earn {activity?.pointsAwarded?.participant || 50} points!
                    </Typography>
                  </Alert>

                  <Button
                    variant="contained"
                    onClick={submitReview}
                    disabled={!rating || loading}
                    startIcon={<ThumbUp />}
                    sx={{ borderRadius: 3 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Review & Earn Points'}
                  </Button>
                </CardContent>
              </Card>
            ) : userStatus?.has_reviewed ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Thanks for your review! You've already rated this activity.
                </Typography>
              </Alert>
            ) : !userStatus?.activity_completed ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  You can submit a review once the activity is completed by the organizer.
                </Typography>
              </Alert>
            ) : null}

            {/* Reviews List */}
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Reviews
              </Typography>
              
              {reviews.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="text.secondary">
                    No reviews yet. Be the first to share your experience!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {reviews.slice(0, 5).map((reviewItem, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display="flex" gap={2}>
                          <Avatar 
                            src={reviewItem.user_avatar} 
                            sx={{ width: 40, height: 40 }}
                          >
                            {reviewItem.user_name?.charAt(0)}
                          </Avatar>
                          <Box flex={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {reviewItem.user_name}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Rating value={reviewItem.rating} readOnly size="small" />
                                  <Typography variant="body2" color="text.secondary">
                                    {formatDate(reviewItem.created_at)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            {reviewItem.review && (
                              <Typography variant="body2" color="text.secondary">
                                {reviewItem.review}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {reviews.length > 5 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                      Showing 5 of {reviews.length} reviews
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {step === 'success' && (
          <Box textAlign="center" py={3}>
            <EmojiEvents sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} mb={2}>
              Review Submitted Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Thank you for sharing your experience. Your review helps other travelers and supports the community.
            </Typography>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Points Earned:</strong> {activity?.pointsAwarded?.participant || 50} points have been added to your account!
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} size="large">
          {step === 'success' ? 'Done' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityReview;
