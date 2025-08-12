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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  ContentCopy,
  WhatsApp,
  Facebook,
  Twitter,
  LinkedIn,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState('');

  const effectiveUserId = id || currentUser?.id;

  useEffect(() => {
    if (effectiveUserId) {
      fetchUserData();
    }
  }, [effectiveUserId]);

  const fetchUserData = async () => {
    try {
      const [userRes, statsRes, historyRes, activitiesRes] = await Promise.all([
        fetch(`/api/users/${effectiveUserId}`),
        fetch(`/api/users/${effectiveUserId}/stats`),
        fetch(`/api/users/${effectiveUserId}/points-history`),
        fetch(`/api/users/${effectiveUserId}/bookings`)
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const historyData = await historyRes.json();
      const activitiesData = await activitiesRes.json();

      setUser(userData.user);
      setUserStats(statsData.stats);
      setPointsHistory(historyData.history || []);
      
      // Combine joined and organized activities
      const allActivities = [
        ...(activitiesData.bookings || []).map(activity => ({ ...activity, type: 'joined' })),
        ...(activitiesData.userActivities || []).map(activity => ({ ...activity, type: 'organized' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setUserActivities(allActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const isOwnProfile = !id || (currentUser && user && currentUser.id === user.id);

  // Generate badges based on real achievements
  const generateBadges = () => {
    if (!userStats) return [];
    
    const badges = [];
    
    // Points-based badges
    if (userStats.pointsEarned >= 100) {
      badges.push({
        name: 'Rising Star',
        description: `Earned ${userStats.pointsEarned} points through activities`,
        icon: '⭐',
        category: 'points',
        achievement: `${userStats.pointsEarned} points earned`
      });
    }
    
    if (userStats.pointsEarned >= 500) {
      badges.push({
        name: 'Impact Champion',
        description: `Accumulated ${userStats.pointsEarned} points making a difference`,
        icon: '🏆',
        category: 'points',
        achievement: `${userStats.pointsEarned} points earned`
      });
    }

    // Activity-based badges
    if (userStats.totalActivities >= 3) {
      badges.push({
        name: 'Active Contributor',
        description: `Participated in ${userStats.totalActivities} activities`,
        icon: '🤝',
        category: 'participation',
        achievement: `${userStats.totalActivities} activities joined`
      });
    }

    if (userStats.causesSupported >= 5) {
      badges.push({
        name: 'Community Leader',
        description: `Supported ${userStats.causesSupported} different causes`,
        icon: '👥',
        category: 'leadership',
        achievement: `${userStats.causesSupported} causes supported`
      });
    }

    // Level-based badges
    if (userStats.level >= 2) {
      badges.push({
        name: 'Experienced Traveler',
        description: `Reached level ${userStats.level} in community engagement`,
        icon: '🗺️',
        category: 'level',
        achievement: `Level ${userStats.level} achieved`
      });
    }

    return badges;
  };

  const handleShare = (content, type = 'general') => {
    let shareText = '';
    
    switch (type) {
      case 'badge':
        shareText = `🏆 I just earned the "${content.name}" badge on MakeMyTriip! ${content.description} #MakeMyTrip #CommunityImpact`;
        break;
      case 'activity':
        const role = content.type === 'organized' ? 'organizing' : 'joining';
        const points = content.type === 'organized' ? content.points_organizer : content.points_participant;
        shareText = `Hey, I earned ${points} points while ${role} "${content.title}" activity on MakeMyTrip! 🌟 #MakeMyTrip #CommunityService`;
        break;
      case 'points':
        shareText = `🎉 I've earned ${userStats.pointsEarned} points making a positive impact through MakeMyTrip activities! Join me in making a difference. #MakeMyTrip #ImpactTravel`;
        break;
      default:
        shareText = content;
    }
    
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
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      setShareDialogOpen(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const badges = generateBadges();

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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Activities
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={() => handleShare(`Check out my ${userActivities.length} activities on MakeMyTrip!`, 'general')}
                  size="small"
                >
                  Share Activities
                </Button>
              </Box>
              <List>
                {userActivities.slice(0, 10).map((activity, index) => (
                  <React.Fragment key={`${activity.id}-${activity.type}`}>
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
                            <Box display="flex" gap={1} alignItems="center">
                              <Chip
                                label={activity.activity_completed ? 'Completed' : 'Active'}
                                size="small"
                                color={activity.activity_completed ? 'success' : 'primary'}
                              />
                              {activity.activity_completed && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleShare(activity, 'activity')}
                                  title="Share this achievement"
                                >
                                  <Share fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {activity.type === 'organized' ? 'Organized' : 'Participated'} • {formatDate(activity.date)}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              Points: {activity.type === 'organized' ? activity.points_organizer : activity.points_participant}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < Math.min(userActivities.length - 1, 9) && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              {userActivities.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No activities yet. Start exploring and join some activities!
                </Typography>
              )}
            </CardContent>
          </Card>
        );

      case 1: // Badges
        return (
          <Grid container spacing={3}>
            {badges.map((badge, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                        {badge.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {badge.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {badge.description}
                    </Typography>
                    <Chip
                      label={badge.achievement}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Box display="flex" justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleShare(badge, 'badge')}
                        title="Share this badge"
                        color="primary"
                      >
                        <Share fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {badges.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No badges earned yet. Complete more activities to unlock achievements!
                </Typography>
              </Grid>
            )}
          </Grid>
        );

      case 2: // Impact & Points History
        return (
          <Grid container spacing={3}>
            {/* Impact Statistics */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Impact Statistics
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleShare('', 'points')}
                      title="Share your impact"
                      color="primary"
                    >
                      <Share fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center" mb={2}>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {userStats?.totalActivities || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Activities Joined
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center" mb={2}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {userStats?.causesSupported || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Causes Supported
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box textAlign="center" mb={2}>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {userStats?.pointsEarned || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Points Earned
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Impact Level (Level {userStats?.level || 1})
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(((userStats?.pointsEarned || 0) % 1000) / 10, 100)}
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {(userStats?.pointsEarned || 0) % 1000}/1000 points to next level
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Points History */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    Points History
                  </Typography>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {pointsHistory.slice(0, 15).map((entry, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: entry.role === 'organizer' ? 'primary.main' : 'secondary.main',
                              width: 32,
                              height: 32,
                              fontSize: '0.8rem'
                            }}>
                              {entry.action === 'created' ? '📝' : entry.role === 'organizer' ? '📋' : '🤝'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight="bold">
                                {entry.activityTitle}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {entry.action === 'created' ? 'Created activity' : 
                                   entry.action === 'organized' ? 'Completed as organizer' : 
                                   'Completed as participant'} • {formatDate(entry.earnedDate)}
                                </Typography>
                                <Chip
                                  label={`+${entry.pointsEarned} points`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < Math.min(pointsHistory.length - 1, 14) && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  {pointsHistory.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                      No points earned yet. Join or organize activities to start earning!
                    </Typography>
                  )}
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
      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: '20px' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={user.avatar}
              sx={{ width: 120, height: 120, fontSize: '2rem' }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Grid>
          
          <Grid item xs>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h4" fontWeight="bold" mb={1}>
                  {user.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {user.email}
                </Typography>
                
                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <Chip
                    icon={<EmojiEvents />}
                    label={`Level ${userStats?.level || 1}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={<Star />}
                    label={`${userStats?.pointsEarned || 0} Points`}
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    label={`${badges.length} Badges`}
                    color="success"
                    variant="outlined"
                  />
                </Box>

                {user.location && (
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {user.location}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Box display="flex" gap={1}>
                {isOwnProfile && (
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => navigate('/settings')}
                  >
                    Settings
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={() => handleShare(`Check out ${user.name}'s amazing community impact on MakeMyTrip! ${userStats?.pointsEarned || 0} points earned through ${userStats?.causesSupported || 0} causes supported! #MakeMyTrip #CommunityImpact`, 'general')}
                >
                  Share Profile
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Activities" />
          <Tab label="Badges" />
          <Tab label="Impact & History" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {renderTabContent()}

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
    </Container>
  );
};

export default UserProfile;
