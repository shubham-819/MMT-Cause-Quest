import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Schedule,
  Group
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const OTPValidation = ({ open, onClose, activity, onActivityStarted }) => {
  const { user } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  // Determine initial step based on activity state
  const getInitialStep = () => {
    if (activity?.otp_validation_available) {
      return 'validate'; // OTPs already generated, go directly to validation
    }
    return 'generate'; // Need to generate OTPs first
  };
  
  const [step, setStep] = useState(getInitialStep()); // 'generate', 'validate', 'completed'

  // Update step when activity changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setStep(getInitialStep());
    }
  }, [open, activity?.otp_validation_available]);

  const generateOTP = async () => {
    if (!user?.id || !activity?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('validate');
        toast.success(data.message || 'OTPs generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate OTP');
      }
    } catch (error) {
      toast.error('An error occurred while generating OTP');
    } finally {
      setLoading(false);
    }
  };

  const validateOTP = async () => {
    if (!otpCode || !user?.id || !activity?.id) return;
    
    setValidating(true);
    try {
      const response = await fetch(`/api/activities/${activity.id}/validate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otpCode: otpCode.trim(),
          userId: user.id 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('completed');
        toast.success('Activity started successfully! Points will be awarded upon completion.');
        if (onActivityStarted) {
          onActivityStarted();
        }
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('An error occurred while validating OTP');
    } finally {
      setValidating(false);
    }
  };

  const handleClose = () => {
    setOtpCode('');
    setStep(getInitialStep());
    onClose();
  };



  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Security color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Activity OTP Verification
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {activity?.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {step === 'generate' && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>How OTP Verification Works:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                1. Generate a unique OTP for this activity<br/>
                2. Share the OTP with all participants<br/>
                3. Participants show you their OTP to confirm attendance<br/>
                4. Validate the OTP to officially start the activity
              </Typography>
            </Alert>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Group fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Participants
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      {activity?.current_participants || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule fontSize="small" color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Activity Date
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {activity?.date && new Date(activity.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box textAlign="center" py={2}>
              <Button
                variant="contained"
                size="large"
                onClick={generateOTP}
                loading={loading}
                disabled={loading}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5
                }}
              >
                {loading ? 'Generating OTP...' : 'Generate Activity OTP'}
              </Button>
            </Box>
          </Box>
        )}

        {step === 'validate' && (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                🎯 OTPs Generated Successfully!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Each participant now has their unique OTP. They can see it in their profile.
              </Typography>
            </Alert>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600}>
                📱 How it works:
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                1. Participants can see their OTP in "My Trips" → "Joined Activities"<br/>
                2. Ask each participant to share their OTP with you verbally<br/>
                3. Enter any participant's OTP below to start the activity<br/>
                4. Each participant gets verified individually
              </Typography>
            </Alert>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              🚀 Validate Participant & Start Activity
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Enter the OTP that a participant shared with you:
            </Typography>

            <TextField
              fullWidth
              label="Enter OTP to Start Activity"
              variant="outlined"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 3 }}
            />

            <Box textAlign="center">
              <Button
                variant="contained"
                size="large"
                onClick={validateOTP}
                disabled={!otpCode || otpCode.length !== 6 || validating}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5
                }}
              >
                {validating ? 'Starting Activity...' : 'Start Activity'}
              </Button>
            </Box>
          </Box>
        )}

        {step === 'completed' && (
          <Box textAlign="center" py={3}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} mb={2}>
              🚀 Activity Started Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Your activity is now officially in progress. All participants have been verified with OTP.
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> The activity is now STARTED but not yet COMPLETED.
              </Typography>
            </Alert>
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Next Steps:</strong><br/>
                • Conduct your activity as planned<br/>
                • When the activity is finished, click "Complete Activity" button<br/>
                • Only then will you receive your organizer points<br/>
                • Participants can rate/review only after completion<br/>
                • Points are awarded: Organizer on completion, Participants on review submission
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} size="large">
          {step === 'completed' ? 'Done' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OTPValidation;
