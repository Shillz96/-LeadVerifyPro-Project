import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Chip, Divider, CircularProgress, Alert, Card, CardContent, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaidIcon from '@mui/icons-material/Paid';
import axios from 'axios';

/**
 * PropertyDetails Component
 * 
 * This component displays detailed information about a property,
 * including ownership, tax status, and a motivation score.
 */
const PropertyDetails = () => {
  const { county, id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch property details on component mount
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(`/api/firecrawl/property/${county}/${id}`);
        setProperty(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Error fetching property details');
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [county, id]);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Render empty state
  if (!property) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No property details found.
        </Alert>
      </Box>
    );
  }

  // Determine property status chip color
  const getStatusColor = () => {
    if (property.vacant && property.taxInfo?.taxDelinquent) return 'error';
    if (property.vacant) return 'warning';
    return 'success';
  };

  // Determine property status text
  const getStatusText = () => {
    if (property.vacant && property.taxInfo?.taxDelinquent) return 'Vacant & Tax Delinquent';
    if (property.vacant) return 'Vacant';
    return 'Occupied';
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    
    // Try to extract number from string if it's not already a number
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[$,]/g, ''))
      : value;
    
    if (isNaN(numValue)) return value;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Property Details
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip 
          icon={<HomeIcon />} 
          label={getStatusText()} 
          color={getStatusColor()} 
          sx={{ mr: 2 }} 
        />
        
        {property.score !== undefined && (
          <Chip 
            icon={<AssessmentIcon />} 
            label={`Motivation Score: ${property.score}`} 
            color={property.score >= 50 ? 'primary' : 'default'} 
          />
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Property Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Property Overview
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{property.address || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Account/Property ID</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{property.accountNumber || property.propertyId || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">County</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{county}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Property Value</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{formatCurrency(property.propertyValue)}</Typography>
              </Grid>
              
              {property.characteristics && Object.entries(property.characteristics).map(([key, value]) => (
                <React.Fragment key={key}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body1">{value}</Typography>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Paper>
        </Grid>
        
        {/* Owner Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Owner Information
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Owner</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{property.owner || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">Mailing Address</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1">{property.ownerAddress || 'N/A'}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Owner lives at property:
                  </Typography>
                  <Chip 
                    size="small"
                    label={property.vacant ? 'No' : 'Yes'} 
                    color={property.vacant ? 'error' : 'success'} 
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Tax Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tax Information
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            {property.taxInfo ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Tax Status
                      </Typography>
                      <Typography variant="h6" component="div">
                        {property.taxInfo.taxDelinquent ? 'Delinquent' : 'Current'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Amount Due
                      </Typography>
                      <Typography variant="h6" component="div">
                        {formatCurrency(property.taxInfo.taxAmountDue) || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Last Payment
                      </Typography>
                      <Typography variant="h6" component="div">
                        {property.taxInfo.lastPaymentDate || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body1">
                No tax information available
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Motivation Score Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PaidIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <div>
                  <Typography variant="h6" gutterBottom>
                    Motivation Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on property data and owner situation
                  </Typography>
                </div>
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 1,
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  color: 'white'
                }}
              >
                <Typography variant="h4">
                  {property.score || 'N/A'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" paragraph>
              This score indicates how motivated the owner might be to sell the property. 
              Factors include vacancy status, tax delinquency, ownership duration, and property condition.
            </Typography>
            
            <Button variant="contained" color="primary">
              Add to Lead List
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyDetails; 