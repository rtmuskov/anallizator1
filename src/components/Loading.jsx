import React from 'react';
import './Loading.css';

const Loading = () => {
    return (
        <div className="loading">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
        </div>
    );
};

export default Loading; 