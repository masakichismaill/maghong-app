import { useState, useEffect, createContext } from 'react'
import QuizMode from './components/QuizMode.jsx'
import ResultScreen from './components/ResultScreen.jsx'
import FreeMode from './components/FreeMode.jsx'

const MODES = { HOME: 'home', QUIZ: 'quiz', RESULT: 'result', FREE: 'free' }

export const ThemeContext = createContext({ isDark: true })

export default function App() {
  const [mode, setMode] = useState(MODES.HOME)
  const [level, setLevel] = useState(1)
  const [answers, setAnswers] = useState([])
  const [gameMode, setGameMode] = useState('standard')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    document.body.style.background = isDark ? '#1e1e1e' : '#f5f0e8'
  }, [isDark])

  const startQuiz = (l) => {
    setLevel(l)
    setAnswers([])
    setMode(MODES.QUIZ)
  }

  const onQuizFinish = (ans) => {
    setAnswers(ans)
    setMode(MODES.RESULT)
  }

  const t = isDark ? dark : light

  return (
    <ThemeContext.Provider value={{ isDark }}>
      <div style={{ ...styles.app, color: t.text }}>
        <header style={{ ...styles.header, background: t.headerBg, borderBottomColor: t.border }}>
          <button style={{ ...styles.titleBtn }} onClick={() => setMode(MODES.HOME)}>
            🀄 麻雀待ち練習
          </button>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              style={{ ...styles.themeBtn }}
              onClick={() => setIsDark(d => !d)}
              title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {mode !== MODES.HOME && (
              <button style={{ ...styles.homeBtn, background: t.btnInactiveBg, color: t.text, borderColor: t.border }} onClick={() => setMode(MODES.HOME)}>
                ホーム
              </button>
            )}
          </div>
        </header>

        <main style={styles.main}>
          {mode === MODES.HOME && (
            <HomeScreen
              gameMode={gameMode}
              onSetGameMode={setGameMode}
              onStartQuiz={startQuiz}
              onFreeMode={() => setMode(MODES.FREE)}
              isDark={isDark}
            />
          )}
          {mode === MODES.QUIZ && (
            <QuizMode
              level={level}
              gameMode={gameMode}
              onFinish={onQuizFinish}
            />
          )}
          {mode === MODES.RESULT && (
            <ResultScreen
              answers={answers}
              onRetry={() => startQuiz(level)}
              onChangeMode={() => setMode(MODES.HOME)}
            />
          )}
          {mode === MODES.FREE && <FreeMode gameMode={gameMode} />}
        </main>
      </div>
    </ThemeContext.Provider>
  )
}

