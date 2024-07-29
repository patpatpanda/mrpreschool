import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Grid } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/material/styles';
import myImage from '../images/seri.webp'; // Importera din standardbild

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
  overflowY: 'auto', // Gör innehållet scrollbart
  maxHeight: '70vh', // Sätt en maxhöjd för innehållet
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  borderRadius: '10px',
  overflow: 'hidden',
  marginBottom: '20px',
  img: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  [theme.breakpoints.down('sm')]: {
    img: {
      width: '100%',
      height: 'auto',
    },
  },
}));

const DetailedCard = ({ schoolData, onClose }) => {
  const { namn, adress, malibuData, schoolDetails, description, walkingTime } = schoolData;
  const bildUrl = schoolData.bildUrl; // Korrekt fält från API-svaret

  useEffect(() => {
    console.log('DetailedCard mounted with schoolData:', schoolData);
  }, [schoolData]);

  const isAbsoluteUrl = (url) => /^(?:[a-z]+:)?\/\//i.test(url);
  const imageUrl = bildUrl && isAbsoluteUrl(bildUrl) ? bildUrl : myImage;

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: '15px', // Lägg till border-radius här
        },
      }}
    >
      <StyledDialogTitle>
        {namn}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 10, top: 10, color: '#ffffff' }}>
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <StyledBox>
          <ImageContainer>
            <img src={imageUrl} alt={`${namn}`} />
          </ImageContainer>
          {walkingTime && (
            <Box mt={2} mb={2}>
              <Typography variant="body2"><FontAwesomeIcon icon={faClock} /> Beräknad gångtid: {walkingTime} minuter</Typography>
            </Box>
          )}
          {adress && (
            <Typography variant="h6" gutterBottom>
              <FontAwesomeIcon icon={faMapMarkerAlt} /> {adress}
            </Typography>
          )}
          <Grid container spacing={2}>
            {malibuData && (
              <Grid item xs={12}>
                <StyledBox>
                  <Typography variant="subtitle1">Helhetsomdöme: {malibuData.helhetsomdome}%</Typography>
                  <Typography variant="subtitle1">Svarsfrekvens: {malibuData.svarsfrekvens}%</Typography>
                  <Typography variant="subtitle1">Antal Svar: {malibuData.antalSvar}</Typography>
                </StyledBox>
                {malibuData.questions && malibuData.questions.$values && (
                  <StyledBox>
                    <Typography variant="h6" gutterBottom>Frågor</Typography>
                    {malibuData.questions.$values.map((question, index) => (
                      <Box key={index} mb={2}>
                        <Typography variant="body2">Fråga: {question.frageText}</Typography>
                        <Typography variant="body2">Andel Instämmer: {question.andelInstammer}%</Typography>
                        <Typography variant="body2">År: {question.year}</Typography>
                        {question.frageText.includes('HELHETSOMDÖME') && (
                          <Typography variant="body2">
                            Denna fråga avser det övergripande omdömet för {namn} under året {question.year}. Här ser vi att {question.andelInstammer}% av de tillfrågade är nöjda med förskolans helhetsintryck.
                          </Typography>
                        )}
                        {question.frageText.includes('UTVECKLING OCH LÄRANDE') && (
                          <Typography variant="body2">
                            Denna fråga handlar om utveckling och lärande på {namn} för året {question.year}. Resultatet visar att {question.andelInstammer}% av föräldrarna upplever att deras barn utvecklas och lär sig bra.
                          </Typography>
                        )}
                        {question.frageText.includes('NORMER OCH VÄRDEN') && (
                          <Typography variant="body2">
                            Frågan om normer och värden på {namn} för året {question.year} visar att {question.andelInstammer}% av de svarande instämmer i att förskolan arbetar väl med dessa aspekter.
                          </Typography>
                        )}
                        {question.frageText.includes('SAMVERKAN MED HEMMET') && (
                          <Typography variant="body2">
                            Denna fråga belyser samverkan med hemmet för {namn} under året {question.year}. Här ser vi att {question.andelInstammer}% av föräldrarna tycker att samarbetet med förskolan fungerar bra.
                          </Typography>
                        )}
                        {question.frageText.includes('KOST, RÖRELSE OCH HÄLSA') && (
                          <Typography variant="body2">
                            Frågan om kost, rörelse och hälsa för {namn} under året {question.year} visar att {question.andelInstammer}% är nöjda med förskolans arbete inom dessa områden.
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </StyledBox>
                )}
              </Grid>
            )}
            {schoolDetails && (
              <Grid item xs={12}>
                <StyledBox>
                  <Typography variant="h6" gutterBottom>Skoldetaljer</Typography>
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
                      <Typography variant="body2">E-post: {kontakt.epost}</Typography>
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
        </StyledBox>
      </StyledDialogContent>
    </Dialog>
  );
};

DetailedCard.propTypes = {
  schoolData: PropTypes.shape({
    namn: PropTypes.string.isRequired,
    adress: PropTypes.string,
    malibuData: PropTypes.object,
    schoolDetails: PropTypes.object,
    description: PropTypes.string,
    walkingTime: PropTypes.string,
    bildUrl: PropTypes.string, // Lägg till BildUrl här
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailedCard;
