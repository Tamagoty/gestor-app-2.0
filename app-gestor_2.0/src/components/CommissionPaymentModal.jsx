// src/components/CommissionPaymentModal.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Estilos do modal
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalContentStyle = {
  background: 'white', padding: '20px',
  borderRadius: '8px', width: '600px',
};

const formInitialState = { amount: '', payment_date: new Date().toISOString().slice(0, 10), observations: '' };

export default function CommissionPaymentModal({ salesperson, period, onClose, onDataChange }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do formulário
  const [formData, setFormData] = useState(formInitialState);
  const [editingPayment, setEditingPayment] = useState(null); // Guarda o pagamento em edição

  async function fetchPayments() {
    setLoading(true);
    // Busca a lista de pagamentos de comissão já realizados para este vendedor
    const { data } = await supabase
      .from('commission_payments')
      .select('*')
      .eq('salesperson_id', salesperson.salesperson_id)
      .gte('payment_date', period.startDate) // Opcional: filtrar pagamentos no período
      .lte('payment_date', period.endDate);  // Opcional: filtrar pagamentos no período
      
    setPayments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPayments();
  }, [salesperson, period]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Calcula o saldo restante para validação
    const currentPaid = payments.reduce((sum, p) => sum + (editingPayment?.payment_id === p.payment_id ? 0 : p.amount), 0);
    const remainingBalance = salesperson.total_commission - currentPaid;

    if (parseFloat(formData.amount) > remainingBalance) {
      alert(`O valor do pagamento não pode exceder o saldo devedor de R$ ${remainingBalance.toFixed(2)}.`);
      return;
    }

    const submissionData = {
      ...formData,
      salesperson_id: salesperson.salesperson_id,
      period_start: period.startDate,
      period_end: period.endDate,
    };

    const { error } = await (editingPayment
      ? supabase.from('commission_payments').update(submissionData).eq('payment_id', editingPayment.payment_id)
      : supabase.from('commission_payments').insert([submissionData])
    );

    if (error) {
      alert("Erro: " + error.message);
    } else {
      setFormData(formInitialState);
      setEditingPayment(null);
      await fetchPayments(); // Atualiza a lista de pagamentos no modal primeiro
      onDataChange(); // Depois atualiza o relatório principal e o cabeçalho do modal
    }
  };
  
  const handleEditClick = (payment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount,
      payment_date: payment.payment_date,
      observations: payment.observations || '',
    });
  };

  const handleDeleteClick = async (paymentId) => {
    if (window.confirm("Tem certeza que deseja excluir este pagamento de comissão?")) {
      const { error } = await supabase.from('commission_payments').delete().eq('payment_id', paymentId);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        await fetchPayments();
        onDataChange();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setFormData(formInitialState);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Gerir Comissões de {salesperson.salesperson_name}</h2>
        <p><strong>Período:</strong> {new Date(period.startDate + 'T00:00:00').toLocaleDateString()} a {new Date(period.endDate + 'T00:00:00').toLocaleDateString()}</p>
        <p><strong>Total de Comissão:</strong> R$ {salesperson.total_commission.toFixed(2)} | <strong>Total Pago:</strong> R$ {salesperson.total_paid.toFixed(2)} | <strong>Saldo:</strong> R$ {salesperson.balance.toFixed(2)}</p>
        <hr />

        <h4>{editingPayment ? "Editando Pagamento" : "Registar Novo Pagamento"}</h4>
        <form onSubmit={handleSubmit}>
          <input type="number" name="amount" placeholder="Valor" value={formData.amount} onChange={handleInputChange} required />
          <input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange} required />
          <input name="observations" placeholder="Observações" value={formData.observations} onChange={handleInputChange} />
          <button type="submit">{editingPayment ? "Salvar" : "Adicionar Pagamento"}</button>
          {editingPayment && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
        </form>
        <hr />

        <h4>Histórico de Pagamentos no Período</h4>
        <table>
          <thead><tr><th>Data</th><th>Valor</th><th>Observações</th><th>Ações</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">A carregar...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan="4">Nenhum pagamento registado para este período.</td></tr>
            ) : payments.map(p => (
              <tr key={p.payment_id}>
                <td>{new Date(p.payment_date + 'T00:00:00').toLocaleDateString()}</td>
                <td>R$ {p.amount.toFixed(2)}</td>
                <td>{p.observations}</td>
                <td>
                  <button onClick={() => handleEditClick(p)}>Editar</button>
                  <button onClick={() => handleDeleteClick(p.payment_id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={onClose} style={{ marginTop: '20px' }}>Fechar</button>
      </div>
    </div>
  );
}