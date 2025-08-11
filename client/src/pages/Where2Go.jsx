import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Where2Go = () => {
  const navigate = useNavigate();

  const causeCategories = [
    {
      title: 'Environmental Causes',
      description: 'Join activities that help protect our planet',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      color: '#4CAF50',
      activities: ['Beach Cleanup', 'Tree Plantation', 'Wildlife Conservation']
    },
    {
      title: 'Education & Learning',
      description: 'Support education and skill development initiatives',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
      color: '#2196F3',
      activities: ['Teaching Programs', 'Digital Literacy', 'Library Support']
    },
    {
      title: 'Cultural Heritage',
      description: 'Preserve and celebrate our rich cultural traditions',
      image: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&h=300&fit=crop',
      color: '#FF9800',
      activities: ['Heritage Walks', 'Art Workshops', 'Festival Organization']
    },
    {
      title: 'Community Development',
      description: 'Build stronger, more connected communities',
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
      color: '#9C27B0',
      activities: ['Skill Training', 'Health Camps', 'Infrastructure Projects']
    }
  ];

  const features = [
    {
      title: 'Meaningful Impact',
      description: 'Every activity you join creates real, measurable change in communities',
      icon: '🌟'
    },
    {
      title: 'Personal Growth',
      description: 'Develop new skills, build confidence, and expand your perspective',
      icon: '🚀'
    },
    {
      title: 'Connect & Network',
      description: 'Meet like-minded people and build lasting friendships',
      icon: '🤝'
    },
    {
      title: 'Travel with Purpose',
      description: 'Explore new destinations while making a positive difference',
      icon: '✈️'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D99FF 0%, #1768FF 50%, #0D99FF 100%)',
        backgroundAttachment: 'fixed',
        pb: 6
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 3, px: { xs: 2, md: 4 } }}>
        {/* Hero Section */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '24px',
            p: { xs: 4, md: 6 },
            mb: 6,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography
            sx={{
              fontFamily: 'DM Sans',
              fontWeight: 800,
              fontSize: { xs: '32px', md: '48px', lg: '56px' },
              lineHeight: { xs: '40px', md: '56px', lg: '64px' },
              color: '#1a202c',
              mb: 3,
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            MMT Cause Quest
          </Typography>
          
          <Typography
            sx={{
              fontFamily: 'DM Sans',
              fontWeight: 500,
              fontSize: { xs: '18px', md: '22px' },
              lineHeight: { xs: '28px', md: '32px' },
              color: '#4a5568',
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Transform your travels into meaningful experiences. Join causes that matter, 
            create lasting impact, and connect with communities across India.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #0D99FF 0%, #1768FF 100%)',
              borderRadius: '50px',
              color: '#FFFFFF',
              fontFamily: 'DM Sans',
              fontWeight: 600,
              fontSize: '18px',
              px: 6,
              py: 2,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(13,153,255,0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0088E6 0%, #1555E6 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(13,153,255,0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Start Your Journey
          </Button>
        </Paper>

        {/* Features Section */}
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
              mb: 5,
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}
          >
            Why Choose Cause Quest?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    background: 'rgba(13,153,255,0.03)',
                    border: '1px solid rgba(13,153,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(13,153,255,0.08)',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(13,153,255,0.15)'
                    }
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '48px',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'DM Sans',
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#1a202c',
                      mb: 2
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'DM Sans',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#4a5568',
                      lineHeight: '20px'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Cause Categories */}
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
              mb: 5,
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}
          >
            Explore Cause Categories
          </Typography>

          <Grid container spacing={4}>
            {causeCategories.map((category, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => navigate('/dashboard')}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={category.image}
                    alt={category.title}
                    sx={{ filter: 'brightness(0.9)' }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={{
                        fontFamily: 'DM Sans',
                        fontWeight: 700,
                        fontSize: '20px',
                        color: '#1a202c',
                        mb: 2
                      }}
                    >
                      {category.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'DM Sans',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: '#4a5568',
                        mb: 3,
                        lineHeight: '20px'
                      }}
                    >
                      {category.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      {category.activities.map((activity, actIndex) => (
                        <Chip
                          key={actIndex}
                          label={activity}
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            background: `${category.color}15`,
                            color: category.color,
                            border: `1px solid ${category.color}30`,
                            fontWeight: 500,
                            fontSize: '12px'
                          }}
                        />
                      ))}
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}cc 100%)`,
                        color: '#ffffff',
                        fontFamily: 'DM Sans',
                        fontWeight: 600,
                        fontSize: '12px',
                        borderRadius: '20px',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        boxShadow: `0 4px 12px ${category.color}40`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${category.color}dd 0%, ${category.color}aa 100%)`,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 6px 16px ${category.color}50`
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Explore Activities
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* CTA Section */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #0D99FF15 0%, #1768FF20 100%)',
            borderRadius: '24px',
            p: 6,
            textAlign: 'center',
            border: '1px solid rgba(13,153,255,0.2)'
          }}
        >
          <Typography
            sx={{
              fontFamily: 'DM Sans',
              fontWeight: 800,
              fontSize: { xs: '24px', md: '32px' },
              color: '#1a202c',
              mb: 2
            }}
          >
            Ready to Make a Difference?
          </Typography>
          <Typography
            sx={{
              fontFamily: 'DM Sans',
              fontWeight: 400,
              fontSize: '16px',
              color: '#4a5568',
              mb: 4,
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            Join thousands of travelers who are making their journeys meaningful through purposeful activities and community engagement.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create-activity')}
              sx={{
                background: 'linear-gradient(135deg, #0D99FF 0%, #1768FF 100%)',
                borderRadius: '50px',
                color: '#FFFFFF',
                fontFamily: 'DM Sans',
                fontWeight: 600,
                fontSize: '16px',
                px: 4,
                py: 2,
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(13,153,255,0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0088E6 0%, #1555E6 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(13,153,255,0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Organize a Cause
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: '50px',
                color: '#0D99FF',
                borderColor: '#0D99FF',
                fontFamily: 'DM Sans',
                fontWeight: 600,
                fontSize: '16px',
                px: 4,
                py: 2,
                textTransform: 'none',
                '&:hover': {
                  background: 'rgba(13,153,255,0.05)',
                  borderColor: '#0088E6',
                  color: '#0088E6',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Browse Activities
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Where2Go;
