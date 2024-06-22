import React, { useState } from 'react';
import axios from 'axios';

const AddSchool = () => {
  const [schoolName, setSchoolName] = useState('');
  const [totalResponses, setTotalResponses] = useState(0);
  const [satisfactionPercentage, setSatisfactionPercentage] = useState(0);
  const [responses, setResponses] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'schoolName') setSchoolName(value);
    if (name === 'totalResponses') setTotalResponses(Number(value));
    if (name === 'satisfactionPercentage') setSatisfactionPercentage(Number(value));
  };

  const handleAddResponse = () => {
    setResponses([...responses, { question: '', percentage: 0, gender: '', year: '' }]);
  };

  const handleResponseChange = (index, e) => {
    const { name, value } = e.target;
    const newResponses = [...responses];
    newResponses[index][name] = name === 'percentage' ? Number(value) : value;
    setResponses(newResponses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://masterkinder20240523125154.azurewebsites.net/api/schools', {
        schoolName,
        totalResponses,
        satisfactionPercentage,
        responses
      });
      if (response.status === 200 || response.status === 201) {
        setSuccessMessage('Förskolan har lagts till framgångsrikt!');
        setErrorMessage('');
        setSchoolName('');
        setTotalResponses(0);
        setSatisfactionPercentage(0);
        setResponses([]);
      } else {
        setErrorMessage('Något gick fel. Försök igen.');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Något gick fel. Försök igen.');
      setSuccessMessage('');
    }
  };

  return (
    <div>
      <h2>Lägg till ny förskola</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="schoolName">Förskolans namn:</label>
          <input type="text" id="schoolName" name="schoolName" value={schoolName} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="totalResponses">Totalt antal svar:</label>
          <input type="number" id="totalResponses" name="totalResponses" value={totalResponses} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="satisfactionPercentage">Nöjdhetsprocent:</label>
          <input type="number" id="satisfactionPercentage" name="satisfactionPercentage" value={satisfactionPercentage} onChange={handleInputChange} required />
        </div>
        <h3>Enkätsvar</h3>
        {responses.map((response, index) => (
          <div key={index}>
            <label>Fråga:</label>
            <input type="text" name="question" value={response.question} onChange={(e) => handleResponseChange(index, e)} required />
            <label>Procent:</label>
            <input type="number" name="percentage" value={response.percentage} onChange={(e) => handleResponseChange(index, e)} required />
            <label>Kön:</label>
            <input type="text" name="gender" value={response.gender} onChange={(e) => handleResponseChange(index, e)} required />
            <label>År:</label>
            <input type="text" name="year" value={response.year} onChange={(e) => handleResponseChange(index, e)} required />
          </div>
        ))}
        <button type="button" onClick={handleAddResponse}>Lägg till enkätsvar</button>
        <button type="submit">Lägg till</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default AddSchool;
