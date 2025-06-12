// src/pages/SalesListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SalesListPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_with_status_view') // Usando a VIEW de vendas!
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) alert(error.message);
      else setSales(data);
      setLoading(false);
    }
    fetchSales();
  }, []);

  if (loading) return <p>A carregar vendas...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Histórico de Vendas</h2>
        <Link to="/sales/new">
          <button>Registar Nova Venda</button>
        </Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Valor Total</th>
            <th>Comissão</th>
            <th>Status Pgto.</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.sale_id}>
              <td>{s.sale_display_id}</td>
              <td>{new Date(s.sale_date + 'T00:00:00').toLocaleDateString()}</td>
              <td>{s.customer_name}</td>
              <td>{s.salesperson_name}</td>
              <td>R$ {s.overall_total_amount.toFixed(2)}</td>
              <td>{s.commission_value ? `R$ ${s.commission_value.toFixed(2)}` : '-'}</td>
              <td>{s.balance === 0 ? 'Recebido' : `Falta R$ ${s.balance.toFixed(2)}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}