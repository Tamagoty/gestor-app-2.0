// src/pages/CostCentersPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const formInitialState = { name: '', is_active: true };

export default function CostCentersPage() {
  const [costCenters, setCostCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(formInitialState);
  const [editingItem, setEditingItem] = useState(null);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cost_centers')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      alert(error.message);
    } else {
      setCostCenters(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Lida tanto com o input de texto quanto com o checkbox
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await (editingItem
      ? supabase.from('cost_centers').update(formData).eq('cost_center_id', editingItem.cost_center_id)
      : supabase.from('cost_centers').insert([formData])
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
    setFormData({ name: item.name, is_active: item.is_active });
  };

  // A exclusão de Centros de Custo pode ser perigosa, então vamos focar em desativar.
  // Se a exclusão for necessária, o código seria similar ao das outras páginas.
  // const handleDeleteClick = ...

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(formInitialState);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Gestão de Centros de Custo</h2>

      {/* --- Formulário --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingItem ? 'Editando Centro de Custo' : 'Novo Centro de Custo'}</h3>
        <input name="name" placeholder="Nome (Ex: Administrativo, Obra X)" value={formData.name} onChange={handleInputChange} required />
        
        <label style={{ marginLeft: '10px' }}>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
          Ativo
        </label>

        <button type="submit" style={{ marginLeft: '10px' }}>{editingItem ? 'Salvar' : 'Adicionar'}</button>
        {editingItem && <button type="button" onClick={handleCancelEdit} style={{marginLeft: '5px'}}>Cancelar</button>}
      </form>

      {/* --- Tabela --- */}
      <h3>Centros de Custo Cadastrados</h3>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {costCenters.map((item) => (
            <tr key={item.cost_center_id}>
              <td>{item.name}</td>
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