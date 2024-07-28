import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, Typography, Box, Divider, ButtonBase } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const PreschoolCard = ({ malibu, onSelect }) => {
  if (!malibu) {
    return null; // Render nothing if malibu is undefined
  }

  return (
    <ButtonBase
      onClick={() => onSelect(malibu)}
      style={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        borderRadius: '10px',
        marginBottom: '16px',
        textDecoration: 'none',
      }}
    >
      <Card
        className="card"
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          boxShadow: 3,
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        <CardHeader
          title={
            <Typography variant="h6" sx={{ color: '#333' }}>
              {malibu.namn}
            </Typography>
          }
          sx={{ paddingBottom: 0 }}
        />
        <Divider />
        <CardContent className="card-body" sx={{ padding: '16px' }}>
          <Box display="flex" alignItems="center" mb={1}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#007bff', marginRight: '8px' }} />
            <Typography variant="body1" sx={{ color: '#555' }}>
              {malibu.adress}
            </Typography>
          </Box>
          {malibu.description && (
            <Box display="flex" alignItems="center" mb={1}>
              <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#28a745', marginRight: '8px' }} />
              <Typography variant="body1" sx={{ color: '#555' }}>
                {malibu.description}
              </Typography>
            </Box>
          )}
          <Box mt={2}>
            <Typography variant="body2" sx={{ color: '#333' }}>
              <strong>Antal Svar:</strong> {malibu.antalSvar} st
            </Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>
              <strong>Helhetsomdome:</strong> {malibu.helhetsomdome}%
            </Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>
              <strong>Svarsfrekvens:</strong> {malibu.svarsfrekvens}%
            </Typography>
          </Box>
          {malibu.questions && (
            <Box mt={2}>
              <Typography variant="h6" sx={{ color: '#333' }}>
                Frågor
              </Typography>
              {malibu.questions.map((question) => (
                <Box key={question.id} mt={1}>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    <strong>{question.frageText}:</strong> {question.andelInstammer}%
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </ButtonBase>
  );
};

PreschoolCard.propTypes = {
  malibu: PropTypes.shape({
    namn: PropTypes.string.isRequired,
    adress: PropTypes.string.isRequired,
    description: PropTypes.string,
    antalSvar: PropTypes.number.isRequired,
    helhetsomdome: PropTypes.number.isRequired,
    svarsfrekvens: PropTypes.number.isRequired,
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        frageText: PropTypes.string.isRequired,
        andelInstammer: PropTypes.number.isRequired,
      })
    ),
  }),
  onSelect: PropTypes.func.isRequired,
};

export default PreschoolCard;
