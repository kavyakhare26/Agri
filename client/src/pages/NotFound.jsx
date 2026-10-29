import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container className="py-5 text-center">
      <Card className="border-0 shadow-sm p-5 max-w-600 mx-auto">
        <Card.Body>
          <div className="display-1 mb-3">🌾 404</div>
          <h2 className="fw-bold text-success mb-2">Field Not Found</h2>
          <p className="text-muted mb-4">
            The page you're searching for seems to have wandered off the farm map or doesn't exist.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/" className="btn btn-outline-success px-4 py-2">
              Home Page
            </Link>
            <Link to="/dashboard" className="btn btn-success px-4 py-2">
              Farmer Dashboard
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default NotFound;

