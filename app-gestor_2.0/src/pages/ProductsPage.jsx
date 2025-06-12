// src/pages/ProductsPage.jsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const formInitialState = {
  name: '',
  description: '',
  sale_price: '',
  unit_of_measure: '',
  category_id: '' // Campo novo para o relacionamento
};

export default function ProductsPage() {
  // Estados da página
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Estado para as categorias do dropdown
  const [loading, setLoading] = useState(true);
  
  // Estados do formulário
  const [formData, setFormData] = useState(formInitialState);
  const [editingProduct, setEditingProduct] = useState(null);

  // Função para buscar dados de ambas as tabelas
  async function fetchData() {
    setLoading(true);
    
    // 1. Busca os produtos e faz um "join" para pegar o nome da categoria
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_categories ( name )
      `)
      .order('name', { ascending: true });

    // 2. Busca todas as categorias para popular o formulário
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });

    if (productsError || categoriesError) {
      alert(productsError?.message || categoriesError?.message);
    } else {
      setProducts(productsData);
      setCategories(categoriesData);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de handleSubmit, handleEditClick, handleDeleteClick...
  // A lógica é muito similar à do CRUD de Categorias,
  // mas agora lidamos com os campos de produto.

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Garante que o preço seja um número e category_id não seja uma string vazia
    const submissionData = {
      ...formData,
      sale_price: parseFloat(formData.sale_price) || null,
      category_id: formData.category_id || null,
    };

    const { error } = await (editingProduct
      ? supabase.from('products').update(submissionData).eq('product_id', editingProduct.product_id)
      : supabase.from('products').insert([submissionData])
    );

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      setFormData(formInitialState);
      setEditingProduct(null);
      fetchData(); // Recarrega todos os dados
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    // Preenche o formulário com os dados do produto, incluindo a categoria
    setFormData({
      name: product.name,
      description: product.description || '',
      sale_price: product.sale_price || '',
      unit_of_measure: product.unit_of_measure || '',
      category_id: product.category_id || '',
    });
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase.from('products').delete().eq('product_id', productId);
      if (error) alert(`Erro: ${error.message}`);
      else fetchData();
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(formInitialState);
  };


  if (loading) return <p>Carregando dados...</p>;

  return (
    <div>
      <h2>Gestão de Produtos</h2>

      {/* --- Formulário --- */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingProduct ? 'Editando Produto' : 'Novo Produto'}</h3>
        <input name="name" placeholder="Nome do produto" value={formData.name} onChange={handleInputChange} required />
        
        {/* O CAMPO DE SELEÇÃO (DROPDOWN) PARA CATEGORIAS */}
        <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
            <option value="">Selecione uma Categoria</option>
            {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                </option>
            ))}
        </select>

        <input name="sale_price" type="number" step="0.01" placeholder="Preço de Venda" value={formData.sale_price} onChange={handleInputChange} />
        <input name="unit_of_measure" placeholder="Unidade (Ex: Kg, Un, Litro)" value={formData.unit_of_measure} onChange={handleInputChange} />
        <input name="description" placeholder="Descrição" value={formData.description} onChange={handleInputChange} />
        <br/><br/>
        <button type="submit">{editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}</button>
        {editingProduct && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
      </form>

      {/* --- Tabela de Produtos --- */}
      <h3>Produtos Cadastrados</h3>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço de Venda</th>
            <th>Unidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id}>
              <td>{product.name}</td>
              {/* Exibimos o nome da categoria que veio do "join" */}
              <td>{product.product_categories?.name || 'Sem categoria'}</td>
              <td>{product.sale_price ? `R$ ${product.sale_price.toFixed(2)}` : ''}</td>
              <td>{product.unit_of_measure}</td>
              <td>
                <button onClick={() => handleEditClick(product)}>Editar</button>
                <button onClick={() => handleDeleteClick(product.product_id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}