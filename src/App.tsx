import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import LinksPage from './pages/LinksPage'; // I'll update the existing one
import Analytics from './pages/Analytics';
import QRCodes from './pages/QRCodes';
import Folders from './pages/Folders';
import Settings from './pages/Settings';
import Redirect from './pages/Redirect';
import Domains from './pages/Domains';
import Events from './pages/Events';
import Tags from './pages/Tags';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sudi-theme">
      <Router>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="links" element={<LinksPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="qr-codes" element={<QRCodes />} />
          <Route path="folders" element={<Folders />} />
          <Route path="domains" element={<Domains />} />
          <Route path="events" element={<Events />} />
          <Route path="tags" element={<Tags />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect Handler */}
        <Route path="/:shortCode" element={<Redirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
