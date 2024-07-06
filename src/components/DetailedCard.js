import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider, styled } from '@mui/material/styles';
import theme from './theme';

const StyledBox = styled(Box)({
  backgroundColor: '#FFF9C4',
  borderRadius: '10px',
  padding: '10px',
  marginBottom: '10px',
});

const DetailedCard = ({ schoolData, onClose, walkTime }) => {
  const { namn, adress, pdfData, schoolDetails, description } = schoolData;

  return (
    <ThemeProvider theme={theme}>
      <Dialog open onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {namn}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10 }}>
            <FontAwesomeIcon icon={faTimes} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <StyledBox>
            <Typography variant="body1" gutterBottom>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {adress}
            </Typography>
            {pdfData && (
              <StyledBox className="pdf-details">
                <Typography variant="body2">Helhetsomdome: {pdfData.helhetsomdome}%</Typography>
                <Typography variant="body2">Svarsfrekvens: {pdfData.svarsfrekvens}%</Typography>
              </StyledBox>
            )}
            {schoolDetails && (
              <StyledBox className="school-details">
                <Typography variant="h3" gutterBottom>School Address Details:</Typography>
                <Typography variant="body2">Typ av Service: {schoolDetails.typAvService}</Typography>
                <Typography variant="body2">Verksam i: {schoolDetails.verksamI}</Typography>
                <Typography variant="body2">Organisationsform: {schoolDetails.organisationsform}</Typography>
                <Typography variant="body2">Antal Barn: {schoolDetails.antalBarn}</Typography>
                <Typography variant="body2">Antal Barn per Årsarbetare: {schoolDetails.antalBarnPerArsarbetare}</Typography>
                <Typography variant="body2">Andel Legitimerade Förskollärare: {schoolDetails.andelLegitimeradeForskollarare} %</Typography>
                <Typography variant="body2">Webbplats: <a href={schoolDetails.webbplats} target="_blank" rel="noopener noreferrer">{schoolDetails.webbplats}</a></Typography>
                <Typography variant="body2">Inriktning och Profil: {schoolDetails.inriktningOchProfil}</Typography>
                <Typography variant="body2">Mer om Oss: {schoolDetails.merOmOss}</Typography>
              </StyledBox>
            )}
            {schoolDetails && schoolDetails.kontakter && schoolDetails.kontakter.$values && schoolDetails.kontakter.$values.length > 0 && (
              <StyledBox className="contacts">
                <Typography variant="h3" gutterBottom>Kontaktinformation:</Typography>
                {schoolDetails.kontakter.$values.map((kontakt, index) => (
                  <StyledBox key={index} className="contact-card">
                    <Typography variant="body2">Namn: {kontakt.namn}</Typography>
                    <Typography variant="body2">Roll: {kontakt.roll}</Typography>
                    <Typography variant="body2">Epost: {kontakt.epost}</Typography>
                    <Typography variant="body2">Telefon: {kontakt.telefon}</Typography>
                  </StyledBox>
                ))}
              </StyledBox>
            )}
            {description && <StyledBox className="description" mb={2}><Typography variant="body2">{description}</Typography></StyledBox>}
            {walkTime && <StyledBox className="walk-time"><Typography variant="body2"><FontAwesomeIcon icon={faClock} /> Estimated walk time: {walkTime}</Typography></StyledBox>}
          </StyledBox>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

DetailedCard.propTypes = {
  schoolData: PropTypes.shape({
    namn: PropTypes.string.isRequired,
    adress: PropTypes.string.isRequired,
    pdfData: PropTypes.object,
    schoolDetails: PropTypes.object,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  walkTime: PropTypes.string,
};

export default DetailedCard;
