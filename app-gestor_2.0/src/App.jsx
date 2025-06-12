// src/App.jsx

import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Componentes e Layouts
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductCategoriesPage from './pages/ProductCategoriesPage';
import ProductsPage from './pages/ProductsPage';
import MerchantsPage from './pages/MerchantsPage';
import EmployeesPage from './pages/EmployeesPage'; // Importado com o nome novo
import CostCentersPage from './pages/CostCentersPage';
import PurchasesListPage from './pages/PurchasesListPage';
import NewPurchasePage from './pages/NewPurchasePage';
import SalesListPage from './pages/SalesListPage';
import NewSalePage from './pages/NewSalePage';
import PartnersPage from './pages/PartnersPage';
import GeneralExpensesPage from './pages/GeneralExpensesPage';
import ExpenseCategoriesPage from './pages/ExpenseCategoriesPage';
import ReportsPage from './pages/ReportsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#dcfce7', // Verde claro
              color: '#166534', // Verde escuro
            },
          },
          error: {
            style: {
              background: '#fee2e2', // Vermelho claro
              color: '#991b1b', // Vermelho escuro
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Rota de Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rotas Protegidas */}
          <Route path="/" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><MainLayout><ProductCategoriesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><MainLayout><ProductsPage /></MainLayout></ProtectedRoute>} />
          <Route path="/merchants" element={<ProtectedRoute><MainLayout><MerchantsPage /></MainLayout></ProtectedRoute>} />
          {/* Rota Corrigida */}
          <Route path="/employees" element={<ProtectedRoute><MainLayout><EmployeesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/cost-centers" element={<ProtectedRoute><MainLayout><CostCentersPage /></MainLayout></ProtectedRoute>} />
          <Route path="/expense-categories" element={<ProtectedRoute><MainLayout><ExpenseCategoriesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><MainLayout><PurchasesListPage /></MainLayout></ProtectedRoute>} />
          <Route path="/purchases/new" element={<ProtectedRoute><MainLayout><NewPurchasePage /></MainLayout></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><MainLayout><SalesListPage /></MainLayout></ProtectedRoute>} />
          <Route path="/sales/new" element={<ProtectedRoute><MainLayout><NewSalePage /></MainLayout></ProtectedRoute>} />
          <Route path="/partners" element={<ProtectedRoute><MainLayout><PartnersPage /></MainLayout></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><MainLayout><GeneralExpensesPage /></MainLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><MainLayout><ReportsPage /></MainLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;