import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const GROWTH_STAGES = [
  'seed',
  'germination',
  'vegetative',
  'flowering',
  'fruiting',
  'ripening',
  'harvested',
];

function Crops() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  const [formData, setFormData] = useState({
    farm: '',
    name: '',
    variety: '',
    growthStage: 'seed',
    plantingDate: '',
    expectedHarvestDate: '',
    areaHectares: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, farmsRes] = await Promise.all([
        API.get('/crops'),
        API.get('/farms'),
      ]);
      setCrops(cropsRes.data.data || []);
      setFarms(farmsRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCrop(null);
    setFormData({
      farm: farms[0]?._id || '',
      name: '',
      variety: '',
      growthStage: 'seed',
      plantingDate: '',
      expectedHarvestDate: '',
      areaHectares: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (crop, e) => {
    e.stopPropagation();
    setEditingCrop(crop);
    setFormData({
      farm: crop.farm?._id || crop.farm || '',
      name: crop.name || '',
      variety: crop.variety || '',
      growthStage: crop.growthStage || 'seed',
      plantingDate: crop.plantingDate ? crop.plantingDate.split('T')[0] : '',
      expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.split('T')[0] : '',
      areaHectares: crop.areaHectares || '',
      notes: crop.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        variety: formData.variety,
        growthStage: formData.growthStage,
        areaHectares: formData.areaHectares ? parseFloat(formData.areaHectares) : undefined,
        plantingDate: formData.plantingDate || undefined,
        expectedHarvestDate: formData.expectedHarvestDate || undefined,
        notes: formData.notes,
      };

      if (editingCrop) {
        await API.put(`/crops/${editingCrop._id}`, payload);
        toast.success('Crop updated successfully');
      } else {
        await API.post('/crops', { ...payload, farm: formData.farm });
        toast.success('Crop registered successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving crop');
    }
  };

  const handleDelete = async (cropId, cropName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete crop "${cropName}"?`)) return;
    try {
      await API.delete(`/crops/${cropId}`);
      toast.success('Crop removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete crop');
    }
  };

  const filteredCrops = crops.filter((c) => {
    const farmId = c.farm?._id || c.farm;
    const matchesFarm = !selectedFarm || farmId === selectedFarm;
    const matchesStage = !selectedStage || c.growthStage === selectedStage;
    return matchesFarm && matchesStage;
  });

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case 'seed': return 'secondary';
      case 'germination': return 'info';
      case 'vegetative': return 'primary';
      case 'flowering': return 'warning';
      case 'fruiting': return 'warning';
      case 'ripening': return 'success';
      case 'harvested': return 'dark';
      default: return 'success';
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">🌱 Crop Lifecycle & Monitoring</h2>
          <p className="text-muted mb-0">Track planting, stages, field logs, and harvest projections</p>
        </div>
        <Button variant="success" className="px-4 py-2 fw-semibold" onClick={handleOpenAdd} disabled={farms.length === 0}>
          + Add New Crop
        </Button>
      </div>

      {farms.length === 0 && !loading && (
        <Card className="mb-4 bg-light border-warning">
          <Card.Body className="d-flex align-items-center justify-content-between">
            <span>⚠️ You need to register a farm before planting crops.</span>
            <Link to="/farms" className="btn btn-sm btn-warning">Go to Farms</Link>
          </Card.Body>
        </Card>
      )}

      {/* Filter Row */}
      <Row className="mb-4 g-2">
        <Col md={4}>
          <Form.Select value={selectedFarm} onChange={(e) => setSelectedFarm(e.target.value)}>
            <option value="">All Farms</option>
            {farms.map((f) => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
            <option value="">All Growth Stages</option>
            {GROWTH_STAGES.map((s) => (
              <option key={s} value={s} className="text-capitalize">{s}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner />
      ) : filteredCrops.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">🌾</div>
            <h5>No crops found</h5>
            <p className="text-muted">No crop matches the selected filters.</p>
            {farms.length > 0 && (
              <Button variant="outline-success" onClick={handleOpenAdd}>Plant a Crop Now</Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredCrops.map((crop) => (
            <Col key={crop._id}>
              <Card className="h-100 shadow-sm border-0 crop-card">
                <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0 text-success">{crop.name}</h5>
                    <small className="text-muted">{crop.variety || 'Variety Unspecified'}</small>
                  </div>
                  <Badge bg={getStageBadgeColor(crop.growthStage)} className="text-capitalize px-2 py-1">
                    {crop.growthStage}
                  </Badge>
                </Card.Header>
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <p className="small text-muted mb-2">
                      📍 Farm: <strong>{crop.farm?.name || 'Assigned Farm'}</strong>
                    </p>
                    {crop.areaHectares && (
                      <p className="small mb-2">
                        📐 Field Area: <strong>{crop.areaHectares} Hectares</strong>
                      </p>
                    )}
                    <div className="bg-light p-2 rounded small mb-3">
                      <div>🗓️ Planted: {crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : 'N/A'}</div>
                      <div>🎯 Harvest: {crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    {crop.activityLog?.length > 0 && (
                      <Badge bg="secondary" className="mb-2">
                        {crop.activityLog.length} Timeline Event(s)
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                    <Link to={`/crops/${crop._id}`} className="btn btn-sm btn-outline-success">
                      Activity Log →
                    </Link>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={(e) => handleOpenEdit(crop, e)}>
                        ✏️
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={(e) => handleDelete(crop._id, crop.name, e)}>
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

      {/* Add / Edit Crop Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editingCrop ? 'Edit Crop' : 'Plant New Crop'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!editingCrop && (
              <Form.Group className="mb-3">
                <Form.Label>Select Farm *</Form.Label>
                <Form.Select
                  required
                  value={formData.farm}
                  onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                >
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>{f.name} ({f.areaHectares} Ha)</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Crop Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Wheat, Mustard, Paddy, Cotton"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Variety / Hybrid</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. HD-2967"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Planted Area (Ha)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2.0"
                    value={formData.areaHectares}
                    onChange={(e) => setFormData({ ...formData, areaHectares: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Current Growth Stage</Form.Label>
              <Form.Select
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
              >
                {GROWTH_STAGES.map((s) => (
                  <option key={s} value={s} className="text-capitalize">{s}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Planting Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Expected Harvest</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Field Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Fertilizer applied, seed rate, row spacing..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">{editingCrop ? 'Save Changes' : 'Plant Crop'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Crops;

