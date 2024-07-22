import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Container, Typography, Paper } from '@mui/material';

const SplashScreen = ({ onProceed }) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      p={2}
    >
      <Container 
        maxWidth="xs" 
        sx={{ 
          mt: { xs: '50vh', sm: '30vh' }, // Adjust top margin for mobile and larger screens
          mx: 'auto', // Center horizontally
          p: 0, // Remove default padding
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: { xs: 2, sm: 6 }, // Adjust padding for mobile and larger screens
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: { xs: '25px', sm: '0' }, // Add margin-right for mobile
          }}
        >
          <Typography variant="h5" gutterBottom>
            Välkommen till Förskolekollen.se
          </Typography>
          <Typography variant="body1" paragraph>
            Här kan du hitta närliggande förskolor och se detaljerad information om dem.
          </Typography>
          <Typography variant="body1" paragraph>
            Ange din adress i sökrutan för att börja.
          </Typography>
          <Button variant="contained" color="primary" onClick={onProceed}>
            Stäng
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

SplashScreen.propTypes = {
  onProceed: PropTypes.func.isRequired,
};

export default SplashScreen;
