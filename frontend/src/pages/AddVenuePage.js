import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const AddVenuePage = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put('/api/venues', {
        name,
        address
      });

      if (response.status === 200) {
        setAlertVariant('success');
        setAlertMessage('¡Lugar añadido correctamente! La página se recargará para reflejar los cambios.');
        setShowAlert(true);
        setName('');
        setAddress('');
        
        // Reload the page after a short delay to get the new venues list
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      setAlertVariant('danger');
      setAlertMessage('Error al añadir el lugar. Por favor, inténtalo de nuevo.');
      setShowAlert(true);
      console.error("Error adding venue:", error);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="py-4 text-center">
              <h1 className="h2 mb-0">Añadir Nuevo Lugar</h1>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {showAlert && (
                <Alert 
                  variant={alertVariant} 
                  onClose={() => setShowAlert(false)} 
                  dismissible 
                  className="mb-4"
                >
                  {alertMessage}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formVenueName">
                  <Form.Label>Nombre del Lugar</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ej: Teatro Principal" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-5" controlId="formVenueAddress">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Calle, Número, Ciudad..." 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg">
                    Añadir Lugar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddVenuePage;