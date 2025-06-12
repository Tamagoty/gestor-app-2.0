// src/pages/NewSalePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function NewSalePage() {
  // Estados para os dropdowns
  const [customers, setCustomers] = useState([]);
  const [salespeople, setSalespeople] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [products, setProducts] = useState([]);

  // Estados do formulário
  const [headerData, setHeaderData] = useState({ customer_id: '', salesperson_id: '', cost_center_id: '', sale_date: new Date().toISOString().slice(0, 10), observations: '', commission_percentage: 0 });
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ product_id: '', quantity: 1, unit_price_at_sale: '' });

  // NOVO ESTADO: para o valor calculado da comissão
  const [commissionValue, setCommissionValue] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInitialData() {
      const { data: customersData } = await supabase.from('merchants').select('merchant_id, name').in('merchant_type', ['Cliente', 'Ambos']);
      const { data: salespeopleData } = await supabase.from('salespeople').select('*').eq('is_active', true);
      const { data: costCentersData } = await supabase.from('cost_centers').select('*').eq('is_active', true);
      const { data: productsData } = await supabase.from('products').select('*').eq('is_active', true);
      
      setCustomers(customersData || []);
      setSalespeople(salespeopleData || []);
      setCostCenters(costCentersData || []);
      setProducts(productsData || []);
    }
    fetchInitialData();
  }, []);

  const calculateTotal = () => items.reduce((total, item) => total + (item.quantity * item.unit_price_at_sale), 0);

  // Efeito para recalcular a comissão sempre que os itens ou a percentagem mudam
  useEffect(() => {
    const total = calculateTotal();
    const percentage = parseFloat(headerData.commission_percentage) || 0;
    setCommissionValue(total * (percentage / 100));
  }, [items, headerData.commission_percentage]);

  useEffect(() => {
    if (currentItem.product_id) {
        const selectedProduct = products.find(p => p.product_id === currentItem.product_id);
        setCurrentItem(prev => ({ ...prev, unit_price_at_sale: selectedProduct?.sale_price || '' }));
    }
  }, [currentItem.product_id, products]);

  const handleHeaderChange = (e) => setHeaderData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCurrentItemChange = (e) => setCurrentItem(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddItem = () => {
    if (!currentItem.product_id || !currentItem.quantity || !currentItem.unit_price_at_sale) {
      alert('Preencha todos os campos do item.');
      return;
    }
    const product = products.find(p => p.product_id === currentItem.product_id);
    if (!product) { alert("Erro: Produto não encontrado."); return; }
    setItems([...items, { ...currentItem, product_name_at_sale: product.name }]);
    setCurrentItem({ product_id: '', quantity: 1, unit_price_at_sale: '' });
  };

  const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerData.customer_id || !headerData.cost_center_id) {
        alert('Selecione um Cliente e um Centro de Custo.');
        return;
    }
    if (items.length === 0) { alert('Adicione pelo menos um item à venda.'); return; }

    const { error } = await supabase.rpc('create_sale_with_items', {
      p_customer_id: headerData.customer_id,
      p_salesperson_id: headerData.salesperson_id || null,
      p_cost_center_id: headerData.cost_center_id,
      p_sale_date: headerData.sale_date,
      p_observations: headerData.observations,
      p_commission_percentage: +headerData.commission_percentage,
      p_items: items.map(({ product_id, quantity, unit_price_at_sale, product_name_at_sale }) => ({ product_id, quantity: +quantity, unit_price_at_sale: +unit_price_at_sale, product_name_at_sale }))
    });

    if (error) {
      alert('Erro ao salvar a venda: ' + error.message);
    } else {
      alert('Venda registada com sucesso!');
      navigate('/sales');
    }
  };

  return (
    <div>
      <h2>Registar Nova Venda</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Dados Gerais da Venda</legend>
          <select name="customer_id" value={headerData.customer_id} onChange={handleHeaderChange} required>
            <option value="">Selecione o Cliente</option>
            {customers.map(c => <option key={c.merchant_id} value={c.merchant_id}>{c.name}</option>)}
          </select>
          <select name="salesperson_id" value={headerData.salesperson_id} onChange={handleHeaderChange}>
            <option value="">Sem Vendedor</option>
            {salespeople.map(s => <option key={s.salesperson_id} value={s.salesperson_id}>{s.name}</option>)}
          </select>
          <select name="cost_center_id" value={headerData.cost_center_id} onChange={handleHeaderChange} required>
            <option value="">Selecione o Centro de Custo</option>
            {costCenters.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
          </select>
          <input type="date" name="sale_date" value={headerData.sale_date} onChange={handleHeaderChange} required />
          <div>
            <label>Comissão (%):</label>
            <input name="commission_percentage" type="number" step="0.01" placeholder="% de Comissão" value={headerData.commission_percentage} onChange={handleHeaderChange} />
            <span style={{marginLeft: '10px'}}>Valor da Comissão: <strong>R$ {commissionValue.toFixed(2)}</strong></span>
          </div>
        </fieldset>

        <fieldset>
          <legend>Adicionar Item</legend>
          <select name="product_id" value={currentItem.product_id} onChange={handleCurrentItemChange}>
            <option value="">Selecione um Produto</option>
            {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
          </select>
          <input name="quantity" type="number" placeholder="Qtd" value={currentItem.quantity} onChange={handleCurrentItemChange} />
          <input name="unit_price_at_sale" type="number" step="0.01" placeholder="Preço Unit." value={currentItem.unit_price_at_sale} onChange={handleCurrentItemChange} />
          <button type="button" onClick={handleAddItem}>Adicionar</button>
        </fieldset>

        <h3>Itens da Venda</h3>
        {/* MELHORIA: Tabela para feedback visual dos itens adicionados */}
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
                        <td>{item.product_name_at_sale}</td>
                        <td>{item.quantity}</td>
                        <td>R$ {parseFloat(item.unit_price_at_sale).toFixed(2)}</td>
                        <td>R$ {(item.quantity * item.unit_price_at_sale).toFixed(2)}</td>
                        <td>
                            <button type="button" onClick={() => handleRemoveItem(index)}>Remover</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <h4>Total Geral: R$ {calculateTotal().toFixed(2)}</h4>

        <button type="submit">Salvar Venda</button>
      </form>
    </div>
  );
}
