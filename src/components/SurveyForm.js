import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SurveyForm.css';

const SurveyForm = () => {
  const [questions, setQuestions] = useState([]);
  const [forskoleverksamheter, setForskoleverksamheter] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedForskoleverksamhet, setSelectedForskoleverksamhet] = useState('');
  const [responsePercentages, setResponsePercentages] = useState(null);
  const [responseCount, setResponseCount] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'https://masterkinder20240523125154.azurewebsites.net/api';

  useEffect(() => {
    axios.get(`${apiUrl}/survey/questions`)
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the questions!', error);
      });

    axios.get(`${apiUrl}/survey/forskoleverksamheter`)
      .then(response => {
        setForskoleverksamheter(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the forskoleverksamheter!', error);
      });
  }, [apiUrl]);

  useEffect(() => {
    if (selectedQuestion && selectedForskoleverksamhet) {
      axios.get(`${apiUrl}/survey/response-count`, {
        params: {
          question: selectedQuestion,
          forskoleverksamhet: selectedForskoleverksamhet
        }
      })
        .then(response => {
          setResponseCount(response.data.count);
        })
        .catch(error => {
          console.error('There was an error fetching the response count!', error);
        });
    }
  }, [selectedQuestion, selectedForskoleverksamhet, apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/survey/response-percentages`, {
        selectedQuestion,
        selectedForskoleverksamhet
      });
      const formattedResponse = Object.fromEntries(
        Object.entries(response.data).map(([key, value]) => [key, `${Math.round(value)}%`])
      );
      setResponsePercentages(formattedResponse);
    } catch (error) {
      console.error('There was an error calculating the response percentages!', error);
      alert('Något gick fel vid beräkningen av svaren. Vänligen försök igen senare.');
    }
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

      {responseCount !== null && (
        <div className="response-count">
          <h2>Antal svar: {responseCount}</h2>
        </div>
      )}

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