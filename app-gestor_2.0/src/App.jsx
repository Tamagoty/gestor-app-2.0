// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import MainLayout from './components/MainLayout';
import ProductCategoriesPage from './pages/ProductCategoriesPage';
import ProductsPage from './pages/ProductsPage';
import MerchantsPage from './pages/MerchantsPage';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductCategoriesPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductsPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/merchants" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MerchantsPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
            {/* Adicione outras rotas protegidas aqui dentro */}
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;