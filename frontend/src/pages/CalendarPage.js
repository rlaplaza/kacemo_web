import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Removed fetchVenues as venues state is no longer used here

    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');

        const parsedEvents = response.data.map(issue => {
          const body = issue.body || '';
          const title = issue.title;

          const dateMatch = body.match(/^(\*\*Fecha:\*\*|Fecha:) (.*)/m);
          const timeMatch = body.match(/^(\*\*Hora:\*\*|Hora:) (.*)/m);
          const venueMatch = body.match(/^(\*\*Lugar:\*\*|Lugar:) (.*)/m);
          const visibleMatch = body.match(/^(\*\*Visible:\*\*|Visible:) (.*)/m);
          const descriptionMatch = body.match(/\*\*Descripción:\*\*\n(.*)/s);

          if (dateMatch && timeMatch) {
            const date = dateMatch[2].trim();
            const time = timeMatch[2].trim();
            const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').toDate();
            const isVisible = visibleMatch ? visibleMatch[2].trim().toLowerCase() === 'true' : true;

            return {
              title: isVisible ? title : `[Privado] ${title}`,
              start: start,
              end: start, // Assuming events are for a single moment
              allDay: false,
              resource: {
                venue: venueMatch ? venueMatch[2].trim() : '',
                description: descriptionMatch ? descriptionMatch[1].trim() : '',
                visible: isVisible,
                url: issue.html_url
              },
              id: issue.number // Add issue number as id for routing
            };
          }
          return null;
        }).filter(event => event !== null);

        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);
  
  const handleSelectEvent = (event) => {
    navigate(`/events/${event.id}`); // Navigate to EventDetailPage
  };

  return (
    <div className="pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Calendario de Eventos</h1>
      </div>
      <div style={{ height: '75vh', minHeight: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Sig.",
            previous: "Ant.",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día"
          }}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
