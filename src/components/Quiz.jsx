import React, { useEffect, useState } from 'react'

export default function Quiz({ filePath, titleForEmail }) {
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(filePath).then(r => r.json()).then(setQuiz).catch(console.error)
  }, [filePath])

  const select = (qi, letter) => {
    const copy = [...answers]
    copy[qi] = letter
    setAnswers(copy)
  }

  const submit = async () => {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, quizPath: filePath, topic: titleForEmail })
    })
    const data = await res.json()
    setResult(data)
    setSubmitted(true)
  }

  if (!quiz) return <div className="container"><p>Loading quiz…</p></div>

  const pct = Math.round((answers.filter(Boolean).length / quiz.total_questions) * 100)

  return (
    <div className="container">
      <h2>{quiz.title}</h2>
      <p className="muted">{quiz.description}</p>
      <div className="progress"><div style={{ width: pct + '%' }}></div></div>

      {!submitted && quiz.questions.map((q, i) => {
        const letters = ['A', 'B', 'C', 'D']
        return (
          <div className="card" key={i}>
            <div style={{ fontWeight: 600 }}>Q{i + 1}. {q.question}</div>
            {q.options.map((opt, idx) => {
              const letter = letters[idx]
              const sel = answers[i] === letter
              return (
                <div
                  key={idx}
                  className={'option' + (sel ? ' selected' : '')}
                  onClick={() => select(i, letter)}
                >
                  <strong>{letter}.</strong> {opt}
                </div>
              )
            })}
          </div>
        )
      })}

      {!submitted ? (
        <button className="btn" onClick={submit} disabled={answers.length !== quiz.total_questions}>
          Submit
        </button>
      ) : (
        <div className="card">
          <h3>Results</h3>
          {result ? (
            <div>
              <p>
                Score: <strong>{result.score}</strong> / {result.total} ({result.percent.toFixed(1)}%)
              </p>
              <hr style={{ margin: '12px 0' }} />
              {result.detail?.map((d, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 600 }}>
                    Q{i + 1}. {d.q || d.question}
                  </div>
                  <div>
                    Your Answer:{' '}
                    <span style={{ color: d.ok ? '#16a34a' : '#dc2626' }}>
                      {d.user || '—'}
                    </span>{' '}
                    | Correct:{' '}
                    <strong style={{ color: '#2563eb' }}>
                      {d.correct}
                    </strong>
                  </div>
                  {d.explanation && (
                    <div style={{ fontSize: '0.9em', color: '#4b5563', marginTop: '4px' }}>
                      💬 {d.explanation}
                    </div>
                  )}
                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
                </div>
              ))}
              <p className="muted">A detailed report has also been emailed.</p>
            </div>
          ) : (
            <p>Submitted.</p>
          )}
        </div>
      )}
    </div>
  )
}
