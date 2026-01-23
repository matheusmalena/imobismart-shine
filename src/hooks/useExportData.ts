import { Property, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';
import { toast } from 'sonner';

interface PropertySummary {
  totalValue: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  avgROI: number;
  avgOccupancy: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const calculateSummary = (properties: Property[]): PropertySummary => {
  const totalValue = properties.reduce((sum, p) => sum + Number(p.property_value || 0), 0);
  const totalRevenue = properties.reduce((sum, p) => sum + Number(p.monthly_revenue || 0), 0);
  const totalCosts = properties.reduce((sum, p) => 
    sum + Number(p.condominium_fee || 0) + Number(p.iptu_fee || 0) + 
    Number(p.maintenance_fee || 0) + Number(p.other_costs || 0), 0
  );
  const totalProfit = totalRevenue - totalCosts;
  
  const avgROI = properties.length > 0 
    ? properties.reduce((sum, p) => {
        const profit = Number(p.monthly_revenue || 0) - (Number(p.condominium_fee || 0) + 
          Number(p.iptu_fee || 0) + Number(p.maintenance_fee || 0) + Number(p.other_costs || 0));
        return sum + (Number(p.property_value || 0) > 0 
          ? ((profit * 12) / Number(p.property_value)) * 100 
          : 0);
      }, 0) / properties.length
    : 0;
    
  const avgOccupancy = properties.length > 0
    ? properties.reduce((sum, p) => sum + Number(p.occupancy_rate || 0), 0) / properties.length
    : 0;

  return { totalValue, totalRevenue, totalCosts, totalProfit, avgROI, avgOccupancy };
};

export function useExportData() {
  const exportToCSV = (properties: Property[]) => {
    if (properties.length === 0) {
      toast.error('Nenhum imóvel para exportar');
      return;
    }

    const summary = calculateSummary(properties);

    // Summary header rows
    const summaryRows = [
      ['RELATÓRIO DE IMÓVEIS - ImobiSmart'],
      [`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`],
      [''],
      ['═══════════════════════════════════════════════════════════════'],
      ['RESUMO DO PORTFÓLIO'],
      ['═══════════════════════════════════════════════════════════════'],
      [`Total de Imóveis: ${properties.length}`],
      [`Valor Total do Portfólio: ${formatCurrency(summary.totalValue)}`],
      [`Receita Mensal Total: ${formatCurrency(summary.totalRevenue)}`],
      [`Custos Mensais Totais: ${formatCurrency(summary.totalCosts)}`],
      [`Lucro Líquido Mensal: ${formatCurrency(summary.totalProfit)}`],
      [`ROI Médio Anual: ${summary.avgROI.toFixed(2)}%`],
      [`Taxa de Ocupação Média: ${summary.avgOccupancy.toFixed(1)}%`],
      [''],
      ['═══════════════════════════════════════════════════════════════'],
      ['DETALHES POR IMÓVEL'],
      ['═══════════════════════════════════════════════════════════════'],
      [''],
    ];

    const headers = [
      'Nome',
      'Tipo',
      'Status',
      'Endereço Completo',
      'Cidade',
      'Estado',
      'CEP',
      'Valor do Imóvel',
      'Receita Mensal',
      'Condomínio',
      'IPTU',
      'Manutenção',
      'Outros Custos',
      'Custos Totais',
      'Lucro Mensal',
      'ROI Anual (%)',
      'Taxa de Ocupação (%)',
      'Área (m²)',
      'Quartos',
      'Suítes',
      'Banheiros',
      'Vagas',
      'Andar',
      'Ano Construção',
      'Piscina',
      'Academia',
      'Elevador',
      'Varanda',
      'Churrasqueira',
      'Mobiliado',
      'Data Aquisição',
    ];

    const rows = properties.map(p => {
      const costs = Number(p.condominium_fee || 0) + Number(p.iptu_fee || 0) + 
                   Number(p.maintenance_fee || 0) + Number(p.other_costs || 0);
      const profit = Number(p.monthly_revenue || 0) - costs;
      const value = Number(p.property_value || 0);
      const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;

      const fullAddress = [
        p.address_street,
        p.address_number,
        p.address_complement,
        p.address_neighborhood,
      ].filter(Boolean).join(', ');

      return [
        p.name,
        PROPERTY_TYPE_LABELS[p.property_type],
        PROPERTY_STATUS_LABELS[p.status],
        fullAddress,
        p.address_city || '',
        p.address_state || '',
        p.address_zip || '',
        formatCurrency(Number(p.property_value || 0)),
        formatCurrency(Number(p.monthly_revenue || 0)),
        formatCurrency(Number(p.condominium_fee || 0)),
        formatCurrency(Number(p.iptu_fee || 0)),
        formatCurrency(Number(p.maintenance_fee || 0)),
        formatCurrency(Number(p.other_costs || 0)),
        formatCurrency(costs),
        formatCurrency(profit),
        roi.toFixed(2),
        Number(p.occupancy_rate || 0).toFixed(1),
        p.area_sqm || '',
        p.bedrooms || 0,
        p.suites || 0,
        p.bathrooms || 0,
        p.parking_spots || 0,
        p.floor_number || '',
        p.year_built || '',
        p.has_pool ? 'Sim' : 'Não',
        p.has_gym ? 'Sim' : 'Não',
        p.has_elevator ? 'Sim' : 'Não',
        p.has_balcony ? 'Sim' : 'Não',
        p.has_barbecue ? 'Sim' : 'Não',
        p.is_furnished ? 'Sim' : 'Não',
        p.acquisition_date || '',
      ];
    });

    const csvContent = [
      ...summaryRows.map(row => row.join('')),
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `imoveis_imobismart_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dados exportados com sucesso!');
  };

  const exportToJSON = (properties: Property[]) => {
    if (properties.length === 0) {
      toast.error('Nenhum imóvel para exportar');
      return;
    }

    const summary = calculateSummary(properties);

    const data = {
      metadata: {
        gerado_em: new Date().toISOString(),
        gerado_em_formatado: `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        plataforma: 'ImobiSmart',
        versao: '1.0',
        total_imoveis: properties.length,
      },
      resumo: {
        valor_total_portfolio: summary.totalValue,
        valor_total_portfolio_formatado: formatCurrency(summary.totalValue),
        receita_mensal_total: summary.totalRevenue,
        receita_mensal_total_formatado: formatCurrency(summary.totalRevenue),
        custos_mensais_totais: summary.totalCosts,
        custos_mensais_totais_formatado: formatCurrency(summary.totalCosts),
        lucro_liquido_mensal: summary.totalProfit,
        lucro_liquido_mensal_formatado: formatCurrency(summary.totalProfit),
        roi_medio_anual: parseFloat(summary.avgROI.toFixed(2)),
        ocupacao_media: parseFloat(summary.avgOccupancy.toFixed(1)),
      },
      imoveis: properties.map(p => {
        const costs = Number(p.condominium_fee || 0) + Number(p.iptu_fee || 0) + 
                     Number(p.maintenance_fee || 0) + Number(p.other_costs || 0);
        const profit = Number(p.monthly_revenue || 0) - costs;
        const value = Number(p.property_value || 0);
        const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;

        return {
          id: p.id,
          basico: {
            nome: p.name,
            tipo: PROPERTY_TYPE_LABELS[p.property_type],
            tipo_codigo: p.property_type,
            status: PROPERTY_STATUS_LABELS[p.status],
            status_codigo: p.status,
          },
          endereco: {
            rua: p.address_street,
            numero: p.address_number,
            complemento: p.address_complement,
            bairro: p.address_neighborhood,
            cidade: p.address_city,
            estado: p.address_state,
            cep: p.address_zip,
            endereco_completo: [
              p.address_street,
              p.address_number,
              p.address_complement,
              p.address_neighborhood,
              p.address_city,
              p.address_state,
            ].filter(Boolean).join(', '),
          },
          financeiro: {
            valor_imovel: Number(p.property_value || 0),
            valor_imovel_formatado: formatCurrency(Number(p.property_value || 0)),
            receita_mensal: Number(p.monthly_revenue || 0),
            receita_mensal_formatado: formatCurrency(Number(p.monthly_revenue || 0)),
            custos: {
              condominio: Number(p.condominium_fee || 0),
              condominio_formatado: formatCurrency(Number(p.condominium_fee || 0)),
              iptu: Number(p.iptu_fee || 0),
              iptu_formatado: formatCurrency(Number(p.iptu_fee || 0)),
              manutencao: Number(p.maintenance_fee || 0),
              manutencao_formatado: formatCurrency(Number(p.maintenance_fee || 0)),
              outros: Number(p.other_costs || 0),
              outros_formatado: formatCurrency(Number(p.other_costs || 0)),
              total: costs,
              total_formatado: formatCurrency(costs),
            },
            lucro_mensal: profit,
            lucro_mensal_formatado: formatCurrency(profit),
            roi_anual: parseFloat(roi.toFixed(2)),
          },
          caracteristicas: {
            area_m2: p.area_sqm,
            quartos: p.bedrooms,
            suites: p.suites,
            banheiros: p.bathrooms,
            vagas: p.parking_spots,
            andar: p.floor_number,
            ano_construcao: p.year_built,
          },
          comodidades: {
            piscina: p.has_pool,
            academia: p.has_gym,
            elevador: p.has_elevator,
            varanda: p.has_balcony,
            churrasqueira: p.has_barbecue,
            mobiliado: p.is_furnished,
          },
          performance: {
            taxa_ocupacao: Number(p.occupancy_rate || 0),
          },
          datas: {
            data_aquisicao: p.acquisition_date,
            criado_em: p.created_at,
            atualizado_em: p.updated_at,
          },
        };
      }),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `imoveis_imobismart_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dados exportados com sucesso!');
  };

  return { exportToCSV, exportToJSON };
}
