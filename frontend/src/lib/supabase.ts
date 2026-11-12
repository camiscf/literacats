import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chaveAnonima = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !chaveAnonima) {
  throw new Error(
    'Supabase não configurado: crie frontend/.env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (veja .env.example).',
  )
}

// A chave anônima pode ficar no navegador: quem protege os dados são as
// policies (RLS) do banco, não o segredo da chave.
export const supabase = createClient(url, chaveAnonima, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // O caminho principal é o código digitado. Mas o e-mail padrão do Supabase
    // (sem SMTP próprio) só manda link, então o app também aceita a sessão vinda da URL.
    detectSessionInUrl: true,
  },
})

// Desembrulha { data, error } do supabase-js: devolve os dados ou lança o erro.
// Deixa as telas com um único try/catch em vez de checar error em toda consulta.
export async function exigirDados<T>(
  consulta: PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T> {
  const { data, error } = await consulta
  if (error) throw new Error(error.message)
  return data as T
}
