// src/pages/PurchasesListPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import TransactionDetailsModal from '../components/TransactionDetailsModal';

export default function PurchasesListPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  async function fetchPurchases() {
    setLoading(true);
    const { data } = await supabase.from('purchases_with_status_view').select('*').order('purchase_date', { ascending: false });
    setPurchases(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchPurchases(); }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      {selectedTransactionId && (
        <TransactionDetailsModal
          transactionId={selectedTransactionId}
          type="purchase"
          onClose={() => setSelectedTransactionId(null)}
          onDataChange={fetchPurchases}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Histórico de Compras</h2>
        <Link to="/purchases/new"><button>Registrar Nova Compra</button></Link>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Fornecedor</th>
            <th>Valor Total</th>
            <th>Saldo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => (
            <tr key={p.purchase_id}>
              <td>{new Date(p.purchase_date + 'T00:00:00').toLocaleDateString()}</td>
              <td>{p.supplier_name}</td>
              <td>R$ {p.total_amount.toFixed(2)}</td>
              <td>R$ {p.balance.toFixed(2)}</td>
              <td>
                <button onClick={() => setSelectedTransactionId(p.purchase_id)}>
                  Ver Pagamentos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}