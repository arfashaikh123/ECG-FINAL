import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ScannerPage from './pages/ScannerPage';
import AssistantPage from './pages/AssistantPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [analysisContext, setAnalysisContext] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (context) => {
    setAnalysisContext(context);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'scanner':
        return <ScannerPage onAnalysisComplete={handleAnalysisComplete} />;
      case 'assistant':
        return <AssistantPage analysisContext={analysisContext} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
