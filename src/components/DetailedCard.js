import React from 'react';
import PropTypes from 'prop-types';
import '../styles/DetailedCard.css';

const DetailedCard = ({ schoolData, onClose }) => {
  return (
    <div className="detailed-card">
      <button className="close-button" onClick={onClose}>Stäng</button>
      <h2>{schoolData.schoolName}</h2>
      <p>Adress: {schoolData.address}</p>
      <p>Helhetsomdöme: {schoolData.helhetsomdome}%</p>
      <p>Antal svar: {schoolData.totalResponses}</p>
      <p>Svarsfrekvens: {schoolData.svarsfrekvens}%</p>
      <p>Antal barn på förskolan: {schoolData.antalBarn}</p>
      <p>Beskrivning: {schoolData.description}</p>
      <p>Kontaktperson: {schoolData.principal}</p>
      <p>E-post: {schoolData.email}</p>
      <p>Telefon: {schoolData.phone}</p>
      <p>Webbplats: <a href={schoolData.website} target="_blank" rel="noopener noreferrer">{schoolData.website}</a></p>
      <p>Typ av service: {schoolData.typeOfService}</p>
      <p>Verksamhetsområde: {schoolData.operatingArea}</p>
      <p>Organisationsform: {schoolData.organizationForm}</p>
      <p>Andel legitimerade förskollärare: {schoolData.percentageOfLicensedTeachers}%</p>
      <p>Inomhusbeskrivning: {schoolData.indoorDescription}</p>
      <p>Utomhusbeskrivning: {schoolData.outdoorDescription}</p>
      <p>Mat och måltider: {schoolData.foodAndMealsDescription}</p>
      <p>Mål och vision: {schoolData.goalsAndVisionDescription}</p>
      <p>Inriktning och profil: {schoolData.orientationAndProfile}</p>
      <p>Tillgänglighet: {schoolData.accessibility}</p>

      <h3>Responsdata</h3>
      {schoolData.responses && schoolData.responses.length > 0 ? (
        <ul>
          {schoolData.responses.map(response => (
            <li key={response.responseId}>
              <p><strong>Kategori:</strong> {response.category}</p>
              <p><strong>Fråga:</strong> {response.question}</p>
              <p><strong>Procent:</strong> {response.percentage}%</p>
              <p><strong>År:</strong> {response.year}</p>
              {response.gender && <p><strong>Kön:</strong> {response.gender}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Ingen responsdata tillgänglig</p>
      )}
    </div>
  );
};

DetailedCard.propTypes = {
  schoolData: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
};

export default DetailedCard;
