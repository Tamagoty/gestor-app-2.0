// src/pages/NewPurchasePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function NewPurchasePage() {
  // Estados para popular os dropdowns
  const [suppliers, setSuppliers] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [products, setProducts] = useState([]);

  // Estados do formulário
  const [headerData, setHeaderData] = useState({ supplier_id: '', cost_center_id: '', purchase_date: new Date().toISOString().slice(0, 10), observations: '' });
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1, unit_price: '' });

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInitialData() {
      const { data: suppliersData } = await supabase.from('merchants').select('merchant_id, name').in('merchant_type', ['Fornecedor', 'Ambos']);
      const { data: costCentersData } = await supabase.from('cost_centers').select('*').eq('is_active', true);
      const { data: productsData } = await supabase.from('products').select('*').eq('is_active', true);
      
      setSuppliers(suppliersData || []);
      setCostCenters(costCentersData || []);
      setProducts(productsData || []);
    }
    fetchInitialData();
  }, []);
  
  const handleHeaderChange = (e) => {
    setHeaderData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCurrentItemChange = (e) => {
    setCurrentItem(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAddItem = () => {
    if (!currentItem.product_id || !currentItem.quantity || !currentItem.unit_price) {
      alert('Por favor, preencha todos os campos do item (Produto, Qtd, Preço).');
      return;
    }
    
    const product = products.find(p => p.product_id === currentItem.product_id);

    // **** AQUI ESTÁ A CORREÇÃO ****
    // Verifica se o produto foi encontrado antes de tentar usá-lo
    if (!product) {
        alert("Erro: Produto selecionado não foi encontrado. A lista pode estar desatualizada.");
        return;
    }

    setItems([...items, { ...currentItem, product_name_at_purchase: product.name }]);
    setCurrentItem({ product_id: '', quantity: 1, unit_price: '' });
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerData.supplier_id || !headerData.cost_center_id) {
        alert('Por favor, selecione um Fornecedor e um Centro de Custo.');
        return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um item à compra.');
      return;
    }

    const { error } = await supabase.rpc('create_purchase_with_items', {
      p_supplier_id: headerData.supplier_id,
      p_cost_center_id: headerData.cost_center_id,
      p_purchase_date: headerData.purchase_date,
      p_observations: headerData.observations,
      p_items: items.map(({ product_id, quantity, unit_price, product_name_at_purchase }) => ({ product_id, quantity: +quantity, unit_price: +unit_price, product_name_at_purchase }))
    });

    if (error) {
      alert('Erro ao salvar a compra: ' + error.message);
    } else {
      alert('Compra registrada com sucesso!');
      navigate('/purchases');
    }
  };

  return (
    <div>
      <h2>Registrar Nova Compra</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Dados Gerais</legend>
          <select name="supplier_id" value={headerData.supplier_id} onChange={handleHeaderChange} required>
            <option value="">Selecione um Fornecedor</option>
            {suppliers.map(s => <option key={s.merchant_id} value={s.merchant_id}>{s.name}</option>)}
          </select>
          <select name="cost_center_id" value={headerData.cost_center_id} onChange={handleHeaderChange} required>
            <option value="">Selecione um Centro de Custo</option>
            {costCenters.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
          </select>
          <input type="date" name="purchase_date" value={headerData.purchase_date} onChange={handleHeaderChange} required />
          <input name="observations" placeholder="Observações" value={headerData.observations} onChange={handleHeaderChange} />
        </fieldset>

        <fieldset>
          <legend>Adicionar Item</legend>
          <select name="product_id" value={currentItem.product_id} onChange={handleCurrentItemChange}>
            <option value="">Selecione um Produto</option>
            {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
          </select>
          <input name="quantity" type="number" placeholder="Qtd" value={currentItem.quantity} onChange={handleCurrentItemChange} />
          <input name="unit_price" type="number" step="0.01" placeholder="Preço Unit." value={currentItem.unit_price} onChange={handleCurrentItemChange} />
          <button type="button" onClick={handleAddItem}>Adicionar</button>
        </fieldset>

        <h3>Itens da Compra</h3>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Preço Unit.</th>
              <th>Subtotal</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.product_name_at_purchase}</td>
                <td>{item.quantity}</td>
                <td>R$ {parseFloat(item.unit_price).toFixed(2)}</td>
                <td>R$ {(item.quantity * item.unit_price).toFixed(2)}</td>
                <td><button type="button" onClick={() => handleRemoveItem(index)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Total Geral: R$ {calculateTotal().toFixed(2)}</h4>

        <button type="submit">Salvar Compra</button>
      </form>
    </div>
  );
}
