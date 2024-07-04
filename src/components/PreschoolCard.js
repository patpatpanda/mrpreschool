import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const PreschoolCard = ({ preschool, onSelect }) => (
  <Card onClick={() => onSelect(preschool)} className="card" sx={{ backgroundColor: '#FFF9C4', borderRadius: '20px', boxShadow: 3 }}>
    <CardHeader
      title={<Typography variant="h3" sx={{ color: '#E91E63' }}>{preschool.namn}</Typography>}
    />
    <CardContent className="card-body">
      <Typography variant="body1" sx={{ color: '#4CAF50' }}>
        <FontAwesomeIcon icon={faMapMarkerAlt} /> {preschool.adress}
      </Typography>
      {preschool.description && (
        <Typography variant="body1" sx={{ color: '#FF5722' }}>
          <FontAwesomeIcon icon={faInfoCircle} /> {preschool.description}
        </Typography>
      )}
      {preschool.pdfData && (
        <div className="details">
          <Typography variant="body2"><span>Antal Svar:</span> {preschool.pdfData.antalSvar}st</Typography>
          <Typography variant="body2"><span>Helhetsomdome:</span> {preschool.pdfData.helhetsomdome}%</Typography>
          <Typography variant="body2"><span>Svarsfrekvens:</span> {preschool.pdfData.svarsfrekvens}%</Typography>
        </div>
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
