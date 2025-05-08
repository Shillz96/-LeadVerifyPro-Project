import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Chip, 
  Paper, 
  Button, 
  CircularProgress,
  Divider,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MapIcon from '@mui/icons-material/Map';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * County Selector Component
 * Displays available counties and allows users to request new counties
 */
const CountySelector = ({ user, onCountySelect }) => {
  const [loading, setLoading] = useState(true);
  const [availableCounties, setAvailableCounties] = useState([]);
  const [comingSoonCounties, setComingSoonCounties] = useState([]);
  const [countiesByState, setCountiesByState] = useState({});
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Check if user has pro access
  const isPro = user?.subscription?.level === 'pro' || user?.subscription?.level === 'premium';

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setLoading(true);
        
        // Fetch all counties, including coming soon
        const response = await axios.get(`${API_URL}/firecrawl/counties?includeComing=true`);
        
        if (response.data.success) {
          const counties = response.data.data;
          
          // Filter available and coming soon counties
          setAvailableCounties(counties.filter(county => county.available));
          setComingSoonCounties(counties.filter(county => county.comingSoon));
        }

        // Fetch counties by state for the grouped view
        const stateResponse = await axios.get(`${API_URL}/firecrawl/counties/by-state`);
        if (stateResponse.data.success) {
          setCountiesByState(stateResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching counties:', err);
        setError('Failed to fetch available counties');
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCountyClick = (county) => {
    if (county.available && (!county.proOnly || isPro)) {
      onCountySelect && onCountySelect(county);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="county view tabs">
          <Tab label="Available Counties" />
          <Tab label="Coming Soon" />
          <Tab label="By State" icon={<MapIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Available Counties Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="body1" gutterBottom>
            These counties are currently available for property validation.
            {!isPro && availableCounties.some(c => c.proOnly) && (
              <Box component="span" sx={{ ml: 1, fontWeight: 'bold', color: 'secondary.main' }}>
                Some counties require a Pro subscription.
              </Box>
            )}
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {availableCounties.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  No counties are currently available. Check the Coming Soon tab for upcoming counties.
                </Alert>
              </Grid>
            ) : (
              availableCounties.map((county) => (
                <Grid item xs={12} sm={6} md={4} key={county.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: (!county.proOnly || isPro) ? 'pointer' : 'default',
                      opacity: (county.proOnly && !isPro) ? 0.7 : 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: (!county.proOnly || isPro) ? 3 : 0,
                        borderColor: (!county.proOnly || isPro) ? 'primary.main' : 'divider'
                      }
                    }}
                    onClick={() => handleCountyClick(county)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {county.name}
                      </Typography>
                      {county.proOnly ? (
                        <Chip 
                          icon={<LockIcon />} 
                          label="Pro" 
                          size="small"
                          color="secondary"
                        />
                      ) : (
                        <Chip 
                          icon={<VerifiedIcon />} 
                          label="Available" 
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      State: {county.state}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      Cities: {county.cities.join(', ')}
                    </Typography>

                    {county.proOnly && !isPro && (
                      <Alert severity="warning" sx={{ mt: 1 }} variant="outlined">
                        Requires Pro subscription
                      </Alert>
                    )}
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Coming Soon Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="body1" gutterBottom>
            These counties are in development and will be available soon.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {comingSoonCounties.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  There are no counties in development at the moment.
                </Alert>
              </Grid>
            ) : (
              comingSoonCounties.map((county) => (
                <Grid item xs={12} sm={6} md={4} key={county.id}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: 0.8
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h3">
                        {county.name}
                      </Typography>
                      <Chip 
                        icon={<ScheduleIcon />} 
                        label="Coming Soon" 
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      State: {county.state}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      Cities: {county.cities.join(', ')}
                    </Typography>

                    {county.proOnly && (
                      <Chip 
                        icon={<LockIcon />} 
                        label="Will require Pro" 
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* By State Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="body1" gutterBottom>
            Counties organized by state.
          </Typography>

          {Object.keys(countiesByState).length === 0 ? (
            <Alert severity="info">
              No county data available.
            </Alert>
          ) : (
            Object.keys(countiesByState).sort().map((state) => (
              <Box key={state} sx={{ mb: 4 }}>
                <Typography variant="h6" component="h3" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <MapIcon sx={{ mr: 1 }} /> {state}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {countiesByState[state].map((county) => (
                    <Grid item key={county.id}>
                      <Chip 
                        icon={county.available ? <VerifiedIcon /> : <ScheduleIcon />}
                        label={county.name}
                        color={county.available ? 'primary' : 'default'}
                        variant={county.available ? 'filled' : 'outlined'}
                        onClick={() => county.available && handleCountyClick(county)}
                        sx={{ 
                          cursor: county.available && (!county.proOnly || isPro) ? 'pointer' : 'default',
                          opacity: (county.proOnly && !isPro) ? 0.7 : 1
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </Box>
      )}

      {!isPro && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Pro Subscription Benefits
          </Typography>
          <Typography variant="body2">
            Upgrade to Pro to unlock all counties and access premium features like bulk validation and priority support.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            sx={{ mt: 1 }}
            href="/pricing"
          >
            Upgrade to Pro
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default CountySelector; 