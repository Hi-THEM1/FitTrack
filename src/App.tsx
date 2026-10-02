import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { WorkoutSessionProvider } from './context/WorkoutSessionContext';
import { NutritionProvider } from './context/NutritionContext';
import { GamificationProvider } from './context/GamificationContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingWizard from './pages/OnboardingWizard';
import DashboardPage from './pages/DashboardPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import WorkoutExecutionPage from './pages/WorkoutExecutionPage';
import NutritionPage from './pages/NutritionPage';
import ProfilePage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import AchievementsPage from './pages/AchievementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ChatBubble from './components/ui/ChatBubble';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { pathname } = window.location;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-text-main">
        <div className="skeleton w-32 h-8 rounded"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if profile is incomplete, unless already on onboarding page
  if (user && !user.goal && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <GamificationProvider>
            <NutritionProvider>
              <WorkoutSessionProvider>
                <Router>
                  <ChatBubble />
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route 
                      path="/onboarding" 
                      element={
                        <ProtectedRoute>
                          <OnboardingWizard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/exercises" 
                      element={
                        <ProtectedRoute>
                          <ExerciseLibraryPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/workout/active/:id" 
                      element={
                        <ProtectedRoute>
                          <WorkoutExecutionPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/nutrition" 
                      element={
                        <ProtectedRoute>
                          <NutritionPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/progress" 
                      element={
                        <ProtectedRoute>
                          <ProgressPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/achievements" 
                      element={
                        <ProtectedRoute>
                          <AchievementsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <ProtectedRoute>
                          <AnalyticsPage />
                        </ProtectedRoute>
                      } 
                    />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Router>
              </WorkoutSessionProvider>
            </NutritionProvider>
          </GamificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
