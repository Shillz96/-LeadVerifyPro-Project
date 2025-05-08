import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Paper, 
  Grid, 
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PropertyDetails from './PropertyDetails';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * LeadValidator Component
 * 
 * This component provides an interface for users to upload lead lists
 * and validate them against property data sources. It shows validation
 * results with motivation scores.
 */
const LeadValidator = ({ user }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState({
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [availableCounties, setAvailableCounties] = useState([]);
  const [comingSoonCounties, setComingSoonCounties] = useState([]);
  const [countiesByState, setCountiesByState] = useState({});
  const [selectedCounty, setSelectedCounty] = useState('');
  const [requestCounty, setRequestCounty] = useState({
    county: '',
    state: '',
    email: '',
    reason: ''
  });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);

  // Check if user has a pro subscription
  const isPro = user?.subscription?.level === 'pro' || user?.subscription?.level === 'premium';

  // Fetch available counties on component mount
  useEffect(() => {
    const fetchCounties = async () => {
      try {
        // Fetch all counties, including coming soon
        const response = await axios.get(`${API_URL}/firecrawl/counties?includeComing=true`);
        
        if (response.data.success) {
          const counties = response.data.data;
          
          // Filter available and coming soon counties
          setAvailableCounties(counties.filter(county => county.available));
          setComingSoonCounties(counties.filter(county => county.comingSoon));
        }

        // Fetch counties by state for the dropdown
        const stateResponse = await axios.get(`${API_URL}/firecrawl/counties/by-state`);
        if (stateResponse.data.success) {
          setCountiesByState(stateResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching counties:', err);
        setError('Failed to fetch available counties');
      }
    };

    fetchCounties();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add isPro to query if in development
      let url = `${API_URL}/firecrawl/upload`;
      if (process.env.NODE_ENV === 'development') {
        url += `?isPro=${isPro ? 'true' : 'false'}`;
      }

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.error?.message || 'Failed to process file');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error uploading file: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery({
      ...searchQuery,
      [e.target.name]: e.target.value
    });
  };

  const handleCountyChange = (e) => {
    setSelectedCounty(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.address) {
      setError('Address is required for search');
      return;
    }

    setSearchLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedProperty(null);

    try {
      // Add isPro to query if in development
      let url = `${API_URL}/firecrawl/search`;
      if (process.env.NODE_ENV === 'development') {
        url += `?isPro=${isPro ? 'true' : 'false'}`;
      }

      const response = await axios.post(url, {
        ...searchQuery,
        county: selectedCounty || undefined
      });

      if (response.data.success) {
        setSearchResults(response.data.data);
      } else {
        setError(response.data.error?.message || 'Failed to search properties');
      }
    } catch (err) {
      console.error('Error searching properties:', err);
      setError('Error searching properties: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectProperty = async (property) => {
    if (property.requiresPro && !isPro) {
      setError('This county requires a Pro subscription');
      return;
    }

    if (property.comingSoon) {
      setError('This county is coming soon and not yet available');
      return;
    }

    setSelectedProperty(property);

    if (property.propertyId || property.accountNumber) {
      try {
        setSearchLoading(true);
        
        // Add isPro to query if in development
        let url = `${API_URL}/firecrawl/property/${property.county}/${property.propertyId || property.accountNumber}`;
        if (process.env.NODE_ENV === 'development') {
          url += `?isPro=${isPro ? 'true' : 'false'}`;
        }

        const response = await axios.get(url);
        
        if (response.data.success) {
          setSelectedProperty({
            ...property,
            details: response.data.data
          });
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleRequestCountyChange = (e) => {
    setRequestCounty({
      ...requestCounty,
      [e.target.name]: e.target.value
    });
  };

  const handleRequestCountySubmit = async () => {
    if (!requestCounty.county || !requestCounty.state) {
      setError('County and state are required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/firecrawl/request-county`, requestCounty);
      
      if (response.data.success) {
        setRequestStatus('success');
        // Reset form after success
        setRequestCounty({
          county: '',
          state: '',
          email: '',
          reason: ''
        });
      } else {
        setRequestStatus('error');
        setError(response.data.error?.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error requesting county:', err);
      setRequestStatus('error');
      setError('Error requesting county: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lead Validator
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Available Counties
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {availableCounties.map((county) => (
            <Grid item key={county.id}>
              <Chip 
                icon={<VerifiedIcon />} 
                label={`${county.name}, ${county.state}`} 
                color="primary" 
                variant={county.proOnly && !isPro ? "outlined" : "filled"}
              />
            </Grid>
          ))}
          
          {comingSoonCounties.map((county) => (
            <Grid item key={county.id}>
              <Chip 
                icon={county.proOnly ? <LockIcon /> : <ScheduleIcon />}
                label={`${county.name}, ${county.state} ${county.proOnly ? '(Pro)' : ''}`} 
                color="secondary" 
                variant="outlined"
              />
            </Grid>
          ))}
          
          {availableCounties.length === 0 && comingSoonCounties.length === 0 && (
            <Grid item>
              <Typography variant="body1">
                No counties available yet. Please check back later.
              </Typography>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowRequestForm(!showRequestForm)}
          >
            {showRequestForm ? 'Hide Request Form' : 'Request a County'}
          </Button>
        </Box>
        
        {showRequestForm && (
          <Box sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Request a County
            </Typography>
            
            {requestStatus === 'success' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Your county request has been submitted successfully!
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="County"
                  name="county"
                  value={requestCounty.county}
                  onChange={handleRequestCountyChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={requestCounty.state}
                  onChange={handleRequestCountyChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={requestCounty.email}
                  onChange={handleRequestCountyChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Why do you need this county?"
                  name="reason"
                  value={requestCounty.reason}
                  onChange={handleRequestCountyChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleRequestCountySubmit}
                  disabled={loading || !requestCounty.county || !requestCounty.state}
                >
                  Submit Request
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload Lead File
        </Typography>
        <Typography variant="body2" gutterBottom color="text.secondary">
          Upload an Excel file with property leads to validate against county records.
          {!isPro && (
            <Box component="span" fontWeight="bold" color="secondary.main"> Pro subscription required for certain counties.</Box>
          )}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<FileUploadIcon />}
                sx={{ mr: 2 }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="body2">
                {file ? file.name : 'No file selected'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileUpload}
              disabled={loading || !file}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Upload & Process'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {results && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">
              File processed successfully! Found {results.totalLeads} leads.
            </Alert>
            
            {results.validatedLeads && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Validated {results.validatedLeads.length} leads.
                </Typography>
                <Button 
                  variant="outlined" 
                  href={`${API_URL}/firecrawl/download/${results.outputFile.split('/').pop()}`}
                  sx={{ mt: 1 }}
                >
                  Download Validated Results
                </Button>
              </Box>
            )}
            
            {results.sampleLeads && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Sample of leads from your file:
                </Typography>
                <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  {results.sampleLeads.map((lead, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper' }}>
                      <Typography variant="body2">
                        <strong>Address:</strong> {lead.address}, {lead.city}, {lead.state} {lead.zip}
                      </Typography>
                      {lead.owner && (
                        <Typography variant="body2">
                          <strong>Owner:</strong> {lead.owner}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Property Records
        </Typography>
        <Typography variant="body2" gutterBottom color="text.secondary">
          Search directly for property information from county records.
          {!isPro && (
            <Box component="span" fontWeight="bold" color="secondary.main"> Pro subscription required for certain counties.</Box>
          )}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={searchQuery.address}
              onChange={handleSearchChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={searchQuery.city}
              onChange={handleSearchChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={searchQuery.state}
              onChange={handleSearchChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zip"
              value={searchQuery.zip}
              onChange={handleSearchChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>County (Optional)</InputLabel>
              <Select
                value={selectedCounty}
                onChange={handleCountyChange}
                label="County (Optional)"
              >
                <MenuItem value="">
                  <em>Auto-detect</em>
                </MenuItem>
                {Object.keys(countiesByState).sort().map((state) => (
                  <MenuItem key={state} disabled divider>
                    {state}
                  </MenuItem>
                )).concat(
                  Object.keys(countiesByState).sort().flatMap((state) => 
                    countiesByState[state].map((county) => (
                      <MenuItem 
                        key={county.id} 
                        value={county.id}
                        disabled={
                          (county.proOnly && !isPro) || !county.available
                        }
                      >
                        {county.name} {county.proOnly ? '(Pro)' : ''} {!county.available ? '(Coming Soon)' : ''}
                      </MenuItem>
                    ))
                  )
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.address}
              startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Search Property
            </Button>
          </Grid>
        </Grid>

        {searchResults.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Search Results:
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {searchResults.map((property, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      cursor: property.error ? 'not-allowed' : 'pointer',
                      opacity: property.error ? 0.7 : 1,
                      border: selectedProperty === property ? '2px solid #1976d2' : 'none'
                    }}
                    onClick={() => !property.error && handleSelectProperty(property)}
                  >
                    {property.error ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CancelIcon color="error" sx={{ mr: 1 }} />
                        <Typography>
                          {property.error}
                          {property.comingSoon && " (Coming Soon)"}
                          {property.requiresPro && " (Pro Subscription Required)"}
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="subtitle1">
                          {property.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {property.city}, {property.state} {property.zip}
                        </Typography>
                        {property.owner && (
                          <Typography variant="body2">
                            Owner: {property.owner}
                          </Typography>
                        )}
                      </>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {selectedProperty && !selectedProperty.error && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Property Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <PropertyDetails 
              property={selectedProperty} 
              loading={searchLoading}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LeadValidator; 