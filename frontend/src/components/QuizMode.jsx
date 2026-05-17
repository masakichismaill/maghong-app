import { useState, useEffect, useCallback, useRef, useContext } from 'react'
import TileSvg from './TileSvg.jsx'
import Hand from './Hand.jsx'
import { ThemeContext } from '../App.jsx'

const API = import.meta.env.VITE_API_URL ?? ''
const TOTAL_QUESTIONS = 5
const AUTO_ADVANCE_SECS = 3

const dark = {
  text: '#fff',
  subtext: '#aaa',
  dimtext: '#ddd',
  cardBg: 'rgba(0,0,0,0.3)',
}
const light = {
  text: '#333',
  subtext: '#666',
  dimtext: '#555',
  cardBg: 'rgba(0,0,0,0.07)',
}

export default function QuizMode({ level, gameMode = 'standard', onFinish }) {
  const { isDark } = useContext(ThemeContext)
  const t = isDark ? dark : light

  const [qNum, setQNum] = useState(0)
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_SECS)
  const handleNextRef = useRef(null)

  const fetchQuiz = useCallback(async () => {
    setLoading(true)
    setRevealed(false)
    try {
      const res = await fetch(`${API}/api/quiz?level=${level}&mode=${gameMode}`)
      const data = await res.json()
      setQuiz(data)
    } finally {
      setLoading(false)
    }
  }, [level, gameMode])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  const handleAnswer = (userSaysWin) => {
    setRevealed(true)
    const correct = userSaysWin === quiz.is_winning
    setAnswers(prev => [...prev, {
      qNum: qNum + 1,
      hand: quiz.hand,
      questionTile: quiz.question_tile,
      isWinning: quiz.is_winning,
      userSaysWin,
      correct,
      waitingTiles: quiz.waiting_tiles,
    }])
  }

  const handleNext = () => {
    const nextQ = qNum + 1
    if (nextQ >= TOTAL_QUESTIONS) {
      onFinish(answers)
    } else {
      setQNum(nextQ)
      fetchQuiz()
    }
  }

  handleNextRef.current = handleNext

  useEffect(() => {
    if (!revealed) {
      setCountdown(AUTO_ADVANCE_SECS)
      return
    }
    setCountdown(AUTO_ADVANCE_SECS)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
    const timer = setTimeout(() => handleNextRef.current(), AUTO_ADVANCE_SECS * 1000)
    return () => { clearInterval(interval); clearTimeout(timer) }
  }, [revealed])

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={{ color: t.text, fontSize: '18px' }}>読み込み中...</div>
      </div>
    )
  }

  if (quiz === null) return null

  const stars = '★'.repeat(level) + '☆'.repeat(3 - level)
  const currentAnswer = revealed ? answers[answers.length - 1] : null

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.level}>難易度: {stars}</span>
        <span style={styles.progress}>Q{qNum + 1}/{TOTAL_QUESTIONS}</span>
      </div>

      <div style={{ ...styles.section, background: t.cardBg }}>
        <div style={{ ...styles.sectionLabel, color: t.subtext }}>手牌（13枚）</div>
        <div style={styles.handWrap}>
          <Hand tiles={quiz.hand} tileWidth={36} tileHeight={52} gap={2} />
        </div>
      </div>

      <div style={{ ...styles.section, background: t.cardBg }}>
        <div style={{ ...styles.sectionLabel, color: t.subtext }}>この牌でアガれる？</div>
        <div style={styles.questionTile}>
          <TileSvg tileId={quiz.question_tile} width={56} height={76} />
        </div>
      </div>

      {!revealed ? (
        <div style={styles.buttons}>
          <button style={{ ...styles.btn, ...styles.btnWin }} onClick={() => handleAnswer(true)}>
            アガリ！
          </button>
          <button style={{ ...styles.btn, ...styles.btnPass }} onClick={() => handleAnswer(false)}>
            スルー
          </button>
        </div>
      ) : (
        <div style={styles.result}>
          <div style={{
            ...styles.resultBadge,
            background: currentAnswer.correct ? '#27ae60' : '#c0392b'
          }}>
            {currentAnswer.correct ? '✅ 正解！' : '❌ 不正解'}
          </div>
          <div style={{ ...styles.waitInfo, color: t.dimtext }}>
            正解の待ち牌:
            <div style={styles.waitTiles}>
              {quiz.waiting_tiles.length === 0
                ? <span style={{ color: t.subtext }}>テンパイなし</span>
                : quiz.waiting_tiles.map(t => (
                  <TileSvg key={t} tileId={t} width={36} height={50} />
                ))
              }
            </div>
          </div>
          <button style={{ ...styles.btn, ...styles.btnNext }} onClick={handleNext}>
            {qNum + 1 < TOTAL_QUESTIONS ? `次の問題 → (${countdown})` : `結果を見る (${countdown})`}
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '16px',
    maxWidth: '480px',
    margin: '0 auto',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#f1c40f',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  level: {},
  progress: {},
  section: {
    borderRadius: '8px',
    padding: '12px',
  },
  sectionLabel: {
    fontSize: '13px',
    marginBottom: '10px',
  },
  handWrap: {},
  questionTile: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  btn: {
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '14px 28px',
    cursor: 'pointer',
    minWidth: '44px',
    minHeight: '44px',
    flex: 1,
  },
  btnWin: { background: '#27ae60', color: '#fff' },
  btnPass: { background: '#7f8c8d', color: '#fff' },
  btnNext: { background: '#2980b9', color: '#fff', width: '100%', marginTop: '8px' },
  result: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  resultBadge: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '10px 24px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '100%',
  },
  waitInfo: {
    fontSize: '14px',
    width: '100%',
    textAlign: 'center',
  },
  waitTiles: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
}
