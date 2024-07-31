import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BlogList = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get('https://masterkinder20240523125154.azurewebsites.net/api/blog')
            .then(response => {
                // Kontrollera om response.data har en egenskap $values som är en array
                if (response.data && Array.isArray(response.data.$values)) {
                    setPosts(response.data.$values); // Sätt posts till den array som finns i $values
                } else {
                    console.error('Oväntat format på data:', response.data);
                    setPosts([]); // Sätt en tom array om data inte är i förväntat format
                }
            })
            .catch(error => console.error('Error fetching the posts:', error));
    }, []);

    return (
        <div>
            <h1>Blog Posts</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.content.substring(0, 100)}...</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BlogList;
