import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SurveyForm.css'; // Separat CSS-fil för SurveyForm-styling

const SurveyForm = () => {
  const [questions, setQuestions] = useState([]);
  const [forskoleverksamheter, setForskoleverksamheter] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedForskoleverksamhet, setSelectedForskoleverksamhet] = useState('');
  const [responsePercentages, setResponsePercentages] = useState(null);

  useEffect(() => {
    // Fetch questions
    axios.get('https://masterkinder20240523125154.azurewebsites.net//api/survey/questions')
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the questions!', error);
      });

    // Fetch forskoleverksamheter
    axios.get('https://masterkinder20240523125154.azurewebsites.net//api/survey/forskoleverksamheter')
      .then(response => {
        setForskoleverksamheter(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the forskoleverksamheter!', error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestData = {
      selectedQuestion,
      selectedForskoleverksamhet
    };

    axios.post('https://localhost:7270/api/survey/response-percentages', requestData)
      .then(response => {
        // Format response percentages to integers and add % sign
        const formattedResponse = Object.fromEntries(
          Object.entries(response.data).map(([key, value]) => [key, `${Math.round(value)}%`])
        );
        setResponsePercentages(formattedResponse);
      })
      .catch(error => {
        console.error('There was an error calculating the response percentages!', error);
      });
  };

  return (
    <div className="survey-container">
      
      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-group">
          <label htmlFor="questionSelect">Välj Fråga:</label>
          <select
            id="questionSelect"
            value={selectedQuestion}
            onChange={e => setSelectedQuestion(e.target.value)}
          >
            <option value="">-- Select a question --</option>
            {questions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="forskoleverksamhetSelect">Välj Förskoleverksamhet:</label>
          <select
            id="forskoleverksamhetSelect"
            value={selectedForskoleverksamhet}
            onChange={e => setSelectedForskoleverksamhet(e.target.value)}
          >
            <option value="">-- Select Förskoleverksamhet --</option>
            {forskoleverksamheter.map((item, index) => (
              <option key={index} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">Sök</button>
      </form>

      {responsePercentages && (
        <div className="response-percentages">
          <h2>Svar</h2>
          <pre>{JSON.stringify(responsePercentages, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SurveyForm;
