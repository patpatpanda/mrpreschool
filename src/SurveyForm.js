import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const SurveyForm = () => {
  const [questions, setQuestions] = useState([]);
  const [forskoleverksamheter, setForskoleverksamheter] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedForskoleverksamhet, setSelectedForskoleverksamhet] = useState('');
  const [responsePercentages, setResponsePercentages] = useState(null);

  useEffect(() => {
    // Fetch questions
    axios.get('https://localhost:7270/api/survey/questions')
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the questions!', error);
      });

    // Fetch forskoleverksamheter
    axios.get('https://localhost:7270/api/survey/forskoleverksamheter')
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
        setResponsePercentages(response.data);
      })
      .catch(error => {
        console.error('There was an error calculating the response percentages!', error);
      });
  };

  return (
    <div className="survey-container">
      <h1>Survey Form</h1>
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
          <h2>Response Percentages</h2>
          <pre>{JSON.stringify(responsePercentages, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SurveyForm;