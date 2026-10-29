import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function Weather() {
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [searchInput, setSearchInput] = useState('Pune, Maharashtra');
  const [weather, setWeather] = useState(null);
  const [pestAlerts, setPestAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (loc) => {
    try {
      setLoading(true);
      const res = await API.get(`/weather?location=${encodeURIComponent(loc || 'Pune, Maharashtra')}`);
      setWeather(res.data.data);
      setPestAlerts(res.data.pestAlerts || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(searchInput.trim());
    }
  };

  return (
    <Container className="py-4">
      {/* Top Header & Search */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">🌦️ Weather Forecast & Agricultural Advisory</h2>
          <p className="text-muted mb-0">Live meteorology, 5-day agro forecast, and automated disease hazard alerts</p>
        </div>
        <Form onSubmit={handleSearch} style={{ minWidth: '300px' }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search Indian city or district..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button variant="success" type="submit">
              Search
            </Button>
          </InputGroup>
        </Form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !weather ? (
        <Alert variant="warning">Unable to load weather forecast.</Alert>
      ) : (
        <>
          {/* Demo Banner Notification */}
          <Alert variant="info" className="d-flex align-items-center justify-content-between py-2 mb-4">
            <div>
              <strong>ℹ️ Demonstration Mode:</strong> OpenWeatherMap API key is unconfigured, utilizing realistic Indian agricultural meteorological data.
            </div>
            <Badge bg="dark">30m Cache Active</Badge>
          </Alert>

          {/* Current Weather Card */}
          <Card className="border-0 shadow-sm text-white mb-4" style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)' }}>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={7}>
                  <div className="d-flex align-items-center gap-3">
                    <span className="display-3">
                      {weather.current?.humidity > 80 ? '🌧️' : weather.current?.temp > 35 ? '☀️' : '⛅'}
                    </span>
                    <div>
                      <h1 className="display-4 fw-bold mb-0">{weather.current?.temp}°C</h1>
                      <h4 className="fw-semibold text-capitalize text-light mb-0">
                        {weather.current?.description}
                      </h4>
                      <p className="text-white-50 mb-0">📍 {weather.location}</p>
                    </div>
                  </div>
                </Col>
                <Col md={5} className="mt-3 mt-md-0 border-start-md border-light border-opacity-25 ps-md-4">
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="text-white-50 small">Feels Like</div>
                      <div className="fs-5 fw-bold">{weather.current?.feelsLike}°C</div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-white-50 small">Humidity</div>
                      <div className="fs-5 fw-bold">{weather.current?.humidity}%</div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-white-50 small">Wind Speed</div>
                      <div className="fs-5 fw-bold">{weather.current?.windSpeed} km/h</div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-white-50 small">Rain Probability</div>
                      <div className="fs-5 fw-bold">{weather.current?.rainProbability || 20}%</div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 5-Day Forecast Row */}
          <h5 className="fw-bold mb-3 text-success">📅 5-Day Farm Weather Forecast</h5>
          <Row xs={2} sm={3} md={5} className="g-3 mb-4">
            {weather.forecast?.map((day, idx) => (
              <Col key={idx}>
                <Card className="h-100 border-0 shadow-sm text-center p-3">
                  <div className="text-muted small fw-semibold">
                    {day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : `Day ${idx + 1}`}
                  </div>
                  <div className="fs-2 my-2">
                    {day.humidity > 80 ? '🌧️' : day.tempMax > 36 ? '☀️' : '⛅'}
                  </div>
                  <div className="fw-bold text-dark mb-1">
                    {day.tempMax}° / <span className="text-muted">{day.tempMin}°</span>
                  </div>
                  <div className="small text-muted text-capitalize text-truncate mb-2">
                    {day.description}
                  </div>
                  <Badge bg={day.rainProbability > 50 ? 'primary' : 'secondary'} className="px-2 py-1">
                    💧 {day.rainProbability}% Rain
                  </Badge>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Auto-generated Weather Hazards & Pest Alerts */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-danger">⚠️ Automated Pest & Weather Disease Hazards</h5>
                <small className="text-muted">Generated by meteorological thresholds for {weather.location}</small>
              </div>
              <Link to="/pest-alerts" className="btn btn-sm btn-outline-danger">
                View All Pest Alerts →
              </Link>
            </Card.Header>
            <Card.Body className="p-4">
              {pestAlerts.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <h5>🛡️ No active pest risks detected</h5>
                  <p className="mb-0">Weather conditions are currently within safe limits for primary crops.</p>
                </div>
              ) : (
                <Row className="g-3">
                  {pestAlerts.map((alert, i) => (
                    <Col md={6} key={i}>
                      <Card className="h-100 border-start border-4 border-danger shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-bold text-danger mb-0">{alert.title}</h6>
                            <Badge bg={alert.severity === 'critical' ? 'danger' : 'warning'} className="text-capitalize">
                              {alert.severity} Risk
                            </Badge>
                          </div>
                          <p className="small text-secondary mb-2">{alert.description}</p>
                          <div className="d-flex flex-wrap gap-2 align-items-center mt-3 pt-2 border-top">
                            <small className="text-muted">
                              <strong>Trigger:</strong> {alert.triggerCondition}
                            </small>
                            {alert.affectedCrops?.length > 0 && (
                              <small className="text-muted ms-auto">
                                🌾 Crops: {alert.affectedCrops.join(', ')}
                              </small>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default Weather;

