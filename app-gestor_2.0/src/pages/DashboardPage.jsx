// src/pages/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Estilos para os cartões (pode ser movido para um CSS)
const cardStyle = {
  background: '#f9f9f9',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

const cardContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      // Chama nossa nova função RPC
      const { data, error } = await supabase.rpc('get_dashboard_summary');

      if (error) {
        alert("Erro ao buscar dados do dashboard: " + error.message);
      } else {
        setSummary(data);
      }
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) return <p>Carregando dashboard...</p>;
  if (!summary) return <p>Não foi possível carregar os dados.</p>;

  // Formata os dados para o gráfico, garantindo que 'total' seja um número
  const chartData = summary.sales_by_month 
    ? summary.sales_by_month.map(item => ({...item, total: Number(item.total)})) 
    : [];

  return (
    <div>
      <h2>Dashboard Principal</h2>

      {/* --- Cartões de Resumo (KPIs) --- */}
      <div style={cardContainerStyle}>
        <div style={cardStyle}>
          <h4>Vendas (Últimos 30 dias)</h4>
          <p style={{ fontSize: '2em', margin: 0 }}>
            R$ {summary.sales_last_30_days.toFixed(2)}
          </p>
        </div>
        <div style={cardStyle}>
          <h4>Compras (Últimos 30 dias)</h4>
          <p style={{ fontSize: '2em', margin: 0 }}>
            R$ {summary.purchases_last_30_days.toFixed(2)}
          </p>
        </div>
        {/* Você pode adicionar mais cartões aqui, como "Saldo em Caixa" ou "Novos Clientes" */}
      </div>

      {/* --- Gráfico de Vendas --- */}
      <h3>Vendas por Mês (Últimos 12 meses)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total de Vendas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}