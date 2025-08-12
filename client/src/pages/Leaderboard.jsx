import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  LocationOn,
  Star,
  Share,
  People,
  Nature,
  School,
  HealthAndSafety,
  Museum,
  ContentCopy,
  WhatsApp,
  Facebook,
  Twitter,
  LinkedIn,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareContent, setShareContent] = useState('');

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedTab]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real leaderboard data from API
      const response = await fetch('/api/gamification/leaderboard');
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboardData(data.leaderboard);
        
        // Find current user in leaderboard and set as userStats
        if (user && data.leaderboard) {
          const currentUser = data.leaderboard.find(u => u.id === user.id);
          if (currentUser) {
            setUserStats(currentUser);
          } else {
            // User not in top leaderboard, create their stats
            const userResponse = await fetch(`/api/users/${user.id}`);
            const userData = await userResponse.json();
            
            if (userResponse.ok) {
              const userRank = {
                id: user.id,
                name: user.name,
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
                points: userData.points || 0,
                level: Math.max(1, Math.floor((userData.points || 0) / 1000) + 1),
                activitiesCompleted: userData.activitiesJoined?.length || 0,
                location: userData.location || 'Location not set',
                badges: ['Newcomer'],
                rank: data.leaderboard.length + 1,
                growth: `+${Math.min(userData.points || 0, 100)} pts this month`
              };
              setUserStats(userRank);
            }
          }
        }
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
      
      // Fallback to empty data on error
      setLeaderboardData([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleShare = (participant) => {
    const content = `🎉 Check out ${participant.name}'s amazing achievements on MMT Cause Quest!\n\n🏆 Rank: #${participant.rank}\n⭐ Points: ${participant.points}\n🎯 Level: ${participant.level}\n🌟 Activities: ${participant.activitiesCompleted}\n📍 ${participant.location}\n\nJoin the movement and make a difference! #MMTCauseQuest #MakeADifference`;
    setShareContent(content);
    setShareDialogOpen(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareContent);
    toast.success('Copied to clipboard!');
    setShareDialogOpen(false);
  };

  const shareToSocial = (platform) => {
    const encodedContent = encodeURIComponent(shareContent);
    let url = '';
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedContent}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedContent}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedContent}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedContent}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
    setShareDialogOpen(false);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Environment': return <Nature />;
      case 'Education': return <School />;
      case 'Health': return <HealthAndSafety />;
      case 'Culture': return <Museum />;
      default: return <People />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return '#ffd700'; // Gold
      case 2: return '#c0c0c0'; // Silver
      case 3: return '#cd7f32'; // Bronze
      default: return '#1976d2'; // Blue
    }
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      return (
        <Avatar
          sx={{
            bgcolor: getRankColor(rank),
            color: 'white',
            fontWeight: 'bold',
            width: 40,
            height: 40
          }}
        >
          {rank}
        </Avatar>
      );
    }
    return (
      <Avatar
        sx={{
          bgcolor: 'grey.300',
          color: 'text.primary',
          fontWeight: 'bold',
          width: 40,
          height: 40
        }}
      >
        {rank}
      </Avatar>
    );
  };

  const tabLabels = ['Global', 'Regional', 'National', 'Monthly'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary" mb={2}>
          🏆 Leaderboard
        </Typography>
        <Typography variant="h6" color="text.secondary" mb={4}>
          Celebrate the changemakers leading the way in social impact
        </Typography>
        
        {/* Tabs for different leaderboard views */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ bgcolor: 'background.paper' }}
          >
            {tabLabels.map((label, index) => (
              <Tab
                key={index}
                label={label}
                sx={{
                  fontWeight: 'bold',
                  py: 2
                }}
              />
            ))}
          </Tabs>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* User's Current Position (if logged in) */}
        {user && userStats && (
          <Grid item xs={12}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                mb: 4
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Your Current Position
                </Typography>
                <Grid container spacing={3} alignItems="center">
                  <Grid item>
                    {getRankIcon(userStats.rank)}
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h5" fontWeight="bold">
                      {userStats.name}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Rank #{userStats.rank} • {userStats.points} points • Level {userStats.level}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold">
                        {userStats.points}
                      </Typography>
                      <Typography variant="caption">Total Points</Typography>
                    </Box>
                  </Grid>
                  <Grid item>
                    <Box textAlign="center">
                      <Typography variant="h4" fontWeight="bold">
                        {userStats.activitiesCompleted}
                      </Typography>
                      <Typography variant="caption">Activities</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Top 3 Podium */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" textAlign="center" mb={4}>
              🎖️ Top Performers
            </Typography>
            <Grid container spacing={3} justifyContent="center">
              {leaderboardData.slice(0, 3).map((leader, index) => (
                <Grid item xs={12} sm={4} key={leader.id}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      background: index === 0 
                        ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                        : index === 1
                        ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)'
                        : 'linear-gradient(135deg, #cd7f32 0%, #deb887 100%)',
                      color: index === 0 ? '#333' : 'text.primary',
                      transform: index === 0 ? 'scale(1.05)' : 'scale(1)',
                      zIndex: index === 0 ? 10 : 1,
                      position: 'relative'
                    }}
                  >
                    <Avatar
                      src={leader.avatar}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        border: '4px solid white'
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold" mb={1}>
                      {leader.name}
                    </Typography>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                      <EmojiEvents sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {leader.points}
                      </Typography>
                    </Box>
                    <Typography variant="body2" mb={2}>
                      Level {leader.level} • {leader.activitiesCompleted} activities
                    </Typography>
                    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={0.5}>
                      {leader.badges.slice(0, 2).map((badge, idx) => (
                        <Chip
                          key={idx}
                          label={badge}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            bgcolor: 'rgba(255,255,255,0.8)',
                            color: 'text.primary'
                          }}
                        />
                      ))}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Complete Leaderboard */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Complete Rankings
              </Typography>
              <List>
                {leaderboardData.map((leader, index) => (
                  <ListItem
                    key={leader.id}
                    sx={{
                      mb: 2,
                      bgcolor: index < 3 ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                      borderRadius: 2,
                      border: user?.id === leader.id ? '2px solid #1976d2' : 'none'
                    }}
                  >
                    <ListItemAvatar>
                      {getRankIcon(leader.rank)}
                    </ListItemAvatar>
                    
                    <Avatar
                      src={leader.avatar}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {leader.name}
                          </Typography>
                          {user?.id === leader.id && (
                            <Chip label="You" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" gap={2} mb={1}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <EmojiEvents sx={{ fontSize: 16, color: '#ffc107' }} />
                              <Typography variant="body2" fontWeight="bold">
                                {leader.points} pts
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Star sx={{ fontSize: 16, color: '#1976d2' }} />
                              <Typography variant="body2">
                                Level {leader.level}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {leader.activitiesCompleted} activities
                              </Typography>
                            </Box>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {leader.location}
                            </Typography>
                          </Box>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {leader.badges.slice(0, 3).map((badge, idx) => (
                              <Chip
                                key={idx}
                                label={badge}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    
                    <Box textAlign="right">
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {leader.growth}
                        </Typography>
                      </Box>
                      <Tooltip title="Share profile">
                        <IconButton size="small" onClick={() => handleShare(leader)}>
                          <Share sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Achievement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
            <IconButton onClick={copyToClipboard} color="primary">
              <ContentCopy />
            </IconButton>
            <IconButton onClick={() => shareToSocial('whatsapp')} sx={{ color: '#25d366' }}>
              <WhatsApp />
            </IconButton>
            <IconButton onClick={() => shareToSocial('facebook')} sx={{ color: '#4267b2' }}>
              <Facebook />
            </IconButton>
            <IconButton onClick={() => shareToSocial('twitter')} sx={{ color: '#1da1f2' }}>
              <Twitter />
            </IconButton>
            <IconButton onClick={() => shareToSocial('linkedin')} sx={{ color: '#0077b5' }}>
              <LinkedIn />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={copyToClipboard} variant="contained">Copy & Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Leaderboard;
