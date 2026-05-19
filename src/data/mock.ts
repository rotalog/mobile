export interface Fornecedor {
  id: number;
  nome: string;
  categoria: string;
  nota: number;
  entregas: number;
  tempo: string;
  preco_medio: string;
  distancia: string;
  cor: string;
  badge: string | null;
  img: string;
  produtos: number;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  unidade: string;
  fornecedor: string;
  img: string;
  categoria: string;
  estoque: boolean;
}

export interface Pedido {
  id: string;
  data: string;
  total: string;
  status: 'entregue' | 'cancelado' | 'pendente';
  itens: string[];
  fornecedor: string;
}

export interface Endereco {
  id: number;
  label: string;
  rua: string;
  bairro: string;
  cidade: string;
  principal: boolean;
}

export const FORNECEDORES: Fornecedor[] = [
  { id:1, nome:'Distribuidora BovPrime',  categoria:'Carnes & Frios',   nota:4.8, entregas:342, tempo:'45-60 min', preco_medio:'R$ 28/kg',  distancia:'2.3km', cor:'#FF6B6B', badge:'Mais pedido',    img:'🥩', produtos:12 },
  { id:2, nome:'Cimento Sul Materiais',   categoria:'Construção Civil', nota:4.6, entregas:187, tempo:'2-4h',      preco_medio:'R$ 42/sc',  distancia:'4.1km', cor:'#FFB347', badge:'Entrega rápida', img:'🏗️', produtos:8  },
  { id:3, nome:'Hortifruti Central',      categoria:'Frutas & Verduras',nota:4.9, entregas:521, tempo:'30-45 min', preco_medio:'R$ 7/kg',   distancia:'1.1km', cor:'#90EE90', badge:'Orgânicos',      img:'🥦', produtos:34 },
  { id:4, nome:'FrigoBom Atacado',        categoria:'Carnes & Aves',    nota:4.5, entregas:289, tempo:'1-2h',      preco_medio:'R$ 22/kg',  distancia:'3.7km', cor:'#FFB6C1', badge:null,             img:'🍗', produtos:19 },
  { id:5, nome:'AgroPecus Grãos',         categoria:'Cereais & Grãos',  nota:4.7, entregas:156, tempo:'60-90 min', preco_medio:'R$ 5/kg',   distancia:'5.2km', cor:'#DEB887', badge:'Sazonal',        img:'🌾', produtos:22 },
  { id:6, nome:'FerroMax Distribuição',   categoria:'Metalurgia',       nota:4.3, entregas:94,  tempo:'24h',       preco_medio:'R$ 180/barra',distancia:'8.0km',cor:'#B0C4DE', badge:null,             img:'🔩', produtos:15 },
];

export const PRODUTOS: Produto[] = [
  { id:1, nome:'Picanha Angus',      preco:89.90, unidade:'kg',   fornecedor:'BovPrime',   img:'🥩', categoria:'Carnes',    estoque:true  },
  { id:2, nome:'Fraldinha Premium',  preco:45.50, unidade:'kg',   fornecedor:'BovPrime',   img:'🥩', categoria:'Carnes',    estoque:true  },
  { id:3, nome:'Cimento CP-II 50kg', preco:42.00, unidade:'saco', fornecedor:'Cimento Sul',img:'🏗️', categoria:'Construção',estoque:true  },
  { id:4, nome:'Varão 12mm 12m',     preco:75.00, unidade:'barra',fornecedor:'FerroMax',   img:'🔩', categoria:'Construção',estoque:false },
  { id:5, nome:'Alface Crespa',      preco:3.50,  unidade:'maço', fornecedor:'Hortifruti', img:'🥬', categoria:'Verduras',  estoque:true  },
  { id:6, nome:'Tomate Italiano',    preco:8.90,  unidade:'kg',   fornecedor:'Hortifruti', img:'🍅', categoria:'Legumes',   estoque:true  },
  { id:7, nome:'Soja Grão 60kg',     preco:180.00,unidade:'saco', fornecedor:'AgroPecus',  img:'🌾', categoria:'Grãos',     estoque:true  },
  { id:8, nome:'Coxa de Frango',     preco:14.90, unidade:'kg',   fornecedor:'FrigoBom',   img:'🍗', categoria:'Aves',      estoque:true  },
];

export const PEDIDOS: Pedido[] = [
  { id:'#4521', data:'28 Abr', total:'R$ 348,00', status:'entregue',  itens:['Picanha 4kg','Fraldinha 2kg'],  fornecedor:'BovPrime'   },
  { id:'#4489', data:'21 Abr', total:'R$ 210,00', status:'entregue',  itens:['Cimento CP-II x5'],             fornecedor:'Cimento Sul' },
  { id:'#4401', data:'14 Abr', total:'R$ 67,50',  status:'cancelado', itens:['Alface x10','Tomate 3kg'],      fornecedor:'Hortifruti'  },
  { id:'#4377', data:'07 Abr', total:'R$ 540,00', status:'entregue',  itens:['Varão 12mm x4','Cimento x6'],   fornecedor:'FerroMax'    },
];

export const ENDERECOS: Endereco[] = [
  { id:1, label:'Casa',      rua:'R. das Acácias, 45',          bairro:'Jardim América', cidade:'Manaus - AM', principal:true  },
  { id:2, label:'Trabalho',  rua:'Av. Torquato Tapajós, 1000',  bairro:'Chapada',        cidade:'Manaus - AM', principal:false },
];

export const CATEGORIAS = ['Todos','Carnes','Construção','Hortifruti','Grãos','Metalurgia','Laticínios'];
