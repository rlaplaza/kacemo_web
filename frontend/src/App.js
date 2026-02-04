import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import CalendarPage from './pages/CalendarPage';
import AddEventPage from './pages/AddEventPage';
import AddVenuePage from './pages/AddVenuePage';
import AuthCallback from './AuthCallback'; // Import AuthCallback
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider> {/* AuthProvider now wraps Router */}
      <Router>
        <div className="App">
          <NavigationBar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/add-event" element={<ProtectedRoute><AddEventPage /></ProtectedRoute>} />
              <Route path="/add-venue" element={<ProtectedRoute><AddVenuePage /></ProtectedRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;