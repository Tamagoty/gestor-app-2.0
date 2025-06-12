// src/pages/MerchantsPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const formInitialState = {
  name: '',
  nickname: '',
  entity_type: 'Pessoa Física',
  document: '',
  phone: '',
  email: '',
  merchant_type: 'Cliente',
  address_street: '',
  address_city: '',
  address_state: '',
  status: 'Ativo',
};

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(formInitialState);
  const [editingMerchant, setEditingMerchant] = useState(null);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      alert(error.message);
    } else {
      setMerchants(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await (editingMerchant
      ? supabase.from('merchants').update(formData).eq('merchant_id', editingMerchant.merchant_id)
      : supabase.from('merchants').insert([formData])
    );

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      setFormData(formInitialState);
      setEditingMerchant(null);
      fetchData();
    }
  };

  const handleEditClick = (merchant) => {
    setEditingMerchant(merchant);
    // Preenche o formulário com todos os dados, garantindo que nenhum campo seja null
    setFormData({
      name: merchant.name || '',
      nickname: merchant.nickname || '',
      entity_type: merchant.entity_type || 'Pessoa Física',
      document: merchant.document || '',
      phone: merchant.phone || '',
      email: merchant.email || '',
      merchant_type: merchant.merchant_type || 'Cliente',
      address_street: merchant.address_street || '',
      address_city: merchant.address_city || '',
      address_state: merchant.address_state || '',
      status: merchant.status || 'Ativo',
    });
  };

  const handleDeleteClick = async (merchantId) => {
    if (window.confirm('Tem certeza que deseja excluir? Isso pode falhar se ele estiver associado a vendas ou compras.')) {
      const { error } = await supabase.from('merchants').delete().eq('merchant_id', merchantId);
      if (error) alert(`Erro: ${error.message}`);
      else fetchData();
    }
  };
  
  const handleCancelEdit = () => {
    setEditingMerchant(null);
    setFormData(formInitialState);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Gestão de Clientes e Fornecedores</h2>

      {/* --- Formulário --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingMerchant ? 'Editando Registro' : 'Novo Cliente/Fornecedor'}</h3>
        
        {/* Usando um grid para melhor organização do formulário */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <input name="name" placeholder="Nome / Razão Social" value={formData.name} onChange={handleInputChange} required />
            <input name="nickname" placeholder="Apelido / Nome Fantasia" value={formData.nickname} onChange={handleInputChange} />
            <select name="entity_type" value={formData.entity_type} onChange={handleInputChange}>
                <option value="Pessoa Física">Pessoa Física</option>
                <option value="Pessoa Jurídica">Pessoa Jurídica</option>
            </select>
            <input name="document" placeholder="CPF / CNPJ" value={formData.document} onChange={handleInputChange} />
            <input name="phone" placeholder="Telefone" value={formData.phone} onChange={handleInputChange} />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
            <select name="merchant_type" value={formData.merchant_type} onChange={handleInputChange}>
                <option value="Cliente">Cliente</option>
                <option value="Fornecedor">Fornecedor</option>
                <option value="Ambos">Ambos</option>
            </select>
            <input name="address_street" placeholder="Rua e Número" value={formData.address_street} onChange={handleInputChange} />
            <input name="address_city" placeholder="Cidade" value={formData.address_city} onChange={handleInputChange} />
            <input name="address_state" placeholder="Estado (UF)" value={formData.address_state} onChange={handleInputChange} />
            <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
            </select>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">{editingMerchant ? 'Salvar Alterações' : 'Adicionar'}</button>
          {editingMerchant && <button type="button" onClick={handleCancelEdit} style={{marginLeft: '5px'}}>Cancelar</button>}
        </div>
      </form>

      {/* --- Tabela --- */}
      <h3>Registros Cadastrados</h3>
      <table>
        <thead>
          <tr>
            <th>Nome / Apelido</th>
            <th>Tipo</th>
            <th>Documento</th>
            <th>Telefone</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant) => (
            <tr key={merchant.merchant_id}>
              <td>{merchant.name} {merchant.nickname && `(${merchant.nickname})`}</td>
              <td>{merchant.merchant_type}</td>
              <td>{merchant.document}</td>
              <td>{merchant.phone}</td>
              <td>{merchant.status}</td>
              <td>
                <button onClick={() => handleEditClick(merchant)}>Editar</button>
                <button onClick={() => handleDeleteClick(merchant.merchant_id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}