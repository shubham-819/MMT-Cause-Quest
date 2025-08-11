import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
// Note: For demo purposes, using regular date inputs
// In production, install @mui/x-date-pickers for better date/time selection
import { Save, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Indian cities and states data
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Puducherry',
  'Andaman and Nicobar Islands'
];

const popularCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot',
  'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar',
  'Raipur', 'Allahabad', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati',
  'Chandigarh', 'Hubli-Dharwad', 'Amroha', 'Moradabad', 'Gurgaon', 'Aligarh', 'Solapur', 'Ranchi',
  'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Mira-Bhayandar', 'Thiruvananthapuram',
  'Bhiwandi', 'Saharanpur', 'Guntur', 'Amravati', 'Bikaner', 'Noida', 'Jamshedpur', 'Bhilai Nagar',
  'Cuttack', 'Firozabad', 'Kochi', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Nanded-Waghala',
  'Kolhapur', 'Ajmer', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar',
  'Nellore', 'Jammu', 'Sangli-Miraj & Kupwad', 'Belgaum', 'Mangalore', 'Ambattur', 'Tirunelveli',
  'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur', 'Maheshtala', 'Mysore', 'Port Blair', 'Havelock Island'
];

const CreateActivity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    tags: [],
    image: null,
    location: {
      address: '',
      city: '',
      state: '',
      country: 'India'
    },
    dateTime: {
      start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000) // Tomorrow + 2 hours
    },
    duration: 120,
    capacity: {
      min: 1,
      max: 10
    },
    requirements: {
      ageLimit: { min: 16, max: 65 },
      skills: [],
      items: [],
      guidelines: ''
    },
    impact: {
      goal: '',
      metrics: []
    },
    pointsAwarded: {
      participant: 50,
      organizer: 100
    }
  });

  const steps = ['Basic Information', 'Location & Time', 'Requirements', 'Impact Goals', 'Review'];
  const categories = ['Environment', 'Education', 'Health', 'Culture', 'Community', 'Wildlife', 'Elderly Care', 'Disaster Relief'];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleTagAdd = (field, value) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleTagRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add image file if exists
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Add organizer ID from current user
      submitData.append('organizerId', user.id);
      
      // Add other fields as JSON strings
      const fieldsToSerialize = ['location', 'dateTime', 'capacity', 'requirements', 'pointsAwarded', 'impact', 'tags'];
      
      Object.keys(formData).forEach(key => {
        if (key !== 'image') {
          if (fieldsToSerialize.includes(key)) {
            submitData.append(key, JSON.stringify(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      });

      const response = await fetch('/api/activities', {
        method: 'POST',
        body: submitData, // No Content-Type header for FormData
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Activity created successfully!');
        navigate(`/activity/${data.activity.id}`);
      } else {
        toast.error(data.message || 'Failed to create activity');
      }
    } catch (error) {
      toast.error('An error occurred while creating the activity');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Activity Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                helperText="Give your activity a compelling title"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                required
                multiline
                rows={2}
                helperText="Brief summary that will appear in activity listings"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Detailed Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                multiline
                rows={4}
                helperText="Provide comprehensive details about your activity"
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                Activity Image
              </Typography>
              
              <Box
                sx={{
                  border: '2px dashed #ddd',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main'
                  }
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                
                {imagePreview ? (
                  <Box>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}
                    />
                    <Box>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        Remove Image
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Upload Activity Image
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click to browse or drag and drop an image (Max 5MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Add Tags"
                placeholder="Press Enter to add tags"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd('tags', e.target.value);
                    e.target.value = '';
                  }
                }}
                helperText="Add relevant tags to help people find your activity"
              />
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleTagRemove('tags', index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                required
                helperText="Specific address or landmark"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Autocomplete
                fullWidth
                options={popularCities}
                value={formData.location.city}
                onChange={(event, newValue) => {
                  handleInputChange('location.city', newValue || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    required
                    placeholder="Search or select a city"
                  />
                )}
                freeSolo
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                  label="State"
                >
                  {indianStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date & Time"
                type="datetime-local"
                value={formData.dateTime.start ? formData.dateTime.start.toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    handleInputChange('dateTime.start', newDate);
                  }
                }}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16)
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date & Time"
                type="datetime-local"
                value={formData.dateTime.end ? formData.dateTime.end.toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    handleInputChange('dateTime.end', newDate);
                  }
                }}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formData.dateTime.start ? formData.dateTime.start.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Minimum Participants"
                type="number"
                value={formData.capacity.min}
                onChange={(e) => handleInputChange('capacity.min', parseInt(e.target.value))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Maximum Participants"
                type="number"
                value={formData.capacity.max}
                onChange={(e) => handleInputChange('capacity.max', parseInt(e.target.value))}
                required
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Age"
                type="number"
                value={formData.requirements.ageLimit.min}
                onChange={(e) => handleInputChange('requirements.ageLimit.min', parseInt(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Age"
                type="number"
                value={formData.requirements.ageLimit.max}
                onChange={(e) => handleInputChange('requirements.ageLimit.max', parseInt(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Required Skills"
                placeholder="Press Enter to add skills"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd('requirements.skills', e.target.value);
                    e.target.value = '';
                  }
                }}
                helperText="List any specific skills participants should have"
              />
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {formData.requirements.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleTagRemove('requirements.skills', index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Items to Bring"
                placeholder="Press Enter to add items"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd('requirements.items', e.target.value);
                    e.target.value = '';
                  }
                }}
                helperText="List items participants should bring"
              />
              <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                {formData.requirements.items.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleTagRemove('requirements.items', index)}
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Guidelines & Instructions"
                value={formData.requirements.guidelines}
                onChange={(e) => handleInputChange('requirements.guidelines', e.target.value)}
                multiline
                rows={4}
                helperText="Provide any specific guidelines or instructions for participants"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Impact Goal"
                value={formData.impact.goal}
                onChange={(e) => handleInputChange('impact.goal', e.target.value)}
                multiline
                rows={3}
                helperText="Describe the positive impact this activity will create"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Participant Points"
                type="number"
                value={formData.pointsAwarded.participant}
                onChange={(e) => handleInputChange('pointsAwarded.participant', parseInt(e.target.value))}
                helperText="Points participants will earn"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organizer Points"
                type="number"
                value={formData.pointsAwarded.organizer}
                onChange={(e) => handleInputChange('pointsAwarded.organizer', parseInt(e.target.value))}
                helperText="Points you'll earn as organizer"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review your activity details before submitting. Once submitted, your activity will be reviewed by our TEM (Trusted Experience Moderators) team.
              </Alert>
              
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    {formData.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {formData.shortDescription}
                  </Typography>
                  
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip label={formData.category} color="primary" size="small" />
                    {formData.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" mb={1}>
                    <strong>Location:</strong> {formData.location.address}, {formData.location.city}, {formData.location.state}
                  </Typography>
                  
                  <Typography variant="body2" mb={1}>
                    <strong>Date:</strong> {formData.dateTime.start.toLocaleDateString()} at {formData.dateTime.start.toLocaleTimeString()}
                  </Typography>
                  
                  <Typography variant="body2" mb={1}>
                    <strong>Duration:</strong> {formData.duration} minutes
                  </Typography>
                  
                  <Typography variant="body2" mb={1}>
                    <strong>Capacity:</strong> {formData.capacity.min}-{formData.capacity.max} participants
                  </Typography>
                  
                  <Typography variant="body2">
                    <strong>Points:</strong> Participants earn {formData.pointsAwarded.participant} points
                  </Typography>
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" fontWeight="bold" color="primary" mb={2}>
        Create New Activity
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        Organize a meaningful activity and make a positive impact in your community
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'Creating...' : 'Create Activity'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateActivity;
