// Espelha as tabelas de supabase/migrations. Quando o projeto estiver de pé,
// dá pra trocar por tipos gerados com `supabase gen types typescript`.

export type PapelMembra = 'membra' | 'admin'

export interface Membra {
  id: string
  email: string
  nome: string
  apelido: string | null
  foto_url: string | null
  bio: string | null
  membra_desde: string
  papel: PapelMembra
  ativa: boolean
}

export interface Livro {
  id: string
  titulo: string
  autora: string
  genero: string | null
  paginas: number | null
  isbn: string | null
  capa_url: string | null
  partes: number
}

export interface LivroComMedia extends Livro {
  media_patinhas: number | null
  total_avaliacoes: number
  notas_1: number
  notas_2: number
  notas_3: number
  notas_4: number
  notas_5: number
  lido_no_encontro_em: string | null
}

export interface Leitura {
  membra_id: string
  livro_id: string
  progresso_pct: number
  parte_atual: number | null
  terminou: boolean
  patinhas: number | null
  tags: string[]
  personagem_favorita: string | null
  comentario: string | null
  tem_spoiler: boolean
  atualizado_em: string
}

export type CategoriaAviso = 'presenca' | 'indicacoes' | 'kit' | 'sorteios' | 'leitura_coletiva'

export interface Aviso {
  id: string
  categoria: CategoriaAviso
  titulo: string
  corpo: string | null
  imagem_url: string | null
  evento_id: string | null
  agendado_para: string | null
  enviado_em: string | null
}

export type TipoEvento = 'encontro' | 'especial'

export interface Evento {
  id: string
  tipo: TipoEvento
  titulo: string
  inicio: string
  local: string | null
  mapa_url: string | null
  valor: number | null
  descricao: string | null
  arte_url: string | null
  livro_id: string | null
}

export type RespostaPresenca = 'vou' | 'nao_vou'

export interface Presenca {
  evento_id: string
  membra_id: string
  resposta: RespostaPresenca
  respondido_em: string
}

export type StatusMensalidade = 'pendente' | 'aguardando' | 'paga'

export interface Mensalidade {
  id: string
  membra_id: string
  competencia: string
  valor: number
  vencimento: string
  status: StatusMensalidade
  paga_em: string | null
  link_pagamento: string | null
}

export interface ConfigHome {
  livro_do_mes_id: string | null
  banner_titulo: string | null
  banner_texto: string | null
  banner_imagem_url: string | null
  banner_link: string | null
  whatsapp_organizacao: string | null
}
