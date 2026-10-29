import React from 'react';
import { Spinner } from 'react-bootstrap';

function LoadingSpinner({ size = 'lg', text = 'Loading...' }) {
  return (
    <div className="loading-overlay flex-column gap-2">
      <Spinner animation="border" variant="success" size={size} role="status">
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {text && <p className="text-muted mt-2 mb-0">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
