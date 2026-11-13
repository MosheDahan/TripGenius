import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VacationsList } from './components/VacationsList';
import { AddVacation } from './components/AddVacation';
import { EditVacation } from './components/EditVacation';
import { Reports } from './components/Reports';
import { AiRecommendations } from './components/AiRecommendations';
import { McpAssistant } from './components/McpAssistant';
import { About } from './components/About';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            
            {/* מסך חופשות ראשי - לכל משתמש מחובר */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <VacationsList />
                </ProtectedRoute>
              } 
            />

            {/* נתיבי מנהל בלבד */}
            <Route 
              path="/add-vacation" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AddVacation />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/edit-vacation/:id" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <EditVacation />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reports" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <Reports />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <AiRecommendations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mcp"
              element={
                <ProtectedRoute>
                  <McpAssistant />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;