import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function FarmDetail() {
  const { id } = useParams();
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCropModal, setShowCropModal] = useState(false);

  const [cropForm, setCropForm] = useState({
    name: '',
    variety: '',
    growthStage: 'seed',
    areaHectares: '',
    plantingDate: '',
    expectedHarvestDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [farmRes, cropsRes] = await Promise.all([
        API.get(`/farms/${id}`),
        API.get(`/crops?farmId=${id}`),
      ]);
      setFarm(farmRes.data.data);
      setCrops(cropsRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading farm details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
      await API.post('/crops', {
        ...cropForm,
        farm: id,
        areaHectares: cropForm.areaHectares ? parseFloat(cropForm.areaHectares) : undefined,
      });
      toast.success('Crop planted successfully!');
      setShowCropModal(false);
      setCropForm({
        name: '',
        variety: '',
        growthStage: 'seed',
        areaHectares: '',
        plantingDate: '',
        expectedHarvestDate: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add crop');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!farm) return <Container className="py-5 text-center"><h4>Farm not found</h4></Container>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/farms" className="text-decoration-none text-muted mb-2 d-inline-block">
            ← Back to Farms
          </Link>
          <h2 className="fw-bold text-success mb-1">{farm.name}</h2>
          <p className="text-muted mb-0">
            📍 {farm.location?.village ? `${farm.location.village}, ` : ''}
            {farm.location?.district ? `${farm.location.district}, ` : ''}
            {farm.location?.state}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setShowCropModal(true)}>
            + Plant New Crop
          </Button>
          <Link to="/soil" className="btn btn-outline-success">
            🧪 Log Soil Health
          </Link>
        </div>
      </div>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <h6 className="text-muted small">Total Area</h6>
            <h3 className="fw-bold text-dark mb-0">{farm.areaHectares} Ha</h3>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <h6 className="text-muted small">Soil Type</h6>
            <h4 className="fw-bold text-capitalize text-success mb-0">{farm.soilType || 'Loamy'}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <h6 className="text-muted small">Irrigation System</h6>
            <h4 className="fw-bold text-capitalize text-primary mb-0">{farm.irrigationType || 'Drip'}</h4>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm text-center p-3">
            <h6 className="text-muted small">Active Crops</h6>
            <h3 className="fw-bold text-warning mb-0">{crops.length}</h3>
          </Card>
        </Col>
      </Row>

      {/* Crops Section */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">🌱 Crops on this Farm</h5>
          <Button size="sm" variant="outline-success" onClick={() => setShowCropModal(true)}>
            + Add Crop
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {crops.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-2">No crops currently planted on this farm.</p>
              <Button size="sm" variant="success" onClick={() => setShowCropModal(true)}>
                Plant First Crop
              </Button>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Crop & Variety</th>
                  <th>Growth Stage</th>
                  <th>Planted Area</th>
                  <th>Planting Date</th>
                  <th>Expected Harvest</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="fw-bold text-success">{c.name}</div>
                      <small className="text-muted">{c.variety || 'Standard'}</small>
                    </td>
                    <td>
                      <Badge bg="success" className="text-capitalize px-2 py-1">
                        {c.growthStage}
                      </Badge>
                    </td>
                    <td>{c.areaHectares ? `${c.areaHectares} Ha` : '—'}</td>
                    <td>{c.plantingDate ? new Date(c.plantingDate).toLocaleDateString() : '—'}</td>
                    <td>{c.expectedHarvestDate ? new Date(c.expectedHarvestDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <Link to={`/crops/${c._id}`} className="btn btn-sm btn-outline-primary">
                        View Timeline →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Crop Modal */}
      <Modal show={showCropModal} onHide={() => setShowCropModal(false)} centered>
        <Form onSubmit={handleAddCrop}>
          <Modal.Header closeButton>
            <Modal.Title>Plant New Crop on {farm.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Crop Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Wheat, Sugarcane, Tomato"
                value={cropForm.name}
                onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
              />
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Variety / Hybrid</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. HD-2967, Co-86032"
                    value={cropForm.variety}
                    onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Planted Area (Ha)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.5"
                    value={cropForm.areaHectares}
                    onChange={(e) => setCropForm({ ...cropForm, areaHectares: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Initial Growth Stage</Form.Label>
              <Form.Select
                value={cropForm.growthStage}
                onChange={(e) => setCropForm({ ...cropForm, growthStage: e.target.value })}
              >
                <option value="seed">Seed</option>
                <option value="germination">Germination</option>
                <option value="vegetative">Vegetative</option>
                <option value="flowering">Flowering</option>
                <option value="fruiting">Fruiting</option>
                <option value="ripening">Ripening</option>
              </Form.Select>
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Planting Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={cropForm.plantingDate}
                    onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Expected Harvest Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={cropForm.expectedHarvestDate}
                    onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCropModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Plant Crop</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default FarmDetail;

