import React from 'react';
import PropTypes from 'prop-types';

const DetailedCard = ({ schoolData, onClose }) => {
  console.log('DetailedCard data:', schoolData);

  return (
    <div className="detailed-card">
      <div className="detailed-card-content">
        <button onClick={onClose}>×</button>
        <h2>{schoolData.name}</h2>
        <p>{schoolData.vicinity}</p>
        {schoolData.pdfData && schoolData.pdfData.$values && schoolData.pdfData.$values.length > 0 && (
          <div>
          
            
            <p>Helhetsomdome: {schoolData.pdfData.$values[0].helhetsomdome}</p>
            <p>Svarsfrekvens: {schoolData.pdfData.$values[0].svarsfrekvens}</p>
          </div>
        )}
        {schoolData.schoolDetails && schoolData.schoolDetails.$values && schoolData.schoolDetails.$values.length > 0 && (
          <div>
            <h3>School Address Details:</h3>
            <p>Typ av Service: {schoolData.schoolDetails.$values[0].typAvService}</p>
            <p>Verksam i: {schoolData.schoolDetails.$values[0].verksamI}</p>
            <p>Organisationsform: {schoolData.schoolDetails.$values[0].organisationsform}</p>
            <p>Antal Barn: {schoolData.schoolDetails.$values[0].antalBarn}</p>
            <p>Antal Barn per Årsarbetare: {schoolData.schoolDetails.$values[0].antalBarnPerArsarbetare}</p>
            <p>Andel Legitimerade Förskollärare: {schoolData.schoolDetails.$values[0].andelLegitimeradeForskollarare}</p>
            <p>Webbplats: <a href={schoolData.schoolDetails.$values[0].webbplats} target="_blank" rel="noopener noreferrer">{schoolData.schoolDetails.$values[0].webbplats}</a></p>
            <p>Inriktning och Profil: {schoolData.schoolDetails.$values[0].inriktningOchProfil}</p>
           
            <p>Mer om Oss: {schoolData.schoolDetails.$values[0].merOmOss}</p>
          </div>
        )}
        {schoolData.schoolDetails && schoolData.schoolDetails.$values && schoolData.schoolDetails.$values[0].kontakter && schoolData.schoolDetails.$values[0].kontakter.$values.length > 0 && (
          <div>
            <h3>Kontaktinformation:</h3>
            {schoolData.schoolDetails.$values[0].kontakter.$values.map((kontakt, index) => (
              <div key={index}>
                <p>Namn: {kontakt.namn}</p>
                <p>Roll: {kontakt.roll}</p>
                <p>Epost: {kontakt.epost}</p>
                <p>Telefon: {kontakt.telefon}</p>
              </div>
            ))}
          </div>
        )}
        {schoolData.address && <p>Address: {schoolData.address}</p>}
        {schoolData.description && <p>Description: {schoolData.description}</p>}
      </div>
    </div>
  );
};

DetailedCard.propTypes = {
  schoolData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    vicinity: PropTypes.string.isRequired,
    pdfData: PropTypes.object,
    schoolDetails: PropTypes.object,
    address: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailedCard;
