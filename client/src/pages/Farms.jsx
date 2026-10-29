import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function Farms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    village: '',
    district: '',
    state: '',
    areaHectares: '',
    soilType: 'loamy',
    irrigationType: 'drip',
    description: '',
  });

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const url = search ? `/farms?search=${encodeURIComponent(search)}` : '/farms';
      const res = await API.get(url);
      setFarms(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [search]);

  const handleOpenAdd = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      village: '',
      district: '',
      state: '',
      areaHectares: '',
      soilType: 'loamy',
      irrigationType: 'drip',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (farm, e) => {
    e.stopPropagation();
    setEditingFarm(farm);
    setFormData({
      name: farm.name || '',
      village: farm.location?.village || '',
      district: farm.location?.district || '',
      state: farm.location?.state || '',
      areaHectares: farm.areaHectares || '',
      soilType: farm.soilType || 'loamy',
      irrigationType: farm.irrigationType || 'drip',
      description: farm.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        areaHectares: parseFloat(formData.areaHectares),
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        description: formData.description,
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        },
      };

      if (editingFarm) {
        await API.put(`/farms/${editingFarm._id}`, payload);
        toast.success('Farm updated successfully');
      } else {
        await API.create ? await API.create() : await API.post('/farms', payload);
        toast.success('Farm registered successfully');
      }
      setShowModal(false);
      fetchFarms();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error saving farm');
    }
  };

  const handleDelete = async (farmId, farmName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${farmName}"?`)) return;
    try {
      await API.delete(`/farms/${farmId}`);
      toast.success('Farm deleted');
      fetchFarms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete farm');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-success">🌾 My Farms</h2>
          <p className="text-muted mb-0">Manage your farm locations, land records, and irrigation</p>
        </div>
        <Button variant="success" className="px-4 py-2 fw-semibold" onClick={handleOpenAdd}>
          + Register New Farm
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search farms by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner />
      ) : farms.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">🚜</div>
            <h5>No farms found</h5>
            <p className="text-muted">Register your first plot of agricultural land to monitor crops and soil.</p>
            <Button variant="outline-success" onClick={handleOpenAdd}>Add Farm Now</Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {farms.map((farm) => (
            <Col key={farm._id}>
              <Card className="h-100 shadow-sm border-0 farm-card hover-lift">
                <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center py-3">
                  <span className="fw-bold fs-5 text-truncate">{farm.name}</span>
                  <Badge bg="light" text="dark" className="px-2 py-1">
                    {farm.areaHectares} Ha
                  </Badge>
                </Card.Header>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <p className="text-muted small mb-2">
                      📍 {farm.location?.village ? `${farm.location.village}, ` : ''}
                      {farm.location?.district ? `${farm.location.district}, ` : ''}
                      {farm.location?.state || 'India'}
                    </p>
                    <div className="mb-3 d-flex flex-wrap gap-2">
                      <Badge bg="secondary" className="text-capitalize">
                        Soil: {farm.soilType || 'Loamy'}
                      </Badge>
                      <Badge bg="info" text="dark" className="text-capitalize">
                        Irrigation: {farm.irrigationType || 'Drip'}
                      </Badge>
                      {farm.soilReadings?.length > 0 && (
                        <Badge bg="warning" text="dark">
                          {farm.soilReadings.length} Soil Log(s)
                        </Badge>
                      )}
                    </div>
                    {farm.description && (
                      <p className="small text-secondary mb-3">{farm.description}</p>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                    <Link to={`/farms/${farm._id}`} className="btn btn-sm btn-outline-success">
                      View Details →
                    </Link>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={(e) => handleOpenEdit(farm, e)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={(e) => handleDelete(farm._id, farm.name, e)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingFarm ? 'Edit Farm' : 'Register New Farm'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Farm Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Green Valley Farm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Area (Hectares) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 3.5"
                    value={formData.areaHectares}
                    onChange={(e) => setFormData({ ...formData, areaHectares: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Soil Type</Form.Label>
                  <Form.Select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  >
                    <option value="clay">Clay Soil</option>
                    <option value="sandy">Sandy Soil</option>
                    <option value="loamy">Loamy Soil</option>
                    <option value="silty">Silty Soil</option>
                    <option value="peaty">Peaty Soil</option>
                    <option value="chalky">Chalky Soil</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Irrigation Type</Form.Label>
                  <Form.Select
                    value={formData.irrigationType}
                    onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler</option>
                    <option value="flood">Flood / Surface</option>
                    <option value="rainfed">Rainfed</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Village / Town</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Village"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>District</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="District"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description / Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Key crops, water sources, elevation, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              {editingFarm ? 'Save Changes' : 'Register Farm'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Farms;

