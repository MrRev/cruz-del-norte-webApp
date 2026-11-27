import { ChevronDown } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

// Textos de ejemplo: deben revisarse con las políticas reales de la empresa.
const faqs = [
  { q: '¿Cuánto tiempo tengo para pagar después de elegir mi asiento?', a: 'Reservamos tu asiento por unos minutos (verás una cuenta regresiva). Si no completas el pago a tiempo, el asiento se libera para otros pasajeros.' },
  { q: '¿Necesito imprimir mi pasaje?', a: 'No. Basta con mostrar el PDF en tu celular junto con tu DNI al momento de abordar.' },
  { q: '¿Cuánto equipaje puedo llevar?', a: 'Puedes llevar una maleta en bodega de hasta 20 kg y un equipaje de mano. El exceso se cobra en el terminal.' },
  { q: '¿Pueden viajar menores de edad?', a: 'Sí. Los menores deben viajar con su DNI y, si no van con sus padres, con la autorización notarial correspondiente.' },
  { q: '¿Puedo cambiar o devolver mi pasaje?', a: 'Puedes solicitar un cambio o devolución hasta antes de la salida, según las condiciones de la tarifa. Escríbenos con tu código de pasaje.' },
  { q: '¿Qué medios de pago aceptan?', a: 'Tarjetas de débito y crédito Visa, Mastercard y American Express a través de nuestra pasarela de pago segura.' },
]

export function Faq() {
  return (
    <section id="ayuda" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Ayuda" title="Preguntas frecuentes" center />
        <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-white">
          {faqs.map(item => (
            <details key={item.q} className="group px-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown size={19} className="shrink-0 text-pine-600 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
