// Serviço de API do Literacats

const API_URL = 'http://localhost:5203'

// Tipos que correspondem ao backend
export interface Livro {
  id: string
  titulo: string
  autor: string
  genero: string
  paginas?: number
  isbn?: string
  capa?: string
  dataCadastro?: string
}

export interface Membra {
  id: string
  nome: string
  apelido: string
  bio: string
  foto?: string
  metaLeituraAnual: number
  membraDesde?: string
}

export interface MembraLivro {
  membraId: string
  livroId: string
  status: 'quero_ler' | 'lendo' | 'lido'
  estrelas?: number
  resenha?: string
  dataLeitura?: string
}

export interface Sugestao {
  livroTitulo: string
  membraId: string
  membraNome: string
}

export interface Sorteio {
  id: string
  mes: number
  ano: number
  sugestoes: Sugestao[]
  livroSorteadoId?: string
  livroSorteadoTitulo?: string
  dataSorteio?: string
}

// Funções de API

// Livros
export async function listarLivros(): Promise<Livro[]> {
  const res = await fetch(`${API_URL}/livros`)
  if (!res.ok) throw new Error('Erro ao buscar livros')
  return res.json()
}

export async function buscarLivro(id: string): Promise<Livro | null> {
  const res = await fetch(`${API_URL}/livros/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Erro ao buscar livro')
  return res.json()
}

export async function adicionarLivro(livro: Omit<Livro, 'id' | 'dataCadastro'>): Promise<Livro> {
  const res = await fetch(`${API_URL}/livros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(livro),
  })
  if (!res.ok) throw new Error('Erro ao adicionar livro')
  return res.json()
}

// Membras
export async function listarMembras(): Promise<Membra[]> {
  const res = await fetch(`${API_URL}/membras`)
  if (!res.ok) throw new Error('Erro ao buscar membras')
  return res.json()
}

export async function buscarMembra(id: string): Promise<Membra | null> {
  const res = await fetch(`${API_URL}/membras/${id}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Erro ao buscar membra')
  return res.json()
}

export async function buscarLivrosDaMembra(membraId: string): Promise<MembraLivro[]> {
  const res = await fetch(`${API_URL}/membras/${membraId}/livros`)
  if (res.status === 404) return []
  if (!res.ok) throw new Error('Erro ao buscar livros da membra')
  return res.json()
}

export async function salvarMembraLivro(membraId: string, livroId: string, dados: Partial<MembraLivro>): Promise<MembraLivro> {
  const res = await fetch(`${API_URL}/membras/${membraId}/livros/${livroId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!res.ok) throw new Error('Erro ao salvar livro da membra')
  return res.json()
}

// Sorteio
export async function obterSorteioAtual(): Promise<Sorteio> {
  const res = await fetch(`${API_URL}/sorteio`)
  if (!res.ok) throw new Error('Erro ao buscar sorteio')
  return res.json()
}

export async function adicionarSugestao(livroTitulo: string, membraId: string, membraNome: string): Promise<Sugestao> {
  const res = await fetch(`${API_URL}/sorteio/sugestoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ livroTitulo, membraId, membraNome }),
  })
  if (!res.ok) throw new Error('Erro ao adicionar sugestao')
  return res.json()
}

export async function realizarSorteio(): Promise<Sorteio> {
  const res = await fetch(`${API_URL}/sorteio/sortear`, {
    method: 'POST',
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.erro || 'Erro ao realizar sorteio')
  }
  return res.json()
}
