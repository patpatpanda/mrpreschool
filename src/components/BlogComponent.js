import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BlogComponent = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('https://masterkinder20240523125154.azurewebsites.net/api/blog/posts');
        setPosts(response.data);
      } catch (err) {
        setError('Failed to fetch posts: ' + err.message);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Blog Posts</h2>
      {error && <p>{error}</p>}
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default BlogComponent;
