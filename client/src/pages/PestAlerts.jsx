import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Form, InputGroup, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function PestAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionSearch, setRegionSearch] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (severityFilter) params.append('severity', severityFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (regionSearch) params.append('region', regionSearch);

      const res = await API.get(`/pest-alerts?${params.toString()}`);
      setAlerts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load pest alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, typeFilter, regionSearch]);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return <Badge bg="danger" className="px-3 py-1 text-uppercase">Critical Hazard</Badge>;
      case 'high':
        return <Badge bg="danger" className="px-3 py-1 text-uppercase" style={{ backgroundColor: '#e76f51' }}>High Risk</Badge>;
      case 'medium':
        return <Badge bg="warning" text="dark" className="px-3 py-1 text-uppercase">Moderate</Badge>;
      case 'low':
        return <Badge bg="success" className="px-3 py-1 text-uppercase">Advisory / Low</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-1">Notice</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'fungal': return '🍄 Fungal Pathogen';
      case 'bacterial': return '🦠 Bacterial Blight';
      case 'insect': return '🐛 Insect Pest';
      case 'weed': return '🌿 Invasive Weed';
      case 'drought': return '☀️ Drought Stress';
      case 'flood': return '🌊 Waterlogging / Flood';
      default: return '⚠️ General Hazard';
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold text-danger mb-1">🚨 Agricultural Pest & Disease Surveillance</h2>
        <p className="text-muted mb-0">Official advisories, meteorological risk warnings, and preventive countermeasures for your region</p>
      </div>

      {/* Filter Row */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={4}>
              <Form.Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All Severity Levels</option>
                <option value="critical">Critical Hazards</option>
                <option value="high">High Risk</option>
                <option value="medium">Moderate Risk</option>
                <option value="low">Low / Advisory</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Threat Types</option>
                <option value="fungal">Fungal</option>
                <option value="insect">Insect / Pest</option>
                <option value="bacterial">Bacterial</option>
                <option value="flood">Waterlogging & Flood</option>
                <option value="drought">Drought & Heat</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>📍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filter by Region / State..."
                  value={regionSearch}
                  onChange={(e) => setRegionSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : alerts.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">🛡️</div>
            <h5>No Active Alerts Found</h5>
            <p className="text-muted mb-0">No pest or disease outbreak warnings match your current filters.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} className="g-4">
          {alerts.map((alert) => (
            <Col key={alert._id}>
              <Card className="h-100 shadow-sm border-0 border-start border-4 border-danger">
                <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold text-secondary small">
                    {getTypeIcon(alert.type)}
                  </span>
                  {getSeverityBadge(alert.severity)}
                </Card.Header>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-dark mb-2">{alert.title}</h5>
                    <p className="text-secondary mb-3">{alert.description}</p>

                    <div className="mb-3 d-flex flex-wrap gap-2">
                      {alert.region && (
                        <Badge bg="light" text="dark" className="border">
                          📍 {alert.region}
                        </Badge>
                      )}
                      {alert.autoGenerated ? (
                        <Badge bg="info" text="dark">
                          🤖 Weather-Generated
                        </Badge>
                      ) : (
                        <Badge bg="dark">
                          👨‍🌾 Agronomist Verified
                        </Badge>
                      )}
                    </div>

                    {alert.affectedCrops?.length > 0 && (
                      <div className="bg-light p-2 rounded small mb-2">
                        <strong>Affected Crops:</strong> {alert.affectedCrops.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="text-muted small border-top pt-2 mt-2 d-flex justify-content-between">
                    <span>Issued: {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Active'}</span>
                    {alert.postedBy?.name && <span>Source: {alert.postedBy.name}</span>}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default PestAlerts;

