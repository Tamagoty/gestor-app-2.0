// src/pages/GeneralExpensesPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const formInitialState = {
  expense_date: new Date().toISOString().slice(0, 10),
  description: '',
  category_id: '',
  amount: '',
  cost_center_id: '',
  employee_id: null,
};

export default function GeneralExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(formInitialState);
  const [editingItem, setEditingItem] = useState(null);
  const [isSalary, setIsSalary] = useState(false);

  async function fetchData() {
    setLoading(true);
    const { data: expensesData } = await supabase.from('general_expenses').select(`*, cost_centers(name), expense_categories(name), employees(name)`).order('expense_date', { ascending: false });
    const { data: ccData } = await supabase.from('cost_centers').select('*').eq('is_active', true);
    const { data: catData } = await supabase.from('expense_categories').select('*').order('name');
    const { data: empData } = await supabase.from('employees').select('*').eq('is_active', true);

    setExpenses(expensesData || []);
    setCostCenters(ccData || []);
    setCategories(catData || []);
    setEmployees(empData || []);
    setLoading(false);
  }

  useEffect(() => { fetchData() }, []);
  
  useEffect(() => {
    const selectedCategory = categories.find(c => c.category_id === formData.category_id);
    setIsSalary(selectedCategory?.name === 'Salários');
    if (selectedCategory?.name !== 'Salários') {
        setFormData(prev => ({...prev, employee_id: null}));
    }
  }, [formData.category_id, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: cashBalance, error: balanceError } = await supabase.rpc('get_cash_balance');
    if (balanceError) {
        alert("Erro ao verificar o saldo em caixa: " + balanceError.message);
        return;
    }
    if (parseFloat(formData.amount) > cashBalance && !editingItem) {
        alert(`Não é possível registar a despesa. O valor (R$ ${formData.amount}) excede o saldo em caixa (R$ ${cashBalance.toFixed(2)}).`);
        return;
    }
    
    const submissionData = { 
        ...formData, 
        amount: parseFloat(formData.amount),
        employee_id: isSalary ? formData.employee_id : null
    };

    const { error } = await (editingItem
      ? supabase.from('general_expenses').update(submissionData).eq('expense_id', editingItem.expense_id)
      : supabase.from('general_expenses').insert([submissionData])
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
      expense_date: item.expense_date,
      description: item.description,
      category_id: item.category_id,
      amount: item.amount,
      cost_center_id: item.cost_center_id,
      employee_id: item.employee_id || null
    });
  };

  const handleDeleteClick = async (expenseId) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
        const { error } = await supabase.from('general_expenses').delete().eq('expense_id', expenseId);
        if (error) alert(error.message);
        else fetchData();
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(formInitialState);
  };

  if (loading) return <p>A carregar...</p>;

  return (
    <div>
      <h2>Despesas Gerais</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <h3>{editingItem ? 'Editando Despesa' : 'Nova Despesa'}</h3>
        <input type="date" name="expense_date" value={formData.expense_date} onChange={handleInputChange} required />
        <input name="description" placeholder="Descrição da Despesa" value={formData.description} onChange={handleInputChange} required />
        <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
          <option value="">Selecione a Categoria</option>
          {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
        </select>
        
        {isSalary && (
            <select name="employee_id" value={formData.employee_id || ''} onChange={handleInputChange} required>
                <option value="">Selecione o Funcionário</option>
                {employees.map(e => <option key={e.employee_id} value={e.employee_id}>{e.name}</option>)}
            </select>
        )}

        <input type="number" name="amount" step="0.01" placeholder="Valor" value={formData.amount} onChange={handleInputChange} required />
        <select name="cost_center_id" value={formData.cost_center_id} onChange={handleInputChange} required>
          <option value="">Selecione o Centro de Custo</option>
          {costCenters.map(cc => <option key={cc.cost_center_id} value={cc.cost_center_id}>{cc.name}</option>)}
        </select>
        <button type="submit">{editingItem ? 'Salvar' : 'Adicionar'}</button>
        {editingItem && <button type="button" onClick={handleCancelEdit}>Cancelar</button>}
      </form>

      <h3>Despesas Registadas</h3>
      <table>
        <thead>
          <tr>
            <th>Data</th><th>Descrição</th><th>Categoria</th><th>Funcionário</th><th>Centro de Custo</th><th>Valor</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => (
            <tr key={item.expense_id}>
              <td>{new Date(item.expense_date + 'T00:00:00').toLocaleDateString()}</td>
              <td>{item.description}</td>
              <td>{item.expense_categories?.name}</td>
              <td>{item.employees?.name || '-'}</td>
              <td>{item.cost_centers?.name}</td>
              <td>R$ {item.amount.toFixed(2)}</td>
              <td>
                <button onClick={() => handleEditClick(item)}>Editar</button>
                <button onClick={() => handleDeleteClick(item.expense_id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}