import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SimulatorPage from './pages/SimulatorPage';
import './index.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
    </Routes>
  );
}
