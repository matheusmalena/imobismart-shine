import { Property, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types/property';
import { toast } from 'sonner';

export function useExportData() {
  const exportToCSV = (properties: Property[]) => {
    if (properties.length === 0) {
      toast.error('Nenhum imóvel para exportar');
      return;
    }

    const headers = [
      'Nome',
      'Tipo',
      'Status',
      'Endereço',
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
      const costs = Number(p.condominium_fee) + Number(p.iptu_fee) + 
                   Number(p.maintenance_fee) + Number(p.other_costs);
      const profit = Number(p.monthly_revenue) - costs;
      const value = Number(p.property_value);
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
        Number(p.property_value),
        Number(p.monthly_revenue),
        Number(p.condominium_fee),
        Number(p.iptu_fee),
        Number(p.maintenance_fee),
        Number(p.other_costs),
        costs,
        profit,
        roi.toFixed(2),
        Number(p.occupancy_rate),
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
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `imoveis_${new Date().toISOString().split('T')[0]}.csv`);
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

    const data = properties.map(p => {
      const costs = Number(p.condominium_fee) + Number(p.iptu_fee) + 
                   Number(p.maintenance_fee) + Number(p.other_costs);
      const profit = Number(p.monthly_revenue) - costs;
      const value = Number(p.property_value);
      const roi = value > 0 ? ((profit * 12) / value) * 100 : 0;

      return {
        nome: p.name,
        tipo: PROPERTY_TYPE_LABELS[p.property_type],
        status: PROPERTY_STATUS_LABELS[p.status],
        endereco: {
          rua: p.address_street,
          numero: p.address_number,
          complemento: p.address_complement,
          bairro: p.address_neighborhood,
          cidade: p.address_city,
          estado: p.address_state,
          cep: p.address_zip,
        },
        financeiro: {
          valor_imovel: Number(p.property_value),
          receita_mensal: Number(p.monthly_revenue),
          custos: {
            condominio: Number(p.condominium_fee),
            iptu: Number(p.iptu_fee),
            manutencao: Number(p.maintenance_fee),
            outros: Number(p.other_costs),
            total: costs,
          },
          lucro_mensal: profit,
          roi_anual: parseFloat(roi.toFixed(2)),
          taxa_ocupacao: Number(p.occupancy_rate),
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
        data_aquisicao: p.acquisition_date,
      };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `imoveis_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dados exportados com sucesso!');
  };

  return { exportToCSV, exportToJSON };
}