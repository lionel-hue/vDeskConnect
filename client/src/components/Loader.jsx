// components/Loader.jsx
import React from 'react';
import '../style/loader.css';

const Loader = ({ message = "Processing..." }) => {
    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <div className="hourglass-loader">
                    <div className="hourglass-top"></div>
                    <div className="hourglass-bottom"></div>
                    <div className="hourglass-sand"></div>
                </div>
                <div className="loader-message">{message}</div>
            </div>
        </div>
    );
};

export default Loader;