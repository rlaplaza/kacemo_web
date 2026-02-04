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
        setAlertMessage('Venue added successfully! The page will reload to reflect the changes.');
        setShowAlert(true);
        setName('');
        setAddress('');
        
        // Reload the page after a short delay to get the new venues list
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      setAlertVariant('danger');
      setAlertMessage('Error adding venue. Please try again.');
      setShowAlert(true);
      console.error("Error adding venue:", error);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1>Add New Venue</h1>
          {showAlert && <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>{alertMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formVenueName">
              <Form.Label>Venue Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter venue name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formVenueAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter venue address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddVenuePage;