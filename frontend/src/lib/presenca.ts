import { supabase } from './supabase'
import type { RespostaPresenca } from '../types'

// upsert: a primeira resposta cria, as seguintes trocam ("mudei de ideia")
export async function responderPresenca(eventoId: string, membraId: string, resposta: RespostaPresenca) {
  const { error } = await supabase
    .from('presencas')
    .upsert(
      { evento_id: eventoId, membra_id: membraId, resposta, respondido_em: new Date().toISOString() },
      { onConflict: 'evento_id,membra_id' },
    )
  if (error) throw new Error('Não deu pra salvar sua resposta. Tenta de novo.')
}

export function linkDoMapa(local: string | null, mapaUrl: string | null): string | null {
  if (mapaUrl) return mapaUrl
  if (!local) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(local)}`
}
