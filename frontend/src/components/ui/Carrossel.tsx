import { Children, useRef, useState, type ReactNode } from 'react'

// Rolagem horizontal nativa com encaixe. A ponta do próximo card fica visível
// para sugerir o gesto de arrastar.
export function Carrossel({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const trilho = useRef<HTMLDivElement>(null)
  const [ativo, setAtivo] = useState(0)
  const itens = Children.toArray(children)

  const aoRolar = () => {
    const el = trilho.current
    if (!el || !el.firstElementChild) return
    const largura = (el.firstElementChild as HTMLElement).offsetWidth + 12
    setAtivo(Math.round(el.scrollLeft / largura))
  }

  return (
    <section aria-label={rotulo} className="flex flex-col gap-3">
      <div
        ref={trilho}
        onScroll={aoRolar}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-1 [scrollbar-width:none]"
      >
        {itens.map((item, i) => (
          <div key={i} className="w-[85%] max-w-[320px] shrink-0 snap-start">
            {item}
          </div>
        ))}
      </div>
      {itens.length > 1 && (
        <div aria-hidden="true" className="flex justify-center gap-1.5">
          {itens.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === ativo ? 'w-5 bg-scar' : 'w-2 bg-pantufa'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
