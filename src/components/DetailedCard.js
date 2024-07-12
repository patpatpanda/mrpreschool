import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Grid } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f0f4f8',
  borderRadius: '10px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: theme.shadows[2],
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: 'pink',
  color: '#ffffff',
  textAlign: 'center',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: '#e0e7ff',
  overflowY: 'auto', // Make content scrollable
  maxHeight: '70vh', // Set a maximum height for the content
}));

const DetailedCard = ({ schoolData, onClose }) => {
  const { namn, adress, pdfData, schoolDetails, description, walkingTime } = schoolData;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <StyledDialogTitle>
        {namn}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10, color: '#ffffff' }}>
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledBox>
          {adress && (
            <Typography variant="h6" gutterBottom>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {adress}
            </Typography>
          )}
          <Grid container spacing={2}>
            {pdfData && (
              <Grid item xs={12}>
                <StyledBox>
                  <Typography variant="subtitle1">Helhetsomdome: {pdfData.helhetsomdome}%</Typography>
                  <Typography variant="subtitle1">Svarsfrekvens: {pdfData.svarsfrekvens}%</Typography>
                  <Typography variant="subtitle1">Antal Svar: {pdfData.antalSvar}</Typography>
                </StyledBox>
              </Grid>
            )}
            {schoolDetails && (
              <Grid item xs={12}>
                <StyledBox>
                  <Typography variant="h6" gutterBottom>School Details</Typography>
                  <Typography variant="body2">Typ av Service: {schoolDetails.typAvService}</Typography>
                  <Typography variant="body2">Verksam i: {schoolDetails.verksamI}</Typography>
                  <Typography variant="body2">Organisationsform: {schoolDetails.organisationsform}</Typography>
                  <Typography variant="body2">Antal Barn: {schoolDetails.antalBarn}</Typography>
                  <Typography variant="body2">Antal Barn per Årsarbetare: {schoolDetails.antalBarnPerArsarbetare}</Typography>
                  <Typography variant="body2">Andel Legitimerade Förskollärare: {schoolDetails.andelLegitimeradeForskollarare}%</Typography>
                  <Typography variant="body2">Webbplats: <a href={schoolDetails.webbplats} target="_blank" rel="noopener noreferrer">{schoolDetails.webbplats}</a></Typography>
                  <Typography variant="body2">Inriktning och Profil: {schoolDetails.inriktningOchProfil}</Typography>
                  <Typography variant="body2">Mer om Oss: {schoolDetails.merOmOss}</Typography>
                </StyledBox>
              </Grid>
            )}
            {schoolDetails && schoolDetails.kontakter && schoolDetails.kontakter.$values && schoolDetails.kontakter.$values.length > 0 && (
              <Grid item xs={12}>
                <StyledBox>
                  <Typography variant="h6" gutterBottom>Kontaktinformation</Typography>
                  {schoolDetails.kontakter.$values.map((kontakt, index) => (
                    <Box key={index} mb={2}>
                      <Typography variant="body2">Namn: {kontakt.namn}</Typography>
                      <Typography variant="body2">Roll: {kontakt.roll}</Typography>
                      <Typography variant="body2">Epost: {kontakt.epost}</Typography>
                      <Typography variant="body2">Telefon: {kontakt.telefon}</Typography>
                    </Box>
                  ))}
                </StyledBox>
              </Grid>
            )}
          </Grid>
          {description && (
            <Box mt={2}>
              <Typography variant="body2">{description}</Typography>
            </Box>
          )}
          {walkingTime && (
            <Box mt={2}>
              <Typography variant="body2"><FontAwesomeIcon icon={faClock} /> Estimated walk time: {walkingTime}</Typography>
            </Box>
          )}
        </StyledBox>
      </StyledDialogContent>
    </Dialog>
  );
};

DetailedCard.propTypes = {
  schoolData: PropTypes.shape({
    namn: PropTypes.string.isRequired,
    adress: PropTypes.string.isRequired,
    pdfData: PropTypes.object,
    schoolDetails: PropTypes.object,
    description: PropTypes.string,
    walkingTime: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailedCard;
