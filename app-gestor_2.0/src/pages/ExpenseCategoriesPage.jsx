// src/pages/ExpenseCategoriesPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const formInitialState = { name: '' };

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(formInitialState);
  const [editingItem, setEditingItem] = useState(null);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      alert(error.message);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await (editingItem
      ? supabase.from('expense_categories').update(formData).eq('category_id', editingItem.category_id)
      : supabase.from('expense_categories').insert([formData])
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
    setFormData({ name: item.name });
  };

  const handleDeleteClick = async (categoryId) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria? Ela pode estar em uso por despesas já lançadas.")) {
      const { error } = await supabase.from('expense_categories').delete().eq('category_id', categoryId);
      if (error) {
        alert("Não foi possível excluir. Erro: " + error.message);
      } else {
        fetchData();
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(formInitialState);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Gestão de Categorias de Despesa</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingItem ? 'Editando Categoria' : 'Nova Categoria'}</h3>
        <input name="name" placeholder="Nome (Ex: Salários, Aluguel)" value={formData.name} onChange={handleInputChange} required />
        <button type="submit" style={{ marginLeft: '10px' }}>{editingItem ? 'Salvar' : 'Adicionar'}</button>
        {editingItem && <button type="button" onClick={handleCancelEdit} style={{marginLeft: '5px'}}>Cancelar</button>}
      </form>

      <h3>Categorias Cadastradas</h3>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.category_id}>
              <td>{item.name}</td>
              <td>
                <button onClick={() => handleEditClick(item)}>Editar</button>
                <button onClick={() => handleDeleteClick(item.category_id)} style={{marginLeft: '5px'}}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}