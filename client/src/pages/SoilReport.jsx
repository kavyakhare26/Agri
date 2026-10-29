import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { SoilBarChart, SoilHistoryChart } from '../components/charts/SoilChart';

function SoilReport() {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    pH: '',
    N: '',
    P: '',
    K: '',
    moisture: '',
  });

  // Fetch farms list
  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoading(true);
        const res = await API.get('/farms');
        const list = res.data.data || [];
        setFarms(list);
        if (list.length > 0) {
          setSelectedFarm(list[0]._id);
        }
      } catch (err) {
        toast.error('Failed to load farms');
      } finally {
        setLoading(false);
      }
    };
    loadFarms();
  }, []);

  // Fetch soil data whenever selectedFarm changes
  const fetchSoil = async (farmId) => {
    if (!farmId) return;
    try {
      const res = await API.get(`/soil/${farmId}`);
      setSoilData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load soil data');
    }
  };

  useEffect(() => {
    if (selectedFarm) {
      fetchSoil(selectedFarm);
    }
  }, [selectedFarm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarm) {
      toast.warning('Please select a farm');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        pH: form.pH !== '' ? parseFloat(form.pH) : undefined,
        N: form.N !== '' ? parseFloat(form.N) : undefined,
        P: form.P !== '' ? parseFloat(form.P) : undefined,
        K: form.K !== '' ? parseFloat(form.K) : undefined,
        moisture: form.moisture !== '' ? parseFloat(form.moisture) : undefined,
      };

      const res = await API.post(`/soil/${selectedFarm}`, payload);
      toast.success('Soil reading recorded!');
      setForm({ pH: '', N: '', P: '', K: '', moisture: '' });
      fetchSoil(selectedFarm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording soil data');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const latestReading = soilData?.data?.[0];
  const historyReadings = soilData?.data || [];
  const recommendations = soilData?.latestRecommendations || [];

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">🧪 Soil Health & Nutrient Analysis</h2>
          <p className="text-muted mb-0">Record laboratory tests, analyze NPK levels, and receive AI-driven fertilizer recommendations</p>
        </div>
        <div style={{ minWidth: '220px' }}>
          <Form.Select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="fw-semibold text-success border-success"
          >
            {farms.map((f) => (
              <option key={f._id} value={f._id}>
                📍 {f.name}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {farms.length === 0 ? (
        <Alert variant="warning" className="text-center p-4">
          <h5>No Farms Found</h5>
          <p className="mb-0">Please create a farm first before recording soil health data.</p>
        </Alert>
      ) : (
        <>
          {/* Top Row: Input Form & Recommendations */}
          <Row className="g-4 mb-4">
            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-success text-white py-3">
                  <h5 className="fw-bold mb-0">📝 Log New Soil Reading</h5>
                </Card.Header>
                <Card.Body className="p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Col xs={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Soil pH (0 - 14)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            max="14"
                            placeholder="e.g. 6.5"
                            value={form.pH}
                            onChange={(e) => setForm({ ...form, pH: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Moisture % (0 - 100)</Form.Label>
                          <Form.Control
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            placeholder="e.g. 45"
                            value={form.moisture}
                            onChange={(e) => setForm({ ...form, moisture: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col xs={4}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Nitrogen (N)</Form.Label>
                          <Form.Control
                            type="number"
                            step="1"
                            placeholder="kg/ha"
                            value={form.N}
                            onChange={(e) => setForm({ ...form, N: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={4}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Phosphorus (P)</Form.Label>
                          <Form.Control
                            type="number"
                            step="1"
                            placeholder="kg/ha"
                            value={form.P}
                            onChange={(e) => setForm({ ...form, P: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={4}>
                        <Form.Group>
                          <Form.Label className="small fw-semibold">Potassium (K)</Form.Label>
                          <Form.Control
                            type="number"
                            step="1"
                            placeholder="kg/ha"
                            value={form.K}
                            onChange={(e) => setForm({ ...form, K: e.target.value })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button variant="success" type="submit" className="w-100 py-2 mt-2" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Soil Reading & Get Advice'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-bottom py-3">
                  <h5 className="fw-bold mb-0 text-success">💡 Rule-Based Agronomic Recommendations</h5>
                </Card.Header>
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  {recommendations.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p>Enter soil readings on the left to generate scientific treatment advice.</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        <small className="text-muted">Analysis of latest reading:</small>
                        <div className="d-flex gap-2 flex-wrap mt-1">
                          <Badge bg="secondary">pH: {latestReading?.pH ?? 'N/A'}</Badge>
                          <Badge bg="success">N: {latestReading?.N ?? 'N/A'} kg/ha</Badge>
                          <Badge bg="info">P: {latestReading?.P ?? 'N/A'} kg/ha</Badge>
                          <Badge bg="warning" text="dark">K: {latestReading?.K ?? 'N/A'} kg/ha</Badge>
                          <Badge bg="primary">Moisture: {latestReading?.moisture ?? 'N/A'}%</Badge>
                        </div>
                      </div>

                      <ul className="list-group list-group-flush">
                        {recommendations.map((rec, i) => (
                          <li key={i} className="list-group-item px-0 py-2 d-flex gap-2 align-items-start">
                            <span className="text-success fs-5">✓</span>
                            <span className="fw-medium text-dark">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-light p-3 rounded mt-3 small text-muted">
                    ℹ️ Benchmarks: Healthy Indian arable soils maintain pH 6.0–7.5, N &gt; 50 kg/ha, P &gt; 25 kg/ha, K &gt; 150 kg/ha, Moisture 20–80%.
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Visual Charts Row */}
          {latestReading && (
            <Row className="g-4 mb-4">
              <Col md={6}>
                <Card className="border-0 shadow-sm p-3">
                  <SoilBarChart reading={latestReading} />
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 shadow-sm p-3">
                  <SoilHistoryChart readings={historyReadings} />
                </Card>
              </Col>
            </Row>
          )}

          {/* Historical Table */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">📜 Soil Reading Log History</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {historyReadings.length === 0 ? (
                <div className="p-4 text-center text-muted">No soil logs recorded for this farm yet.</div>
              ) : (
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>pH Level</th>
                      <th>Nitrogen (N)</th>
                      <th>Phosphorus (P)</th>
                      <th>Potassium (K)</th>
                      <th>Moisture</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyReadings.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.recordedAt ? new Date(r.recordedAt).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`fw-bold ${r.pH < 6 || r.pH > 7.5 ? 'text-danger' : 'text-success'}`}>
                            {r.pH ?? '—'}
                          </span>
                        </td>
                        <td>{r.N !== undefined ? `${r.N} kg/ha` : '—'}</td>
                        <td>{r.P !== undefined ? `${r.P} kg/ha` : '—'}</td>
                        <td>{r.K !== undefined ? `${r.K} kg/ha` : '—'}</td>
                        <td>{r.moisture !== undefined ? `${r.moisture}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default SoilReport;

