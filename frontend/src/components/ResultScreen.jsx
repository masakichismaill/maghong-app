import { useContext } from 'react'
import TileSvg from './TileSvg.jsx'
import { ThemeContext } from '../App.jsx'

const dark = {
  text: '#fff',
  subtext: '#aaa',
  dimtext: '#ddd',
  cardBg: 'rgba(0,0,0,0.4)',
  rowBg: 'rgba(0,0,0,0.3)',
}
const light = {
  text: '#333',
  subtext: '#666',
  dimtext: '#555',
  cardBg: 'rgba(0,0,0,0.07)',
  rowBg: 'rgba(0,0,0,0.05)',
}

export default function ResultScreen({ answers, onRetry, onChangeMode }) {
  const { isDark } = useContext(ThemeContext)
  const t = isDark ? dark : light
  const score = answers.filter(a => a.correct).length

  return (
    <div style={styles.container}>
      <div style={{ ...styles.scoreBox, background: t.cardBg }}>
        <div style={{ ...styles.scoreLabel, color: t.subtext }}>結果</div>
        <div style={styles.score}>{score} / {answers.length}</div>
        <div style={{ ...styles.scoreRate, color: t.dimtext }}>
          {Math.round((score / answers.length) * 100)}%
        </div>
      </div>

      <div style={styles.list}>
        {answers.map((a, i) => (
          <div key={i} style={{
            ...styles.answerRow,
            background: t.rowBg,
            borderLeft: `4px solid ${a.correct ? '#27ae60' : '#c0392b'}`
          }}>
            <div style={styles.answerHeader}>
              <span style={styles.qLabel}>Q{a.qNum}</span>
              <TileSvg tileId={a.questionTile} width={36} height={50} />
              <span style={{ color: t.subtext, fontSize: '13px' }}>
                {a.userSaysWin ? '→ アガリと回答' : '→ スルーと回答'}
              </span>
              <span style={{
                color: a.correct ? '#27ae60' : '#c0392b',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {a.correct ? '✅' : '❌'}
              </span>
            </div>
            {!a.correct && (
              <div style={{ ...styles.correctInfo, color: t.dimtext }}>
                正解の待ち牌:
                <div style={styles.waitTiles}>
                  {a.waitingTiles.length === 0
                    ? <span style={{ color: t.subtext }}>なし</span>
                    : a.waitingTiles.map(tile => (
                      <TileSvg key={tile} tileId={tile} width={30} height={42} />
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.buttons}>
        <button style={{ ...styles.btn, background: '#27ae60' }} onClick={onRetry}>
          もう一度
        </button>
        <button style={{ ...styles.btn, background: '#7f8c8d' }} onClick={onChangeMode}>
          モード変更
        </button>
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
  scoreBox: {
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  scoreLabel: { fontSize: '14px', marginBottom: '4px' },
  score: { color: '#f1c40f', fontSize: '48px', fontWeight: 'bold', lineHeight: 1.1 },
  scoreRate: { fontSize: '18px', marginTop: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  answerRow: {
    borderRadius: '0 8px 8px 0',
    padding: '10px 12px',
  },
  answerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  qLabel: { color: '#f1c40f', fontWeight: 'bold', fontSize: '14px', minWidth: '28px' },
  correctInfo: {
    fontSize: '13px',
    marginTop: '8px',
  },
  waitTiles: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '6px',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  btn: {
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '14px 24px',
    cursor: 'pointer',
    color: '#fff',
    flex: 1,
    minHeight: '44px',
  },
}
