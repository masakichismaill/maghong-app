import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import TileSvg from './TileSvg.jsx'
import TilePalette from './TilePalette.jsx'
import { ThemeContext } from '../App.jsx'

const API = import.meta.env.VITE_API_URL ?? ''
const MAX_TILES = 13

const dark = {
  text: '#fff',
  subtext: '#aaa',
  cardBg: 'rgba(0,0,0,0.3)',
  btnBg: '#555',
  emptySlotBorder: '#555',
  emptySlotBg: 'rgba(255,255,255,0.05)',
}
const light = {
  text: '#333',
  subtext: '#666',
  cardBg: 'rgba(0,0,0,0.07)',
  btnBg: '#aaa',
  emptySlotBorder: '#bbb',
  emptySlotBg: 'rgba(0,0,0,0.04)',
}

export default function FreeMode({ gameMode = 'standard' }) {
  const { isDark } = useContext(ThemeContext)
  const t = isDark ? dark : light

  const [hand, setHand] = useState([])
  const [waitingTiles, setWaitingTiles] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 手牌エリアの自動スケーリング
  const handContainerRef = useRef(null)
  const [tileSize, setTileSize] = useState({ w: 40, h: 56, g: 3 })

  useEffect(() => {
    if (!handContainerRef.current) return
    const base = { w: 40, h: 56, g: 3 }
    const update = () => {
      const available = handContainerRef.current.offsetWidth
      const needed = MAX_TILES * base.w + (MAX_TILES - 1) * base.g
      if (needed <= available) {
        setTileSize(base)
      } else {
        const ratio = available / needed
        setTileSize({
          w: Math.floor(base.w * ratio),
          h: Math.floor(base.h * ratio),
          g: Math.max(1, Math.floor(base.g * ratio)),
        })
      }
    }
    const ro = new ResizeObserver(update)
    ro.observe(handContainerRef.current)
    update()
    return () => ro.disconnect()
  }, [])

  const judgeHand = useCallback(async (h) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/judge?mode=${gameMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hand: h }),
      })
      const data = await res.json()
      setWaitingTiles(data.waiting_tiles)
    } catch (e) {
      setError('サーバーエラー')
    } finally {
      setLoading(false)
    }
  }, [gameMode])

  useEffect(() => {
    setHand([])
    setWaitingTiles(null)
    setError(null)
  }, [gameMode])

  useEffect(() => {
    if (hand.length === MAX_TILES) {
      judgeHand(hand)
    } else {
      setWaitingTiles(null)
    }
  }, [hand, judgeHand])

  const addTile = (tileId) => {
    if (hand.length >= MAX_TILES) return
    setHand(prev => [...prev, tileId])
  }

  const removeLast = () => {
    setHand(prev => prev.slice(0, -1))
    setWaitingTiles(null)
  }

  const reset = () => {
    setHand([])
    setWaitingTiles(null)
    setError(null)
  }

  const isFull = hand.length === MAX_TILES

  return (
    <div style={styles.container}>
      <div style={{ ...styles.handSection, background: t.cardBg }}>
        <div style={styles.sectionHeader}>
          <span style={{ ...styles.sectionLabel, color: t.subtext }}>手牌 ({hand.length}/{MAX_TILES})</span>
          <div style={styles.handActions}>
            <button
              style={{ ...styles.actionBtn, background: t.btnBg, color: t.text, opacity: hand.length === 0 ? 0.4 : 1 }}
              onClick={removeLast}
              disabled={hand.length === 0}
            >
              取消
            </button>
            <button
              style={{ ...styles.actionBtn, background: t.btnBg, color: t.text, opacity: hand.length === 0 ? 0.4 : 1 }}
              onClick={reset}
              disabled={hand.length === 0}
            >
              リセット
            </button>
          </div>
        </div>

        <div
          ref={handContainerRef}
          style={{ ...styles.handTiles, gap: `${tileSize.g}px` }}
        >
          {hand.map((tileId, i) => (
            <TileSvg key={i} tileId={tileId} width={tileSize.w} height={tileSize.h} />
          ))}
          {Array.from({ length: MAX_TILES - hand.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                ...styles.emptySlot,
                width: `${tileSize.w}px`,
                height: `${tileSize.h}px`,
                border: `1.5px dashed ${t.emptySlotBorder}`,
                background: t.emptySlotBg,
              }}
            />
          ))}
        </div>
      </div>

      {isFull && (
        <div style={styles.waitSection}>
          {loading && <div style={styles.waitLabel}>判定中...</div>}
          {error && <div style={{ ...styles.waitLabel, color: '#e74c3c' }}>{error}</div>}
          {waitingTiles !== null && !loading && (
            <>
              <div style={styles.waitLabel}>
                {waitingTiles.length === 0 ? 'テンパイなし' : '待ち牌:'}
              </div>
              <div style={styles.waitTiles}>
                {waitingTiles.map(t => (
                  <TileSvg key={t} tileId={t} width={44} height={60} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ ...styles.paletteSection, background: t.cardBg }}>
        <TilePalette
          onTileClick={addTile}
          waitingTiles={isFull ? waitingTiles : null}
          disabled={isFull}
          gameMode={gameMode}
        />
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  handSection: {
    borderRadius: '8px',
    padding: '12px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  sectionLabel: { fontSize: '13px' },
  handActions: { display: 'flex', gap: '8px' },
  actionBtn: {
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    minHeight: '44px',
    minWidth: '52px',
  },
  handTiles: {
    display: 'flex',
    flexWrap: 'nowrap',
    width: '100%',
  },
  emptySlot: {
    flexShrink: 0,
    borderRadius: '4px',
  },
  waitSection: {
    background: 'rgba(241,196,15,0.1)',
    border: '1px solid rgba(241,196,15,0.3)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
  },
  waitLabel: {
    color: '#f1c40f',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  waitTiles: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  paletteSection: {
    borderRadius: '8px',
    padding: '12px',
  },
}
