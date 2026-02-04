import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import CalendarPage from './pages/CalendarPage';
import AddEventPage from './pages/AddEventPage';
import AddVenuePage from './pages/AddVenuePage';
import EventDetailPage from './pages/EventDetailPage'; // Import EventDetailPage
import AuthCallback from './AuthCallback'; // Import AuthCallback
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import AuthInitializer from './AuthInitializer'; // Import AuthInitializer
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider> {/* AuthProvider now wraps Router */}
      <Router>
        <AuthInitializer> {/* AuthInitializer now wraps the rest of the app */}
          <div className="App">
            <NavigationBar />
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<CalendarPage />} />
                <Route path="/add-event" element={<ProtectedRoute><AddEventPage /></ProtectedRoute>} />
                <Route path="/add-venue" element={<ProtectedRoute><AddVenuePage /></ProtectedRoute>} />
                <Route path="/events/:eventId" element={<EventDetailPage />} /> {/* New route for EventDetailPage */}
                <Route path="/auth/callback" element={<AuthCallback />} />
              </Routes>
            </div>
          </div>
        </AuthInitializer>
      </Router>
    </AuthProvider>
  );
}

export default App;