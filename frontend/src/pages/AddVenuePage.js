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
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1>Añadir Nuevo Lugar</h1>
          {showAlert && <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>{alertMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formVenueName">
              <Form.Label>Nombre del Lugar</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Introduce el nombre del lugar" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formVenueAddress">
              <Form.Label>Dirección</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Introduce la dirección del lugar" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Enviar
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddVenuePage;