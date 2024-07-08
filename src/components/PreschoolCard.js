import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, Typography, Box, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const PreschoolCard = ({ preschool, onSelect }) => (
  <Card
    onClick={() => onSelect(preschool)}
    className="card"
    sx={{
      backgroundColor: '#f5f5f5',
      borderRadius: '10px',
      boxShadow: 3,
      marginBottom: 2,
      transition: 'transform 0.3s',
      '&:hover': {
        transform: 'scale(1.02)',
      },
    }}
  >
    <CardHeader
      title={
        <Typography variant="h6" sx={{ color: '#333' }}>
          {preschool.namn}
        </Typography>
      }
      sx={{ paddingBottom: 0 }}
    />
    <Divider />
    <CardContent className="card-body" sx={{ padding: '16px' }}>
      <Box display="flex" alignItems="center" mb={1}>
        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#007bff', marginRight: '8px' }} />
        <Typography variant="body1" sx={{ color: '#555' }}>
          {preschool.adress}
        </Typography>
      </Box>
      {preschool.description && (
        <Box display="flex" alignItems="center" mb={1}>
          <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#28a745', marginRight: '8px' }} />
          <Typography variant="body1" sx={{ color: '#555' }}>
            {preschool.description}
          </Typography>
        </Box>
      )}
      {preschool.pdfData && (
        <Box mt={2}>
          <Typography variant="body2" sx={{ color: '#333' }}>
            <strong>Antal Svar:</strong> {preschool.pdfData.antalSvar} st
          </Typography>
          <Typography variant="body2" sx={{ color: '#333' }}>
            <strong>Helhetsomdome:</strong> {preschool.pdfData.helhetsomdome}%
          </Typography>
          <Typography variant="body2" sx={{ color: '#333' }}>
            <strong>Svarsfrekvens:</strong> {preschool.pdfData.svarsfrekvens}%
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

PreschoolCard.propTypes = {
  preschool: PropTypes.shape({
    namn: PropTypes.string.isRequired,
    adress: PropTypes.string.isRequired,
    description: PropTypes.string,
    pdfData: PropTypes.object,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default PreschoolCard;
