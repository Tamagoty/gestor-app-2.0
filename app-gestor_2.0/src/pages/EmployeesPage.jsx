// src/pages/EmployeesPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Estado inicial com os novos campos
const formInitialState = { 
  name: '', 
  email: '', 
  phone: '', 
  is_active: true,
  is_salesperson: false, // Novo campo
  role: '' // Novo campo
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(formInitialState);
  const [editingItem, setEditingItem] = useState(null);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      alert(error.message);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await (editingItem
      ? supabase.from('employees').update(formData).eq('employee_id', editingItem.employee_id)
      : supabase.from('employees').insert([formData])
    );

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      setFormData(formInitialState);
      setEditingItem(null);
      fetchData();
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({ 
        name: item.name, 
        email: item.email || '', 
        phone: item.phone || '', 
        is_active: item.is_active,
        is_salesperson: item.is_salesperson,
        role: item.role || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(formInitialState);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Gestão de Funcionários</h2>

      {/* --- Formulário --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingItem ? 'Editando Funcionário' : 'Novo Funcionário'}</h3>
        <input name="name" placeholder="Nome completo" value={formData.name} onChange={handleInputChange} required />
        <input name="role" placeholder="Cargo (Ex: Vendedor, Gerente)" value={formData.role} onChange={handleInputChange} style={{ marginLeft: '10px' }}/>
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} style={{ marginLeft: '10px' }}/>
        <input name="phone" placeholder="Telefone" value={formData.phone} onChange={handleInputChange} style={{ marginLeft: '10px' }}/>
        
        <label style={{ marginLeft: '10px' }}>
          <input type="checkbox" name="is_salesperson" checked={formData.is_salesperson} onChange={handleInputChange} />
          É Vendedor?
        </label>

        <label style={{ marginLeft: '10px' }}>
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
          Ativo
        </label>

        <button type="submit" style={{ marginLeft: '10px' }}>{editingItem ? 'Salvar' : 'Adicionar'}</button>
        {editingItem && <button type="button" onClick={handleCancelEdit} style={{marginLeft: '5px'}}>Cancelar</button>}
      </form>

      {/* --- Tabela --- */}
      <h3>Funcionários Cadastrados</h3>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cargo</th>
            <th>Vendedor?</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((item) => (
            <tr key={item.employee_id}>
              <td>{item.name}</td>
              <td>{item.role}</td>
              <td>{item.is_salesperson ? 'Sim' : 'Não'}</td>
              <td>{item.is_active ? 'Ativo' : 'Inativo'}</td>
              <td>
                <button onClick={() => handleEditClick(item)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
