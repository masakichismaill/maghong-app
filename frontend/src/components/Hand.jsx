import { useRef, useState, useEffect } from 'react'
import TileSvg from './TileSvg.jsx'

export default function Hand({ tiles, waitingTiles = null, tileWidth = 44, tileHeight = 64, gap = 4 }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ w: tileWidth, h: tileHeight, g: gap })

  useEffect(() => {
    if (!containerRef.current || tiles.length === 0) return

    const update = () => {
      const available = containerRef.current.offsetWidth
      const needed = tiles.length * tileWidth + (tiles.length - 1) * gap
      if (needed <= available) {
        setSize({ w: tileWidth, h: tileHeight, g: gap })
      } else {
        const ratio = available / needed
        setSize({
          w: Math.floor(tileWidth * ratio),
          h: Math.floor(tileHeight * ratio),
          g: Math.max(1, Math.floor(gap * ratio)),
        })
      }
    }

    const ro = new ResizeObserver(update)
    ro.observe(containerRef.current)
    update()
    return () => ro.disconnect()
  }, [tiles.length, tileWidth, tileHeight, gap])

  return (
    <div ref={containerRef} style={{ display: 'flex', flexWrap: 'nowrap', gap: `${size.g}px`, width: '100%' }}>
      {tiles.map((tileId, i) => {
        const grayed = waitingTiles !== null && !waitingTiles.includes(tileId)
        return (
          <TileSvg
            key={i}
            tileId={tileId}
            width={size.w}
            height={size.h}
            grayed={grayed}
          />
        )
      })}
    </div>
  )
}
