// src/pages/PartnersPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import styles from './PartnersPage.module.css';

const formInitialState = { 
  name: '', 
  cpf_cnpj: '', 
  equity_percentage: '', 
  status: 'Ativo',
  entry_date: new Date().toISOString().slice(0, 10),
  exit_date: null
};

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(formInitialState);
  const [editingItem, setEditingItem] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase.from('partners').select('*').order('name');
    if (error) {
      toast.error(error.message);
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (name === 'status' && value === 'Inativo') {
      newFormData.exit_date = new Date().toISOString().slice(0, 10);
    } else if (name === 'status' && value === 'Ativo') {
      newFormData.exit_date = null;
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentEquity = partners
        .filter(p => p.status === 'Ativo' && p.partner_id !== editingItem?.partner_id)
        .reduce((sum, p) => sum + parseFloat(p.equity_percentage || 0), 0);
    const newTotalEquity = currentEquity + parseFloat(formData.equity_percentage || 0);

    if (newTotalEquity > 100) {
        toast.error(`Erro: A participação não pode exceder 100%.`);
        return;
    }

    const submissionData = {
        ...formData,
        equity_percentage: parseFloat(formData.equity_percentage) || null,
        exit_date: formData.status === 'Inativo' ? formData.exit_date : null
    };

    const { error } = await (editingItem
      ? supabase.from('partners').update(submissionData).eq('partner_id', editingItem.partner_id)
      : supabase.from('partners').insert([submissionData])
    );

    if (error) {
      toast.error(`Erro: ${error.message}`);
    } else {
      toast.success(editingItem ? 'Sócio atualizado!' : 'Sócio adicionado!');
      setFormData(formInitialState);
      setEditingItem(null);
      fetchData();
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      cpf_cnpj: item.cpf_cnpj || '',
      equity_percentage: item.equity_percentage || '',
      status: item.status,
      entry_date: item.entry_date || '',
      exit_date: item.exit_date || null
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(formInitialState);
  };
  
  const openTransactionsModal = (partner) => {
      setSelectedPartner(partner);
      setIsModalOpen(true);
  };

  if (loading) return <p>A carregar...</p>;

  return (
    <div className={styles.pageContainer}>
      {isModalOpen && (
          <PartnerTransactionsModal 
              partner={selectedPartner}
              onClose={() => setIsModalOpen(false)}
          />
      )}

      <h2>Gestão de Sócios</h2>
      
      <div className={styles.formContainer}>
        <h3>{editingItem ? 'Editando Sócio' : 'Novo Sócio'}</h3>
        <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <input name="name" placeholder="Nome do Sócio" value={formData.name} onChange={handleInputChange} required />
              <input name="cpf_cnpj" placeholder="CPF/CNPJ" value={formData.cpf_cnpj} onChange={handleInputChange} />
              <input name="equity_percentage" type="number" step="0.01" max="100" placeholder="% de Participação" value={formData.equity_percentage} onChange={handleInputChange} />
              <div>
                <label>Data de Entrada:</label>
                <input name="entry_date" type="date" value={formData.entry_date} onChange={handleInputChange} required />
              </div>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
              </select>
              {formData.status === 'Inativo' && (
                <div>
                  <label>Data de Saída:</label>
                  <input name="exit_date" type="date" value={formData.exit_date || ''} onChange={handleInputChange} />
                </div>
              )}
            </div>
            <div className={styles.formActions}>
                <button type="submit">{editingItem ? 'Salvar Alterações' : 'Adicionar'}</button>
                {editingItem && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
            </div>
        </form>
      </div>

      <h3>Sócios Cadastrados</h3>
      <table>
        <thead>
          <tr>
            <th>Nome</th><th>Participação</th><th>Entrada</th><th>Saída</th><th>Status</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((item) => (
            <tr key={item.partner_id}>
              <td>{item.name}</td>
              <td>{item.equity_percentage ? `${item.equity_percentage}%` : '-'}</td>
              <td>{item.entry_date ? new Date(item.entry_date + 'T00:00:00').toLocaleDateString() : '-'}</td>
              <td>{item.exit_date ? new Date(item.exit_date + 'T00:00:00').toLocaleDateString() : '-'}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => handleEditClick(item)}>Editar</button>
                <button className={styles.actionButton} onClick={() => openTransactionsModal(item)}>Ver Transações</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// Componente do Modal de Transações (no mesmo arquivo para simplificar)
const modalOverlayStyle = { /* ... (mesmo estilo do modal anterior) ... */ };
const modalContentStyle = { /* ... (mesmo estilo do modal anterior) ... */ };
const transactionFormInitialState = { transaction_type: 'Aporte', amount: '', transaction_date: new Date().toISOString().slice(0, 10), description: '' };

function PartnerTransactionsModal({ partner, onClose }) {
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState(transactionFormInitialState);

    async function fetchTransactions() {
        const { data } = await supabase.from('partner_transactions').select('*').eq('partner_id', partner.partner_id).order('transaction_date', {ascending: false});
        setTransactions(data || []);
    }

    useEffect(() => { fetchTransactions() }, [partner]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('partner_transactions').insert([{
            ...formData,
            partner_id: partner.partner_id,
        }]);

        if (error) {
            toast.error("Erro ao registrar transação: " + error.message);
        } else {
            setFormData(transactionFormInitialState);
            fetchTransactions();
        }
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h2>Transações de {partner.name}</h2>
                <hr/>
                <h4>Nova Transação</h4>
                <form onSubmit={handleSubmit}>
                    <select name="transaction_type" value={formData.transaction_type} onChange={handleInputChange}>
                        <option value="Aporte">Aporte (Entrada)</option>
                        <option value="Retirada">Retirada (Saída)</option>
                    </select>
                    <input name="amount" type="number" step="0.01" placeholder="Valor" value={formData.amount} onChange={handleInputChange} required />
                    <input name="transaction_date" type="date" value={formData.transaction_date} onChange={handleInputChange} required />
                    <input name="description" placeholder="Descrição" value={formData.description} onChange={handleInputChange}/>
                    <button type="submit">Adicionar</button>
                </form>
                <hr/>
                <h4>Histórico</h4>
                <table>
                    <thead>
                        <tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.transaction_id}>
                                <td>{new Date(t.transaction_date + 'T00:00:00').toLocaleDateString()}</td>
                                <td style={{color: t.transaction_type === 'Aporte' ? 'green' : 'red'}}>{t.transaction_type}</td>
                                <td>{t.description}</td>
                                <td>R$ {t.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button onClick={onClose} style={{marginTop: '20px'}}>Fechar</button>
            </div>
        </div>
    );
}