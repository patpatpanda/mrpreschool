import React from 'react';
import PropTypes from 'prop-types';

const DetailedCard = ({ schoolData, onClose }) => {
  console.log('DetailedCard data:', schoolData);

  return (
    <div className="detailed-card">
      <div className="detailed-card-content">
        <button onClick={onClose}>×</button>
        <h2>{schoolData.namn}</h2>
        <p>{schoolData.adress}</p>
        {schoolData.pdfData && (
          <div>
            <p>Helhetsomdome: {schoolData.pdfData.helhetsomdome}</p>
            <p>Svarsfrekvens: {schoolData.pdfData.svarsfrekvens}</p>
            <p>Antal Svar: {schoolData.pdfData.antalSvar}st</p>
          </div>
        )}
        {schoolData.typAvService && <p>Typ av Service: {schoolData.typAvService}</p>}
        {schoolData.verksamI && <p>Verksam i: {schoolData.verksamI}</p>}
        {schoolData.organisationsform && <p>Organisationsform: {schoolData.organisationsform}</p>}
        {schoolData.antalBarn && <p>Antal Barn: {schoolData.antalBarn}</p>}
        {schoolData.antalBarnPerArsarbetare && <p>Antal Barn per Årsarbetare: {schoolData.antalBarnPerArsarbetare}</p>}
        {schoolData.andelLegitimeradeForskollarare && <p>Andel Legitimerade Förskollärare: {schoolData.andelLegitimeradeForskollarare} %</p>}
        {schoolData.webbplats && <p>Webbplats: <a href={schoolData.webbplats} target="_blank" rel="noopener noreferrer">{schoolData.webbplats}</a></p>}
        {schoolData.inriktningOchProfil && <p>Inriktning och Profil: {schoolData.inriktningOchProfil}</p>}
        {schoolData.merOmOss && <p>Mer om Oss: {schoolData.merOmOss}</p>}
        {schoolData.kontakter && schoolData.kontakter.$values && schoolData.kontakter.$values.length > 0 && (
          <div>
            <h3>Kontaktinformation:</h3>
            {schoolData.kontakter.$values.map((kontakt, index) => (
              <div key={index}>
                <p>Namn: {kontakt.namn}</p>
                <p>Roll: {kontakt.roll}</p>
                <p>Epost: {kontakt.epost}</p>
                <p>Telefon: {kontakt.telefon}</p>
              </div>
            ))}
          </div>
        )}
        {schoolData.adress && <p>Address: {schoolData.adress}</p>}
        {schoolData.description && <p>Description: {schoolData.description}</p>}
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
    typAvService: PropTypes.string,
    verksamI: PropTypes.string,
    organisationsform: PropTypes.string,
    antalBarn: PropTypes.number,
    antalBarnPerArsarbetare: PropTypes.number,
    andelLegitimeradeForskollarare: PropTypes.number,
    webbplats: PropTypes.string,
    inriktningOchProfil: PropTypes.string,
    inneOchUtemiljo: PropTypes.string,
    kostOchMaltider: PropTypes.string,
    malOchVision: PropTypes.string,
    merOmOss: PropTypes.string,
    kontakter: PropTypes.object,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DetailedCard;
