import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap'; // Import Button

const EventDetailPage = () => {
  const { eventId } = useParams(); // Get eventId from URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venueAddress, setVenueAddress] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Fetch all events (issues)
        const eventsResponse = await axios.get('/api/events');
        const allIssues = eventsResponse.data;

        // Find the specific issue by its number (eventId)
        const foundIssue = allIssues.find(issue => issue.number.toString() === eventId);

        if (foundIssue) {
          const body = foundIssue.body;
          const title = foundIssue.title;

          const dateMatch = body.match(/\*\*Date:\*\* (.*)/);
          const timeMatch = body.match(/\*\*Time:\*\* (.*)/);
          const venueMatch = body.match(/\*\*Venue:\*\* (.*)/);
          const descriptionMatch = body.match(/\*\*Description:\*\*\n(.*)/s);

          const eventDetails = {
            title: title,
            date: dateMatch ? dateMatch[1].trim() : 'N/A',
            time: timeMatch ? timeMatch[1].trim() : 'N/A',
            venue: venueMatch ? venueMatch[1].trim() : 'N/A',
            description: descriptionMatch ? descriptionMatch[1].trim() : 'N/A',
            url: foundIssue.html_url
          };
          setEvent(eventDetails);

          // Now fetch venues to get the address
          const venuesResponse = await axios.get('/api/venues');
          const venues = venuesResponse.data;
          const venueData = venues.find(v => v.name === eventDetails.venue);
          setVenueAddress(venueData ? venueData.address : 'Dirección no disponible');

        } else {
          setError('Evento no encontrado.');
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError('Error al cargar los detalles del evento.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card bg="dark" text="light" className="mb-4">
            <Card.Header>
              <h1 className="mb-0">{event.title}</h1>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>Fecha:</strong> {event.date}
              </Card.Text>
              <Card.Text>
                <strong>Hora:</strong> {event.time}
              </Card.Text>
              <Card.Text>
                <strong>Lugar:</strong> {event.venue}
              </Card.Text>
              <Card.Text>
                <strong>Dirección:</strong> {venueAddress}
              </Card.Text>
              <Card.Text>
                <strong>Descripción:</strong> {event.description}
              </Card.Text>
              <Card.Link href={event.url} target="_blank" rel="noopener noreferrer">
                Ver Evento en GitHub
              </Card.Link>
              <Button 
                variant="primary" 
                className="ms-3" 
                onClick={() => window.open(googleMapsUrl, "_blank")}
              >
                Ver en Google Maps
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetailPage;
