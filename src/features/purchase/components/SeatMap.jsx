import { useState } from 'react'
import { formatSoles } from '../../../shared/format'

// Posición de cada columna del bus en la grilla, dejando un pasillo:
// 3 columnas (2+1): [1] pasillo [2][3] · 4 columnas (2+2): [1][2] pasillo [3][4]
const GRID_COLUMN = { 3: { 1: 1, 2: 3, 3: 4 }, 4: { 1: 1, 2: 2, 3: 4, 4: 5 } }
const TEMPLATE = { 3: '1fr 0.55fr 1fr 1fr', 4: '1fr 1fr 0.55fr 1fr 1fr' }

export function SeatMap({ map, mine, onToggle, disabled }) {
  const floors = [...new Set(map.asientos.map(s => s.piso))].sort()
  const [floor, setFloor] = useState(floors.at(-1)) // el segundo piso suele tener más asientos libres

  const seats = map.asientos.filter(s => s.piso === floor)
  const columns = seats[0]?.columnas || 4
  const freeByFloor = Object.fromEntries(floors.map(f => [f, map.asientos.filter(s => s.piso === f && s.disponible).length]))

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

      <div className="mx-auto max-w-xs rounded-[28px] border-2 border-line bg-white px-4 pt-3 pb-5 sm:px-5">
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-line pb-3 text-[11px] font-semibold tracking-wide text-muted uppercase">
          <span>Frente</span>
          {floor === 1 && <span className="grid size-7 place-items-center rounded-full border-2 border-muted/50" aria-label="Conductor" title="Conductor">◉</span>}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: TEMPLATE[columns] || TEMPLATE[4] }}>
          {seats.map(seat => {
            const isMine = mine.has(seat.idAsiento)
            const free = seat.disponible
            const state = isMine ? 'tuyo' : free ? 'disponible' : 'ocupado'
            return (
              <button
                key={seat.idAsiento}
                type="button"
                disabled={disabled || (!free && !isMine)}
                onClick={() => onToggle(seat)}
                style={{ gridColumn: (GRID_COLUMN[columns] || GRID_COLUMN[4])[seat.columnaNumero], gridRow: seat.fila }}
                aria-pressed={isMine}
                aria-label={`Asiento ${seat.numero}, piso ${seat.piso}, ${formatSoles(seat.precio)}, ${state}`}
                title={`${seat.tipo} · ${formatSoles(seat.precio)}`}
                className={`relative h-11 rounded-lg rounded-t-xl border-2 text-sm font-bold transition
                  ${isMine ? 'border-mint-500 bg-mint-500 text-white' : ''}
                  ${free && !isMine ? 'border-mint-200 bg-white text-pine-700 hover:border-mint-500 hover:bg-mint-50' : ''}
                  ${!free && !isMine ? 'border-line bg-canvas text-muted/60' : ''}
                  ${seat.tipo !== 'ESTANDAR' && free && !isMine ? 'border-amber-400/70' : ''}
                  disabled:cursor-not-allowed`}
              >
                {seat.numero}
              </button>
            )
          })}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-soft">
        <li className="flex items-center gap-2"><span className="size-4 rounded border-2 border-mint-200 bg-white" /> Disponible</li>
        <li className="flex items-center gap-2"><span className="size-4 rounded border-2 border-amber-400/70 bg-white" /> Preferente</li>
        <li className="flex items-center gap-2"><span className="size-4 rounded bg-mint-500" /> Tu selección</li>
        <li className="flex items-center gap-2"><span className="size-4 rounded border-2 border-line bg-canvas" /> Ocupado</li>
      </ul>
    </div>
  )
}