function HomeScreen({ gameMode, onSetGameMode, onStartQuiz, onFreeMode, isDark }) {
  const t = isDark ? dark : light
  return (
    <div style={styles.home}>
      <div style={styles.homeTitle}>
        <div style={styles.bigEmoji}>🀄</div>
        <h1 style={styles.h1}>麻雀待ち練習</h1>
        <p style={{ ...styles.subtitle, color: t.subtext }}>テンパイ・待ち牌判断力を鍛えよう</p>
      </div>

      <div style={{ ...styles.section, background: t.cardBg }}>
        <h2 style={styles.h2}>ゲームモード</h2>
        <div style={styles.gameModeToggle}>
          <button
            style={{
              ...styles.gameModeBtn,
              ...(gameMode === 'standard'
                ? styles.gameModeBtnActive
                : { ...styles.gameModeBtnInactive, background: t.btnInactiveBg, color: t.subtext }),
            }}
            onClick={() => onSetGameMode('standard')}
          >
            <div style={styles.gameModeName}>4人麻雀</div>
            <div style={styles.gameModeDesc}>萬子1〜9・筒子・索子・字牌</div>
          </button>
          <button
            style={{
              ...styles.gameModeBtn,
              ...(gameMode === 'sanma'
                ? styles.gameModeBtnActive
                : { ...styles.gameModeBtnInactive, background: t.btnInactiveBg, color: t.subtext }),
            }}
            onClick={() => onSetGameMode('sanma')}
          >
            <div style={styles.gameModeName}>3人麻雀</div>
            <div style={styles.gameModeDesc}>萬子2〜8なし・27種</div>
          </button>
        </div>
      </div>

      <div style={{ ...styles.section, background: t.cardBg }}>
        <h2 style={styles.h2}>クイズモード</h2>
        <p style={{ ...styles.desc, color: t.dimtext }}>手牌＋提示牌が表示されます。アガれるか判断してください。</p>
        <div style={styles.levelBtns}>
          {[1, 2, 3].map(l => (
            <button
              key={l}
              style={{ ...styles.levelBtn, ...levelColors[l] }}
              onClick={() => onStartQuiz(l)}
            >
              <div style={styles.levelStars}>{'★'.repeat(l) + '☆'.repeat(3 - l)}</div>
              <div style={styles.levelName}>{levelNames[l]}</div>
              <div style={styles.levelDesc}>{levelDescs[l]}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...styles.section, background: t.cardBg }}>
        <h2 style={styles.h2}>自由入力モード</h2>
        <p style={{ ...styles.desc, color: t.dimtext }}>好きな手牌を入力して待ち牌を確認できます。</p>
        <button style={styles.freeBtn} onClick={onFreeMode}>
          自由入力モードへ →
        </button>
      </div>
    </div>
  )
}

const dark = {
  text: '#fff',
  subtext: '#aaa',
  dimtext: '#ccc',
  cardBg: 'rgba(0,0,0,0.3)',
  headerBg: 'rgba(0,0,0,0.4)',
  border: 'rgba(255,255,255,0.1)',
  btnInactiveBg: 'rgba(255,255,255,0.07)',
}
const light = {
  text: '#333',
  subtext: '#666',
  dimtext: '#555',
  cardBg: 'rgba(0,0,0,0.07)',
  headerBg: 'rgba(0,0,0,0.08)',
  border: 'rgba(0,0,0,0.1)',
  btnInactiveBg: 'rgba(0,0,0,0.07)',
}

const levelNames = { 1: '初級', 2: '中級', 3: '上級' }
const levelDescs = {
  1: '待ち1〜2種（両面・単騎など）',
  2: '待ち3〜4種',
  3: '待ち5種以上（多面待ち）',
}
const levelColors = {
  1: { background: '#27ae60' },
  2: { background: '#e67e22' },
  3: { background: '#c0392b' },
}

const styles = {
  app: { minHeight: '100vh' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid',
  },
  titleBtn: {
    background: 'none',
    border: 'none',
    color: '#f1c40f',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  themeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  homeBtn: {
    border: '1px solid',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: { padding: '0 0 40px' },
  home: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px 16px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  homeTitle: { textAlign: 'center' },
  bigEmoji: { fontSize: '64px', marginBottom: '8px' },
  h1: { fontSize: '28px', fontWeight: 'bold', color: '#f1c40f', marginBottom: '8px' },
  subtitle: { fontSize: '14px' },
  section: {
    borderRadius: '12px',
    padding: '16px',
  },
  h2: { fontSize: '18px', fontWeight: 'bold', color: '#f1c40f', marginBottom: '8px' },
  desc: { fontSize: '14px', marginBottom: '14px' },
  gameModeToggle: { display: 'flex', gap: '10px' },
  gameModeBtn: {
    flex: 1,
    border: '2px solid transparent',
    borderRadius: '8px',
    padding: '12px 10px',
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: '44px',
  },
  gameModeBtnActive: {
    background: '#2c3e50',
    borderColor: '#f1c40f',
    color: '#fff',
  },
  gameModeBtnInactive: {},
  gameModeName: { fontSize: '16px', fontWeight: 'bold', marginBottom: '2px' },
  gameModeDesc: { fontSize: '11px', opacity: 0.8 },
  levelBtns: { display: 'flex', flexDirection: 'column', gap: '10px' },
  levelBtn: {
    border: 'none',
    borderRadius: '8px',
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    color: '#fff',
    minHeight: '44px',
  },
  levelStars: { fontSize: '14px', marginBottom: '2px' },
  levelName: { fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' },
  levelDesc: { fontSize: '12px', opacity: 0.8 },
  freeBtn: {
    width: '100%',
    background: '#2980b9',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '14px',
    cursor: 'pointer',
    minHeight: '44px',
  },
}
