import { useContext } from 'react'
import TileSvg from './TileSvg.jsx'
import { ThemeContext } from '../App.jsx'

const GROUPS = [
  { label: '萬子', tiles: Array.from({ length: 9 }, (_, i) => i) },
  { label: '筒子', tiles: Array.from({ length: 9 }, (_, i) => i + 9) },
  { label: '索子', tiles: Array.from({ length: 9 }, (_, i) => i + 18) },
  { label: '字牌', tiles: Array.from({ length: 7 }, (_, i) => i + 27) },
]

const SANMA_REMOVED = new Set([1, 2, 3, 4, 5, 6, 7])

export default function TilePalette({ onTileClick, waitingTiles = null, disabled = false, gameMode = 'standard' }) {
  const { isDark } = useContext(ThemeContext)
  const labelColor = isDark ? '#aaa' : '#666'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {GROUPS.map(({ label, tiles }) => (
        <div key={label}>
          <div style={{ color: labelColor, fontSize: '11px', marginBottom: '4px' }}>{label}</div>
          <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: '3px', paddingBottom: '2px' }}>
            {tiles.map((tileId) => {
              const isSanmaRemoved = gameMode === 'sanma' && SANMA_REMOVED.has(tileId)
              const grayed = !isSanmaRemoved && waitingTiles !== null && !waitingTiles.includes(tileId)
              return (
                <div
                  key={tileId}
                  style={{
                    flexShrink: 0,
                    opacity: isSanmaRemoved ? 0.2 : disabled ? 0.5 : 1,
                    cursor: isSanmaRemoved ? 'not-allowed' : 'default',
                    borderRadius: '4px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.18)',
                  }}
                >
                  <TileSvg
                    tileId={tileId}
                    width={36}
                    height={50}
                    grayed={grayed}
                    onClick={isSanmaRemoved || disabled ? undefined : () => onTileClick(tileId)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
