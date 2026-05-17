import {
  Man1, Man2, Man3, Man4, Man5, Man6, Man7, Man8, Man9,
  Pin1, Pin2, Pin3, Pin4, Pin5, Pin6, Pin7, Pin8, Pin9,
  Sou1, Sou2, Sou3, Sou4, Sou5, Sou6, Sou7, Sou8, Sou9,
  Ton, Nan, Shaa, Pei, Haku, Hatsu, Chun,
} from 'react-riichi-mahjong-tiles'

const TILE_COMPONENTS = [
  Man1, Man2, Man3, Man4, Man5, Man6, Man7, Man8, Man9,
  Pin1, Pin2, Pin3, Pin4, Pin5, Pin6, Pin7, Pin8, Pin9,
  Sou1, Sou2, Sou3, Sou4, Sou5, Sou6, Sou7, Sou8, Sou9,
  Ton, Nan, Shaa, Pei, Haku, Hatsu, Chun,
]

export default function TileSvg({ tileId, width = 44, height = 64, grayed = false, selected = false, onClick }) {
  if (typeof tileId !== 'number' || tileId < 0 || tileId > 33) return null
  const TileComponent = TILE_COMPONENTS[tileId]

  const svgStyle = grayed
    ? { filter: 'grayscale(100%)', opacity: 0.55, display: 'block' }
    : { display: 'block' }

  const wrapStyle = {
    display: 'inline-block',
    borderRadius: '4px',
    outline: selected ? '2.5px solid #f1c40f' : 'none',
    outlineOffset: '1px',
    cursor: onClick ? 'pointer' : 'default',
    lineHeight: 0,
  }

  return (
    <div style={wrapStyle} onClick={onClick} role={onClick ? 'button' : undefined}>
      <TileComponent width={width} height={height} style={svgStyle} />
    </div>
  )
}
