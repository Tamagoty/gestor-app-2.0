// src/components/TransactionDetailsModal.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Estilos (podem ser movidos para um arquivo CSS)
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalContentStyle = {
  background: 'white', padding: '20px',
  borderRadius: '8px', width: '600px',
};

const formInitialState = { amount: '', payment_date: new Date().toISOString().slice(0, 10), payment_method: 'PIX', observations: '' };

export default function TransactionDetailsModal({ transactionId, type, onClose, onDataChange }) {
  const [transaction, setTransaction] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState(formInitialState);
  const [editingPayment, setEditingPayment] = useState(null);

  const viewName = type === 'purchase' ? 'purchases_with_status_view' : 'sales_with_status_view';
  const idField = type === 'purchase' ? 'purchase_id' : 'sale_id';
  const paymentsTable = type === 'purchase' ? 'purchase_payments' : 'sale_payments';
  
  async function fetchData() {
    setLoading(true);
    const { data: transData } = await supabase.from(viewName).select('*').eq(idField, transactionId).single();
    const { data: paymentsData } = await supabase.from(paymentsTable).select('*').eq(idField, transactionId).order('payment_date');

    setTransaction(transData);
    setPayments(paymentsData || []);
    setLoading(false);
  }

  useEffect(() => {
    if (transactionId) {
      fetchData();
    }
  }, [transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const remainingBalance = transaction.balance + (editingPayment ? parseFloat(editingPayment.amount) : 0);
    if (parseFloat(formData.amount) > remainingBalance) {
      alert(`O valor do pagamento não pode exceder o saldo devedor de R$ ${remainingBalance.toFixed(2)}.`);
      return;
    }

    const submissionData = { ...formData, [idField]: transactionId };
    
    const { error } = await (editingPayment
      ? supabase.from(paymentsTable).update(submissionData).eq('payment_id', editingPayment.payment_id)
      : supabase.from(paymentsTable).insert([submissionData])
    );

    if (error) {
      alert("Erro: " + error.message);
    } else {
      setFormData(formInitialState);
      setEditingPayment(null);
      fetchData();
      onDataChange();
    }
  };

  const handleEditClick = (payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_method: payment.payment_method,
      observations: payment.observations || '',
    });
  };

  const handleDeleteClick = async (paymentId) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      const { error } = await supabase.from(paymentsTable).delete().eq('payment_id', paymentId);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        fetchData();
        onDataChange();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setFormData(formInitialState);
  };

  if (loading) {
    return <div style={modalOverlayStyle}><div style={modalContentStyle}>Carregando...</div></div>;
  }
  if (!transaction) return null;

  // CORREÇÃO: Lida com os diferentes nomes de colunas para valor total.
  const totalAmount = transaction.total_amount || transaction.overall_total_amount;
  const paidAmount = totalAmount - transaction.balance;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Detalhes da {type === 'purchase' ? 'Compra' : 'Venda'}</h2>
        <p><strong>Total:</strong> R$ {totalAmount.toFixed(2)} | <strong>Pago/Recebido:</strong> R$ {paidAmount.toFixed(2)} | <strong>Saldo:</strong> R$ {transaction.balance.toFixed(2)}</p>
        <hr />
        
        <h4>{editingPayment ? "Editando Lançamento" : "Registrar Novo Pagamento/Recebimento"}</h4>
        <form onSubmit={handleSubmit} style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <input type="number" name="amount" placeholder="Valor" value={formData.amount} onChange={handleInputChange} required style={{width: '100px'}} />
            <input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} required />
            <select name="payment_method" value={formData.payment_method} onChange={handleInputChange}>
              <option>PIX</option>
              <option>Dinheiro</option>
              <option>Transferência</option>
              <option>Boleto</option>
              <option>Cartão</option>
            </select>
            <button type="submit">{editingPayment ? "Salvar" : "Adicionar"}</button>
            {editingPayment && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
        </form>
        <hr />

        <h4>Histórico de Pagamentos</h4>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Valor</th>
              <th>Método</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.payment_id}>
                <td>{new Date(p.payment_date + 'T00:00:00').toLocaleDateString()}</td>
                <td>R$ {p.amount.toFixed(2)}</td>
                <td>{p.payment_method}</td>
                <td>
                  <button onClick={() => handleEditClick(p)}>Editar</button>
                  <button onClick={() => handleDeleteClick(p.payment_id)}>Excluir</button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
                <tr><td colSpan="4">Nenhum pagamento registrado.</td></tr>
            )}
          </tbody>
        </table>

        <button onClick={onClose} style={{ marginTop: '20px' }}>Fechar</button>
      </div>
    </div>
  );
}
