import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1b4332 0%, #52b788 100%)' }}
      className="d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <div className="text-center text-white mb-4">
              <div style={{ fontSize: '3rem' }}>🌾</div>
              <h2 className="fw-bold">{t('auth.welcome')}</h2>
              <p className="opacity-75">{t('auth.loginSubtitle')}</p>
            </div>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4 text-center" style={{ color: 'var(--primary-dark)' }}>
                  {t('auth.login')}
                </h4>
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('auth.email')}</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="farmer@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>{t('auth.password')}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    className="w-100 btn-primary py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : t('auth.loginBtn')}
                  </Button>
                </Form>
                <hr />
                <p className="text-center mb-0">
                  {t('auth.noAccount')}{' '}
                  <Link to="/register" style={{ color: 'var(--primary)' }}>
                    {t('nav.register')}
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
