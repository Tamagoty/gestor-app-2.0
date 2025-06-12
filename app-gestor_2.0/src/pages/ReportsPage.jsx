// src/pages/ReportsPage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import CommissionPaymentModal from '../components/CommissionPaymentModal';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_financial_report', {
      p_report_type: reportType,
      p_start_date: startDate,
      p_end_date: endDate
    });
    
    if (error) {
      alert("Erro ao gerar relatório: " + error.message);
      setReportData([]);
    } else {
      setReportData(data || []);
    }
    setLoading(false);
    return data || []; // Retorna os novos dados
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
    setReportData(null);
  };

  // CORREÇÃO: Função onDataChange foi melhorada
  const onDataChange = async () => {
    // 1. Regenera o relatório para obter os dados mais recentes
    const newData = await handleGenerateReport();

    // 2. Se o modal estiver aberto, encontra os dados atualizados do vendedor
    if (selectedSalesperson) {
      const updatedSalesperson = newData.find(
        item => item.salesperson_id === selectedSalesperson.salesperson_id
      );

      // 3. Atualiza o estado que alimenta o modal, forçando a sua atualização
      if (updatedSalesperson) {
        setSelectedSalesperson(updatedSalesperson);
      } else {
        // Se o vendedor não for mais encontrado (ex: filtro mudou), fecha o modal
        setSelectedSalesperson(null);
      }
    }
  };

  const renderReportTable = () => {
    if (loading) return <p>A gerar relatório...</p>;
    if (reportData === null) return <p>Selecione os filtros e clique em "Gerar Relatório".</p>;
    if (reportData.length === 0) return <p>Nenhum dado encontrado para o período selecionado.</p>;

    if (reportType === 'sales') {
      return (
        <table>
          <thead><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Valor Total</th><th>Saldo</th></tr></thead>
          <tbody>
            {reportData.map(item => (
              <tr key={item.sale_id}><td>{item.sale_display_id}</td><td>{new Date(item.sale_date + 'T00:00:00').toLocaleDateString()}</td><td>{item.customer_name}</td><td>R$ {item.overall_total_amount.toFixed(2)}</td><td>R$ {item.balance.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    if (reportType === 'purchases') {
      return (
        <table>
          <thead><tr><th>Data</th><th>Fornecedor</th><th>Valor Total</th><th>Saldo</th></tr></thead>
          <tbody>
            {reportData.map(item => (
              <tr key={item.purchase_id}><td>{new Date(item.purchase_date + 'T00:00:00').toLocaleDateString()}</td><td>{item.supplier_name}</td><td>R$ {item.total_amount.toFixed(2)}</td><td>R$ {item.balance.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    if (reportType === 'commissions') {
      return (
        <table>
          <thead><tr><th>Vendedor</th><th>Total Comissão</th><th>Total Pago</th><th>Saldo</th><th>Ações</th></tr></thead>
          <tbody>
            {reportData.map(item => (
              <tr key={item.salesperson_id}>
                <td>{item.salesperson_name}</td>
                <td>R$ {item.total_commission.toFixed(2)}</td>
                <td>R$ {item.total_paid.toFixed(2)}</td>
                <td>R$ {item.balance.toFixed(2)}</td>
                <td>
                  <button onClick={() => setSelectedSalesperson(item)}>Gerir Pagamentos</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    
    return null;
  };

  return (
    <div>
      {selectedSalesperson && (
        <CommissionPaymentModal 
          salesperson={selectedSalesperson}
          period={{ startDate, endDate }}
          onClose={() => setSelectedSalesperson(null)}
          onDataChange={onDataChange}
        />
      )}

      <h2>Relatórios Financeiros</h2>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <label>Tipo de Relatório: </label>
          <select value={reportType} onChange={handleReportTypeChange}>
            <option value="sales">Vendas</option>
            <option value="purchases">Compras</option>
            <option value="commissions">Comissões</option>
          </select>
        </div>
        <div>
          <label>Data Início: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>Data Fim: </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleGenerateReport} disabled={loading}>
          {loading ? 'A gerar...' : 'Gerar Relatório'}
        </button>
      </div>

      <hr />
      
      <h3>Resultados</h3>
      {renderReportTable()}
    </div>
  );
}
