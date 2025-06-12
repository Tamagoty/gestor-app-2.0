// src/pages/ProductCategoriesPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const formInitialState = { name: '', description: '' };

export default function ProductCategoriesPage() {
  // Estados da página
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState(formInitialState);
  const [editingCategory, setEditingCategory] = useState(null); // Guarda o ID da categoria em edição

  // Função para buscar as categorias do banco
  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      setError(error.message);
      setCategories([]);
    } else {
      setCategories(data);
      setError(null);
    }
    setLoading(false);
  }

  // Executa a busca de categorias quando o componente é montado
  useEffect(() => {
    fetchCategories();
  }, []);

  // Função para lidar com o envio do formulário (Criar e Atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let query;
    if (editingCategory) {
      // MODO EDIÇÃO: usa o método 'update'
      query = supabase
        .from('product_categories')
        .update({ name: formData.name, description: formData.description })
        .eq('category_id', editingCategory.category_id);
    } else {
      // MODO CRIAÇÃO: usa o método 'insert'
      query = supabase.from('product_categories').insert([formData]);
    }

    const { error } = await query;

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      // Limpa o formulário e recarrega a lista de categorias
      setFormData(formInitialState);
      setEditingCategory(null);
      fetchCategories();
    }
  };
  
  // Função chamada ao clicar no botão "Editar"
  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
  };
  
  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData(formInitialState);
  };
  
  // Função chamada ao clicar no botão "Excluir"
  const handleDeleteClick = async (categoryId) => {
    // Pede confirmação antes de excluir
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('category_id', categoryId);

      if (error) {
        alert(`Erro ao excluir: ${error.message}`);
      } else {
        // Recarrega a lista de categorias
        fetchCategories();
      }
    }
  };
  
  // Função para atualizar o estado do formulário conforme o usuário digita
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Gestão de Categorias de Produtos</h2>

      {/* --- Formulário de Criação e Edição --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingCategory ? 'Editando Categoria' : 'Nova Categoria'}</h3>
        <input
          type="text"
          name="name"
          placeholder="Nome da categoria"
          value={formData.name}
          onChange={handleInputChange}
          required
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          name="description"
          placeholder="Descrição"
          value={formData.description}
          onChange={handleInputChange}
          style={{ marginRight: '10px' }}
        />
        <button type="submit">{editingCategory ? 'Salvar Alterações' : 'Adicionar Categoria'}</button>
        {editingCategory && (
          <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '5px' }}>
            Cancelar Edição
          </button>
        )}
      </form>

      {/* --- Tabela de Listagem --- */}
      <h3>Categorias Existentes</h3>
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.category_id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>
                <button onClick={() => handleEditClick(category)}>Editar</button>
                <button onClick={() => handleDeleteClick(category.category_id)} style={{ marginLeft: '5px' }}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}