import React from 'react';
import PropTypes from 'prop-types';

const DetailedCard = ({ schoolData, onClose }) => {
  console.log('DetailedCard data:', schoolData);

  const { namn, adress, pdfData, schoolDetails, description } = schoolData;

  return (
    <div className="detailed-card">
      <div className="detailed-card-content">
        <button onClick={onClose}>×</button>
        <h2>{namn}</h2>
        <p>{adress}</p>
        {pdfData && (
          <div>
            <p>Helhetsomdome: {pdfData.helhetsomdome}</p>
            <p>Svarsfrekvens: {pdfData.svarsfrekvens}</p>
          </div>
        )}
        {schoolDetails && (
          <div>
            <h3>School Address Details:</h3>
            <p>Typ av Service: {schoolDetails.typAvService}</p>
            <p>Verksam i: {schoolDetails.verksamI}</p>
            <p>Organisationsform: {schoolDetails.organisationsform}</p>
            <p>Antal Barn: {schoolDetails.antalBarn}</p>
            <p>Antal Barn per Årsarbetare: {schoolDetails.antalBarnPerArsarbetare}</p>
            <p>Andel Legitimerade Förskollärare: {schoolDetails.andelLegitimeradeForskollarare} % </p>
            <p>Webbplats: <a href={schoolDetails.webbplats} target="_blank" rel="noopener noreferrer">{schoolDetails.webbplats}</a></p>
            <p>Inriktning och Profil: {schoolDetails.inriktningOchProfil}</p>
            <p>Mer om Oss: {schoolDetails.merOmOss}</p>
          </div>
        )}
        {schoolDetails && schoolDetails.kontakter && schoolDetails.kontakter.$values && schoolDetails.kontakter.$values.length > 0 && (
          <div>
            <h3>Kontaktinformation:</h3>
            {schoolDetails.kontakter.$values.map((kontakt, index) => (
              <div key={index}>
                <p>Namn: {kontakt.namn}</p>
                <p>Roll: {kontakt.roll}</p>
                <p>Epost: {kontakt.epost}</p>
                <p>Telefon: {kontakt.telefon}</p>
              </div>
            ))}
          </div>
        )}
        {adress && <p>Address: {adress}</p>}
        {description && <p>Description: {description}</p>}
      </div>
    </div>
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
};

export default DetailedCard;
