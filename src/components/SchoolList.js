import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../styles/SchoolList.css';

const SchoolList = ({ onSelect }) => {
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('https://masterkinder20240523125154.azurewebsites.net/api/schools');
        setSchools(response.data);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };

    fetchSchools();
  }, []);

  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="school-list">
      <input
        type="text"
        placeholder="Sök förskola..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="school-list-container">
        {filteredSchools.map((school) => (
          <div key={school.schoolId} className="school-item" onClick={() => onSelect(school)}>
            <h3>{school.schoolName}</h3>
            <p>{`Svarsfrekvens: ${school.satisfactionPercentage}%`}</p>
            <p>{`Antal svar: ${school.totalResponses}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

SchoolList.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default SchoolList;
