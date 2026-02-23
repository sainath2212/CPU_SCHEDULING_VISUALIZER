import { Routes, Route } from 'react-router-dom';
import { ProcessProvider } from './context/ProcessContext';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import SimulatorPage from './pages/SimulatorPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ComparisonPage from './pages/ComparisonPage';
import RecommenderPage from './pages/RecommenderPage';
import KernelViewPage from './pages/KernelViewPage';
import TerminalPage from './pages/TerminalPage';
import './index.css';

export default function App() {
  return (
    <ProcessProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/recommend" element={<RecommenderPage />} />
        <Route path="/kernel" element={<KernelViewPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
      </Routes>
    </ProcessProvider>
  );
}
