import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const AddEventPage = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get('/api/venues');
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const issueBody = `**Date:** ${date}
**Time:** ${time}
**Venue:** ${venue}
**Description:**
${description}`;

    try {
      const response = await axios.post('/api/events', {
        title: title,
        body: issueBody
      });

      if (response.status === 201) {
        setAlertVariant('success');
        setAlertMessage('¡Evento creado correctamente!');
        setShowAlert(true);
        setTitle('');
        setDate('');
        setTime('');
        setVenue('');
        setDescription('');
      }
    } catch (error) {
      setAlertVariant('danger');
      setAlertMessage('Error al crear el evento. Por favor, inténtalo de nuevo.');
      setShowAlert(true);
      console.error("Error creating event:", error);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h1>Añadir Nuevo Evento</h1>
          {showAlert && <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>{alertMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEventTitle">
              <Form.Label>Título del Evento</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Introduce el título del evento" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEventDate">
              <Form.Label>Fecha</Form.Label>
              <Form.Control 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEventTime">
              <Form.Label>Hora</Form.Label>
              <Form.Control 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEventVenue">
              <Form.Label>Lugar</Form.Label>
              <Form.Select 
                value={venue} 
                onChange={(e) => setVenue(e.target.value)}
                required
              >
                <option value="">Selecciona un lugar</option>
                {venues.map((v, index) => (
                  <option key={index} value={v.name}>{v.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEventDescription">
              <Form.Label>Descripción</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Introduce la descripción del evento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

export default AddEventPage;