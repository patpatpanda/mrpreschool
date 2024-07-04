import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

const DetailedCard = ({ schoolData, onClose, walkTime }) => {
  const { namn, adress, pdfData, schoolDetails, description } = schoolData;

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {namn}
        <IconButton onClick={onClose} style={{ position: 'absolute', right: 10, top: 10 }}>
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          <FontAwesomeIcon icon={faMapMarkerAlt} /> {adress}
        </Typography>
        {pdfData && (
          <div className="pdf-details">
            <Typography variant="body2">Helhetsomdome: {pdfData.helhetsomdome}%</Typography>
            <Typography variant="body2">Svarsfrekvens: {pdfData.svarsfrekvens}%</Typography>
          </div>
        )}
        {schoolDetails && (
          <div className="school-details">
            <Typography variant="h3">School Address Details:</Typography>
            <Typography variant="body2">Typ av Service: {schoolDetails.typAvService}</Typography>
            <Typography variant="body2">Verksam i: {schoolDetails.verksamI}</Typography>
            <Typography variant="body2">Organisationsform: {schoolDetails.organisationsform}</Typography>
            <Typography variant="body2">Antal Barn: {schoolDetails.antalBarn}</Typography>
            <Typography variant="body2">Antal Barn per Årsarbetare: {schoolDetails.antalBarnPerArsarbetare}</Typography>
            <Typography variant="body2">Andel Legitimerade Förskollärare: {schoolDetails.andelLegitimeradeForskollarare} %</Typography>
            <Typography variant="body2">Webbplats: <a href={schoolDetails.webbplats} target="_blank" rel="noopener noreferrer">{schoolDetails.webbplats}</a></Typography>
            <Typography variant="body2">Inriktning och Profil: {schoolDetails.inriktningOchProfil}</Typography>
            <Typography variant="body2">Mer om Oss: {schoolDetails.merOmOss}</Typography>
          </div>
        )}
        {schoolDetails && schoolDetails.kontakter && schoolDetails.kontakter.$values && schoolDetails.kontakter.$values.length > 0 && (
          <div className="contacts">
            <Typography variant="h3">Kontaktinformation:</Typography>
            {schoolDetails.kontakter.$values.map((kontakt, index) => (
              <div key={index} className="contact-card">
                <Typography variant="body2">Namn: {kontakt.namn}</Typography>
                <Typography variant="body2">Roll: {kontakt.roll}</Typography>
                <Typography variant="body2">Epost: {kontakt.epost}</Typography>
                <Typography variant="body2">Telefon: {kontakt.telefon}</Typography>
              </div>
            ))}
          </div>
        )}
        {description && <Typography variant="body2" className="description">{description}</Typography>}
        {walkTime && <Typography variant="body2" className="walk-time"><FontAwesomeIcon icon={faClock} /> Estimated walk time: {walkTime}</Typography>}
      </DialogContent>
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
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  walkTime: PropTypes.string,
};

export default DetailedCard;
