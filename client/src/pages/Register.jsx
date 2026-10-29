import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal'
];

function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', state: '', role: 'farmer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.phone || !form.state) {
      return 'Please fill in all required fields.';
    }
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    if (!/^\d{10}$/.test(form.phone)) {
      return 'Phone number must be 10 digits.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      await register(submitData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1b4332 0%, #52b788 100%)' }}
      className="d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <div className="text-center text-white mb-4">
              <div style={{ fontSize: '3rem' }}>🌾</div>
              <h2 className="fw-bold">{t('auth.registerSubtitle')}</h2>
            </div>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-4 text-center" style={{ color: 'var(--primary-dark)' }}>
                  {t('auth.register')}
                </h4>
                {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.name')} *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Your full name"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.email')} *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="email@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.password')} *</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          placeholder="Min 6 characters"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password *</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="Repeat password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.phone')} *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="10-digit number"
                          value={form.phone}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('auth.state')} *</Form.Label>
                        <Form.Select name="state" value={form.state} onChange={handleChange} required>
                          <option value="">Select state...</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-4">
                        <Form.Label>{t('auth.role')}</Form.Label>
                        <div className="d-flex gap-4">
                          <Form.Check
                            type="radio"
                            id="role-farmer"
                            name="role"
                            value="farmer"
                            label={`👨‍🌾 ${t('auth.farmer')}`}
                            checked={form.role === 'farmer'}
                            onChange={handleChange}
                          />
                          <Form.Check
                            type="radio"
                            id="role-admin"
                            name="role"
                            value="admin"
                            label={`👔 ${t('auth.admin')}`}
                            checked={form.role === 'admin'}
                            onChange={handleChange}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    type="submit"
                    className="w-100 btn-primary py-2 fw-bold"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : t('auth.registerBtn')}
                  </Button>
                </Form>
                <hr />
                <p className="text-center mb-0">
                  {t('auth.haveAccount')}{' '}
                  <Link to="/login" style={{ color: 'var(--primary)' }}>
                    {t('auth.login')}
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

export default Register;
