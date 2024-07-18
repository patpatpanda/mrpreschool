import React from 'react';

const Home = () => {

  const goToBlog = () => {
    window.location.href = 'https://localhost:7270/blog';
  };

  return (
    <div>
      <h1>Welcome to MasterKinder</h1>
      <button onClick={goToBlog}>Go to Blog</button>
    </div>
  );
};

export default Home;
