import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap'; // Import Spinner
import axios from 'axios';

const AddEventPage = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null); // New state for image file
  const [imageUrl, setImageUrl] = useState(''); // New state for uploaded image URL
  const [uploadingImage, setUploadingImage] = useState(false); // New state for upload status
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImage(true); // Start image upload
    setImageUrl(''); // Clear previous image URL

    let finalImageUrl = '';

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
        const uploadResponse = await axios.post('/api/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        finalImageUrl = uploadResponse.data.url;
        setImageUrl(finalImageUrl); // Store URL for display/confirmation
        setUploadingImage(false); // Image upload finished
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError.response ? uploadError.response.data : uploadError.message);
        setAlertVariant('danger');
        setAlertMessage('Error al subir la imagen. Por favor, inténtalo de nuevo.');
        setShowAlert(true);
        setUploadingImage(false);
        return; // Stop further submission if image upload fails
      }
    } else {
      setUploadingImage(false); // No image to upload
    }

    // Construct issue body with image URL if available
    const issueBody = `**Fecha:** ${date}
**Hora:** ${time}
**Lugar:** ${venue}
**Descripción:**
${description}
${finalImageUrl ? `**Póster:** ![Póster del evento](${finalImageUrl})` : ''}`; // Add image if URL exists

    try {
      const response = await axios.post('/api/events', {
        title: title,
        body: issueBody
      });

      if (response.status === 201) {
        setAlertVariant('success');
        setAlertMessage('¡Evento creado correctamente!');
        setShowAlert(true);
        // Clear all fields after successful submission
        setTitle('');
        setDate('');
        setTime('');
        setVenue('');
        setDescription('');
        setImageFile(null);
        setImageUrl('');
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

            {/* New Image Upload Field */}
            <Form.Group className="mb-3" controlId="formEventImage">
              <Form.Label>Póster del Evento (opcional)</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              {uploadingImage && <Spinner animation="border" size="sm" className="ms-2" />}
              {imageUrl && <p className="text-success mt-2">Imagen subida: <a href={imageUrl} target="_blank" rel="noopener noreferrer">{imageUrl}</a></p>}
            </Form.Group>

            <Button variant="primary" type="submit" disabled={uploadingImage}>
              {uploadingImage ? 'Subiendo imagen...' : 'Enviar'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddEventPage;
