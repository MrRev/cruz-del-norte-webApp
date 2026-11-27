import { useEffect, useState } from 'react'
import { formatSoles } from '../../../shared/format'

// El bus se dibuja visto desde arriba:
// - Pantallas anchas (≥ 768 px): HORIZONTAL, con el frente a la izquierda (como la consola).
// - Celular: VERTICAL, con el frente arriba (12 filas no entran a lo ancho).
// `columnaNumero` 1 es el lado izquierdo del bus (el del conductor).

// Vertical: posición de cada columna en la grilla, dejando un pasillo.
//   3 columnas (2+1): [1] pasillo [2][3] · 4 columnas (2+2): [1][2] pasillo [3][4]
const V_COLUMN = { 3: { 1: 1, 2: 3, 3: 4 }, 4: { 1: 1, 2: 2, 3: 4, 4: 5 } }
const V_TEMPLATE = { 3: '1fr 0.55fr 1fr 1fr', 4: '1fr 1fr 0.55fr 1fr 1fr' }

// Horizontal (frente a la izquierda): el lado izquierdo del bus queda abajo.
const H_ROW = { 3: { 3: 1, 2: 2, 1: 4 }, 4: { 4: 1, 3: 2, 2: 4, 1: 5 } }
const H_TEMPLATE = { 3: '44px 44px 18px 44px', 4: '44px 44px 18px 44px 44px' }

function useIsWide(query = '(min-width: 768px)') {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])
  return wide
}

function Seat({ seat, isMine, disabled, onToggle, style }) {
  const free = seat.disponible
  const state = isMine ? 'tuyo' : free ? 'disponible' : 'ocupado'
  const premium = seat.tipo && seat.tipo !== 'ESTANDAR'
  // Un solo color de borde por estado (dos clases de borde a la vez se pisan).
  const look = isMine
    ? 'border-mint-500 bg-mint-500 text-white'
    : free
      ? `${premium ? 'border-amber-400' : 'border-mint-200'} bg-white text-pine-700 hover:border-mint-500 hover:bg-mint-50`
      : 'border-line bg-canvas text-muted/60'
  return (
    <button
      type="button"
      disabled={disabled || (!free && !isMine)}
      onClick={() => onToggle(seat)}
      style={style}
      aria-pressed={isMine}
      aria-label={`Asiento ${seat.numero}, piso ${seat.piso}, ${formatSoles(seat.precio)}, ${state}`}
      title={`${seat.tipo} · ${formatSoles(seat.precio)}`}
      className={`h-11 min-w-10 rounded-lg border-2 text-sm font-bold transition disabled:cursor-not-allowed ${look}`}
    >
      {seat.numero}
    </button>
  )
}

const Driver = () => (
  <span className="grid size-7 place-items-center rounded-full border-2 border-muted/50 text-muted" aria-label="Conductor" title="Conductor">◉</span>
)

export function SeatMap({ map, mine, onToggle, disabled }) {
  const wide = useIsWide()
  const floors = [...new Set(map.asientos.map(s => s.piso))].sort()
  const [floor, setFloor] = useState(floors.at(-1)) // el segundo piso suele tener más asientos libres

  const seats = map.asientos.filter(s => s.piso === floor)
  const columns = seats[0]?.columnas === 3 ? 3 : 4
  const rows = Math.max(1, ...seats.map(s => s.fila))
  const freeByFloor = Object.fromEntries(floors.map(f => [f, map.asientos.filter(s => s.piso === f && s.disponible).length]))
  const seatProps = seat => ({ seat, isMine: mine.has(seat.idAsiento), disabled, onToggle })

  return (
    <div>
      {floors.length > 1 && (
        <div className="mb-4 inline-flex rounded-xl bg-mint-50 p-1" role="tablist" aria-label="Piso del bus">
          {floors.map(f => (
            <button key={f} type="button" role="tab" aria-selected={floor === f} onClick={() => setFloor(f)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${floor === f ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>
              Piso {f} <span className="font-medium text-muted">· {freeByFloor[f]} libres</span>
            </button>
          ))}
        </div>
      )}

      {wide ? (
        <div className="overflow-x-auto pb-1">
          <div className="flex w-max min-w-full items-stretch rounded-[28px] border-2 border-line bg-white">
            <div className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-dashed border-line py-4">
              <span className="text-[11px] font-semibold tracking-wide text-muted uppercase [writing-mode:vertical-rl] rotate-180">Frente</span>
              {floor === 1 && <Driver />}
            </div>
            <div className="grid flex-1 content-center gap-2 p-4" style={{ gridTemplateColumns: `repeat(${rows}, minmax(44px, 52px))`, gridTemplateRows: H_TEMPLATE[columns] }}>
              {seats.map(seat => (
                <Seat key={seat.idAsiento} {...seatProps(seat)} style={{ gridColumn: seat.fila, gridRow: H_ROW[columns][seat.columnaNumero] }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-xs rounded-[28px] border-2 border-line bg-white px-4 pt-3 pb-5 sm:px-5">
          <div className="mb-4 flex items-center justify-between border-b border-dashed border-line pb-3 text-[11px] font-semibold tracking-wide text-muted uppercase">
            {floor === 1 ? <Driver /> : <span />}
            <span>Frente</span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: V_TEMPLATE[columns] }}>
            {seats.map(seat => (
              <Seat key={seat.idAsiento} {...seatProps(seat)} style={{ gridColumn: V_COLUMN[columns][seat.columnaNumero], gridRow: seat.fila }} />
            ))}
          </div>
        </div>
      )}

      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-soft">
        <li className="flex items-center gap-2"><span className="size-4 rounded border-2 border-mint-200 bg-white" /> Disponible</li>
        <li className="flex items-center gap-2"><span className="size-4 rounded border-2 border-amber-400 bg-white" /> Preferente</li>
        <li className="flex items-center gap-2"><span className="size-4 rounded bg-mint-500" /> Tu selección</li>
        <li className="flex items-center gap-2"><span className="size-4 rounded border-2 border-line bg-canvas" /> Ocupado</li>
      </ul>
    </div>
  )
}
