import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { WorkoutPlanProvider } from './context/WorkoutPlanContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <WorkoutPlanProvider>
        <MusicPlayerProvider>
          <App />
        </MusicPlayerProvider>
      </WorkoutPlanProvider>
    </AuthProvider>
  </React.StrictMode>
);