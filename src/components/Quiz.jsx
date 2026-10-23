/** "Quick quiz: how do you gym?" — shuffled MCQs, +25 XP per correct answer. */
import { useEffect, useRef, useState } from 'react';
import { useGameState } from '../context/GameStateContext.jsx';
import { calcQuizRank } from '../lib/logic.js';
import { burst } from '../lib/fx.js';
import { XP_RULES } from '../lib/brand.js';

const LETTERS = ['A', 'B', 'C', 'D'];

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck(questions) {
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    explanation: q.explanation,
    options: shuffle([{ text: q.correct, isCorrect: true }, ...q.wrong.map((w) => ({ text: w, isCorrect: false }))]),
  }));
}

export default function Quiz({ questions }) {
  const { addXP, unlockBadge } = useGameState();

  const [deck, setDeck] = useState(() => buildDeck(questions));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [cardPhase, setCardPhase] = useState(null); // null | 'leaving' | 'entering'
  const nextBtnRef = useRef(null);
  const resultsRef = useRef(null);
  const badgesAwardedRef = useRef(false);
  const timeoutsRef = useRef([]);

  const finished = index >= deck.length;

  // Rebuild the deck if the question set changes (e.g. DB content swapped in)
  useEffect(() => {
    setDeck(buildDeck(questions));
    setIndex(0);
    setScore(0);
    setHistory([]);
    setSelectedIdx(null);
    badgesAwardedRef.current = false;
  }, [questions]);

  // Focus the Next button when feedback appears
  useEffect(() => {
    if (selectedIdx !== null && nextBtnRef.current) nextBtnRef.current.focus();
  }, [selectedIdx, index]);

  // Result badges (+ confetti on the results card)
  useEffect(() => {
    if (!finished || badgesAwardedRef.current) return;
    badgesAwardedRef.current = true;
    unlockBadge('quiz_finisher');
    if (score === 40) unlockBadge('perfect_form');

    const rect = resultsRef.current?.getBoundingClientRect();
    if (rect) burst(rect.left + rect.width / 2, rect.top + rect.height / 3, 32);
  }, [finished, score, unlockBadge]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const handleAnswer = (optionIdx, option, originEl) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(optionIdx);
    setHistory((h) => {
      const next = [...h];
      next[index] = option.isCorrect ? 'correct' : 'wrong';
      return next;
    });

    if (option.isCorrect) {
      setScore((s) => s + 10);
      addXP(XP_RULES.QUIZ_CORRECT, originEl);
      const rect = originEl.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
    }
  };

  const goToNext = () => {
    setCardPhase('leaving');
    timeoutsRef.current.push(
      setTimeout(() => {
        setSelectedIdx(null);
        setIndex((i) => i + 1);
        setCardPhase('entering');
        timeoutsRef.current.push(setTimeout(() => setCardPhase(null), 400));
      }, 280)
    );
  };

  const restart = () => {
    setDeck(buildDeck(questions));
    setIndex(0);
    setScore(0);
    setHistory([]);
    setSelectedIdx(null);
    badgesAwardedRef.current = false;
  };

  if (finished) {
    const rank = calcQuizRank(score);
    const isPerfect = score === 40;
    return (
      <section className="section-spacing quiz-section" id="quiz" aria-labelledby="quiz-heading">
        <div className="container">
          <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span className="section-label">Test your gym IQ</span>
            <h2 className="section-title" id="quiz-heading">Quick quiz: how do you gym?</h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Earn +25 XP and 10 points for every clean rep. Four questions to test your gym instincts.
            </p>
          </div>
          <div className="quiz-wrapper">
            <div className="quiz-card" ref={resultsRef}>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span className="section-label">Rep review</span>
                <h3 className="font-heading" style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Workout complete</h3>
                <div className="quiz-result-score">{score} / 40</div>
                <div>
                  <span className="quiz-result-rank">{rank}</span>
                </div>
                <p className="section-desc" style={{ margin: '0 auto 1.75rem auto' }}>
                  {isPerfect
                    ? 'Flawless form. You know your hypertrophy principles inside out. Ready for the iron.'
                    : score >= 30
                      ? 'Great gym discipline. A few adjustments in recovery and you will hit peak numbers.'
                      : 'Consistent effort beats natural talent. Get in with our coaches and master the fundamentals.'}
                </p>
                <button type="button" className="btn-solid btn-red" onClick={restart}>Play again</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const q = deck[index];
  const cardClass = [
    'quiz-card',
    cardPhase === 'leaving' ? 'slide-out-left' : '',
    cardPhase === 'entering' ? 'slide-in-right' : '',
  ].filter(Boolean).join(' ');

  return (
    <section className="section-spacing quiz-section" id="quiz" aria-labelledby="quiz-heading">
      <div className="container">
        <div className="text-center" style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <span className="section-label">Test your gym IQ</span>
          <h2 className="section-title" id="quiz-heading">Quick quiz: how do you gym?</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Earn +25 XP and 10 points for every clean rep. Four questions to test your gym instincts.
          </p>
        </div>

        <div className="quiz-wrapper">
          <div className={cardClass}>
            <div className="quiz-header">
              <span className="quiz-step-title">Question {index + 1} of {deck.length}</span>
              <span className="quiz-score-badge" aria-label="Current score">{score} pts</span>
            </div>

            <div className="quiz-progress-segments" aria-label="Quiz progress">
              {deck.map((_, i) => (
                <div
                  key={i}
                  className={`quiz-segment ${i < index ? (history[i] === 'correct' ? 'correct' : 'wrong') : i === index ? 'current' : ''}`}
                  aria-hidden="true"
                ></div>
              ))}
            </div>

            <h3 className="quiz-question-text">{q.question}</h3>

            <div className="quiz-options-list">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  className={`quiz-option-btn ${selectedIdx === i ? (opt.isCorrect ? 'state-correct' : 'state-wrong')
                    : selectedIdx !== null && opt.isCorrect ? 'state-correct' : ''}`}
                  onClick={(e) => handleAnswer(i, opt, e.currentTarget)}
                  disabled={selectedIdx !== null}
                >
                  <span className="quiz-option-letter" aria-hidden="true">{LETTERS[i]}</span>
                  <span className="quiz-option-text">{opt.text}</span>
                </button>
              ))}
            </div>

            {selectedIdx !== null && (
              <div>
                <div className="quiz-explanation-box">
                  <strong>Coach tip:</strong> {q.explanation}
                </div>
              </div>
            )}

            {selectedIdx !== null && (
              <div className="quiz-footer">
                <button type="button" className="btn-solid btn-red" ref={nextBtnRef} onClick={goToNext}>
                  Next question
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
