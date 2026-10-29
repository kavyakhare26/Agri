import React from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🌾', title: 'Smart Farm Management', desc: 'Track all your farms, crops, and soil health in one place with intelligent insights.' },
  { icon: '🌤️', title: 'Weather Forecasting', desc: 'Real-time weather data and 5-day forecasts tailored for your farm location.' },
  { icon: '🐛', title: 'Pest Alert System', desc: 'AI-powered pest detection and early warning alerts to protect your crops.' },
  { icon: '🧪', title: 'Soil Health Analysis', desc: 'Monitor NPK levels, pH, and moisture with personalized recommendations.' },
  { icon: '🛒', title: 'Resource Marketplace', desc: 'Buy quality seeds, fertilizers, and tools at competitive prices with doorstep delivery.' },
  { icon: '👨‍🌾', title: 'Expert Consultation', desc: 'Connect directly with agricultural experts for personalized advice and guidance.' },
];

const testimonials = [
  { name: 'Ramesh Patel', state: 'Gujarat', text: 'AgriConnect helped me increase my wheat yield by 40% with their soil recommendations!', avatar: '👨‍🌾' },
  { name: 'Sunita Devi', state: 'Punjab', text: 'The pest alert system saved my cotton crop. I got the warning just in time!', avatar: '👩‍🌾' },
  { name: 'Manoj Kumar', state: 'Maharashtra', text: 'Expert consultation gave me the guidance I needed. Very helpful platform.', avatar: '🧑‍🌾' },
];

const stats = [
  { number: '50,000+', label: 'Farmers Connected' },
  { number: '1.2L', label: 'Hectares Managed' },
  { number: '98%', label: 'Satisfaction Rate' },
  { number: '500+', label: 'Experts Available' },
];

function Landing() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7} className="mb-4 mb-lg-0">
              <Badge bg="warning" text="dark" className="mb-3 px-3 py-2">
                🇮🇳 Built for Indian Farmers
              </Badge>
              <h1 className="mb-4">
                Smart Farming for a{' '}
                <span style={{ color: '#95d5b2' }}>Better Harvest</span>
              </h1>
              <p className="lead mb-4 opacity-75">
                AgriConnect empowers Indian farmers with technology — from soil analysis and weather forecasting to pest alerts and expert guidance. Grow smarter, harvest better.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Button as={Link} to="/dashboard" size="lg" variant="warning" className="px-4 fw-bold">
                    Go to Dashboard →
                  </Button>
                ) : (
                  <>
                    <Button as={Link} to="/register" size="lg" variant="warning" className="px-4 fw-bold">
                      Get Started Free
                    </Button>
                    <Button as={Link} to="/login" size="lg" variant="outline-light" className="px-4">
                      Login
                    </Button>
                  </>
                )}
              </div>
            </Col>
            <Col lg={5} className="text-center">
              <div style={{ fontSize: '8rem', lineHeight: 1 }}>🌾</div>
              <p className="mt-3 opacity-75">Trusted by farmers across India</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Row */}
      <section style={{ background: '#1b4332', color: 'white' }} className="py-4">
        <Container>
          <Row className="text-center">
            {stats.map((stat) => (
              <Col xs={6} md={3} key={stat.label} className="py-2">
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#95d5b2' }}>{stat.number}</div>
                <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>{stat.label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5" style={{ background: 'var(--bg)' }}>
        <Container>
          <div className="text-center mb-5">
            <Badge bg="success" className="mb-2 px-3">Features</Badge>
            <h2 className="fw-bold" style={{ color: 'var(--primary-dark)' }}>
              Everything You Need to Farm Smarter
            </h2>
            <p className="text-muted">Comprehensive tools designed specifically for Indian agricultural conditions</p>
          </div>
          <Row className="g-4">
            {features.map((feature) => (
              <Col xs={12} sm={6} lg={4} key={feature.title}>
                <div className="feature-card h-100">
                  <div className="feature-icon">{feature.icon}</div>
                  <h5 className="fw-bold mb-2" style={{ color: 'var(--primary-dark)' }}>{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-5" style={{ background: '#f0f7f4' }}>
        <Container>
          <div className="text-center mb-5">
            <Badge bg="success" className="mb-2 px-3">Testimonials</Badge>
            <h2 className="fw-bold" style={{ color: 'var(--primary-dark)' }}>
              What Farmers Say
            </h2>
          </div>
          <Row className="g-4 justify-content-center">
            {testimonials.map((t) => (
              <Col md={4} key={t.name}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <p className="mb-3" style={{ color: 'var(--text)', fontStyle: 'italic' }}>
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ fontSize: '2.5rem' }}>{t.avatar}</div>
                      <div>
                        <div className="fw-bold">{t.name}</div>
                        <div className="text-muted small">{t.state}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-5 text-center" style={{ background: 'var(--primary)', color: 'white' }}>
        <Container>
          <h2 className="fw-bold mb-3">Ready to Transform Your Farm?</h2>
          <p className="lead opacity-75 mb-4">
            Join 50,000+ farmers already using AgriConnect to grow smarter.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {!isAuthenticated && (
              <Button as={Link} to="/register" size="lg" variant="warning" className="px-5 fw-bold">
                Start for Free Today
              </Button>
            )}
            <Button as={Link} to="/forum" size="lg" variant="outline-light" className="px-5">
              Explore Community
            </Button>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--primary-dark)', color: '#b7e4c7' }} className="py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <span className="fw-bold" style={{ fontSize: '1.2rem' }}>🌾 AgriConnect</span>
              <span className="ms-3 opacity-75 small">Smart Farming for India</span>
            </Col>
            <Col md={6} className="text-md-end mt-2 mt-md-0">
              <span className="opacity-75 small">© 2024 AgriConnect. All rights reserved.</span>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default Landing;
