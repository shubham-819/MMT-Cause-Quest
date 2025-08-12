import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = formData.email && formData.password;

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={4}
        sx={{
          p: 6,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary"
            mb={1}
          >
            Welcome Back!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your MMT Cause Quest account
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={!isFormValid || loading}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 4 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        {/* Demo Accounts */}
        <Box textAlign="center" mb={3}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Demo Accounts (for testing):
          </Typography>
          <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setFormData({ email: 'organizer@demo.com', password: 'password123' })}
            >
              Organizer
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setFormData({ email: 'volunteer@demo.com', password: 'password123' })}
            >
              Volunteer
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setFormData({ email: 'admin@demo.com', password: 'password123' })}
            >
              Admin
            </Button>
          </Box>
        </Box>

        {/* Footer Links */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign up for free
            </Link>
          </Typography>
          
          <Box mt={2}>
            <Link
              href="#"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Forgot your password?
            </Link>
          </Box>
        </Box>

        {/* Platform Info */}
        <Box
          mt={4}
          p={2}
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.05)',
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="primary" fontWeight="bold" mb={1}>
            🌟 Join the MMT Cause Quest Community
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Be a cause, join a cause, and make every journey count for positive change
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
