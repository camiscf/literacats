// Tipos principais do Literacats

export interface Membra {
  id: string
  nome: string
  foto?: string
  livrosFavoritos: string[]
  metaLeituraAnual: number
  livrosLidosNoAno: number
}

export interface Livro {
  id: string
  titulo: string
  autor: string
  capa?: string
  genero: string
  paginas?: number
  isbn?: string
}

export interface Avaliacao {
  livroId: string
  membraId: string
  estrelas: 1 | 2 | 3 | 4 | 5
  resenha?: string
  dataLeitura: string
}

export interface Sorteio {
  id: string
  mes: number
  ano: number
  livroSorteado: Livro
  sugestoes: Sugestao[]
  dataSorteio: string
}

export interface Sugestao {
  id: string
  livroTitulo: string
  membraId: string
  membraNome: string
}

export interface Encontro {
  id: string
  data: string
  livro: Livro
  local?: string
  confirmadas: string[] // IDs das membras
}
