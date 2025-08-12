import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Container,
  Paper,
} from '@mui/material';
import {
  AccountCircle,
  EmojiEvents,
  Add,
  Notifications,
  Settings,
  ExitToApp,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoggedIn } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // MakeMyTrip Logo Component
  const MMTLogo = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        mr: 3
      }}
      onClick={() => navigate('/')}
    >
      {/* Simplified MMT logo representation */}
      <Box
        sx={{
          width: 87,
          height: 28,
          background: 'linear-gradient(90deg, #CF381E 0%, #FF6B47 100%)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'DM Sans',
          fontWeight: 800,
          fontSize: '12px',
          color: '#FFFFFF'
        }}
      >
        MMT
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #0D99FF 0%, #1768FF 100%)',
        borderBottom: 'none'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            py: 1,
            minHeight: '64px !important'
          }}
        >
          {/* Left side - Logo */}
          <MMTLogo />

          {/* Right side - User actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* List your Property */}
            <Box
              sx={{
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  fontSize: '10px',
                  color: '#FFFFFF',
                  lineHeight: 1.3
                }}
              >
                List your Property
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  fontSize: '8px',
                  color: '#FFFFFF',
                  opacity: 0.8
                }}
              >
                Grow your business!
              </Typography>
            </Box>

            {/* Divider */}
            <Box
              sx={{
                width: '1px',
                height: '45px',
                background: 'rgba(255, 255, 255, 0.3)'
              }}
            />

            {/* My Trips */}
            <Box
              sx={{
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onClick={() => navigate('/my-trips')}
            >
              <Typography
                sx={{
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  fontSize: '10px',
                  color: '#FFFFFF',
                  lineHeight: 1.3
                }}
              >
                My Trips
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  fontSize: '8px',
                  color: '#FFFFFF',
                  opacity: 0.8
                }}
              >
                Manage your bookings
              </Typography>
            </Box>

            {/* Login/User Account */}
            {isLoggedIn ? (
              <Box>
                <Button
                  sx={{
                    background: 'linear-gradient(90deg, #52B0FE 0%, #1768FF 100%)',
                    borderRadius: '3px',
                    color: '#FFFFFF',
                    fontFamily: 'DM Sans',
                    fontWeight: 800,
                    fontSize: '10px',
                    textTransform: 'none',
                    px: 2,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(90deg, #4A9FED 0%, #0F56EE 100%)'
                    }
                  }}
                  onClick={handleMenu}
                  endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
                >
                  {user?.name || 'User Account'}
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate('/profile');
                      handleClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <AccountCircle sx={{ mr: 2, color: '#666' }} />
                    My Profile
                  </MenuItem>
                  
                  <MenuItem
                    onClick={() => {
                      navigate('/leaderboard');
                      handleClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <EmojiEvents sx={{ mr: 2, color: '#FFD700' }} />
                    Leaderboard
                  </MenuItem>
                  
                  <MenuItem
                    onClick={() => {
                      navigate('/create-activity');
                      handleClose();
                    }}
                    sx={{ py: 1.5 }}
                  >
                    <Add sx={{ mr: 2, color: '#4CAF50' }} />
                    Create Activity
                  </MenuItem>

                  <MenuItem
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5,
                      color: '#f44336',
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.08)'
                      }
                    }}
                  >
                    <ExitToApp sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                sx={{
                  background: 'linear-gradient(90deg, #52B0FE 0%, #1768FF 100%)',
                  borderRadius: '3px',
                  color: '#FFFFFF',
                  fontFamily: 'DM Sans',
                  fontWeight: 800,
                  fontSize: '10px',
                  textTransform: 'none',
                  px: 2,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #4A9FED 0%, #0F56EE 100%)'
                  }
                }}
                onClick={() => navigate('/login')}
                endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              >
                Login or Create Account
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;