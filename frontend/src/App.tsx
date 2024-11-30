import { useState } from 'react';
import './App.css';

function App() {
  const fetchData = () => {
    fetch('http://localhost:8080/')
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => console.error('Error fetching data:', error));
  };
  const [message, setMessage] = useState<string>('');

  return (
    <>
      <button onClick={fetchData}>Click to fetch from Go server</button>
      {message && (
        <div>
          <h2>Server Response:</h2>
          <p>{message}</p>
        </div>
      )}
    </>
  );
}

export default App;
