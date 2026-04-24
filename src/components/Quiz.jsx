import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Quiz.css';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    scene: 1,
    question: "When adding a slow neutron to a stable Uranium-235 nucleus, what primarily happens?",
    options: [
      "It permanently becomes Uranium-236.",
      "It becomes unstable and fissions into two smaller nuclei.",
      "It releases an alpha particle.",
      "Nothing happens."
    ],
    answer: 1,
    explanation: "Adding a slow neutron to U-235 creates U-236, which is highly unstable and splits apart (fissions) almost instantly."
  },
  {
    id: 2,
    scene: 2,
    question: "Why does nuclear fission release so much energy?",
    options: [
      "Burning uranium releases oxygen.",
      "The products have slightly less mass than the original nucleus, and E=mc² converts this lost mass into energy.",
      "Neutrons are very hot.",
      "Nuclear binding energy is created."
    ],
    answer: 1,
    explanation: "A tiny amount of mass is lost during fission, and according to Einstein's E=mc², that missing mass corresponds to a massive release of energy."
  },
  {
    id: 3,
    scene: 3,
    question: "What is the role of a 'moderator' (like water) in a nuclear reactor?",
    options: [
      "To heat up the fuel rods.",
      "To slow down fast neutrons so that they can effectively trigger further fissions.",
      "To absorb all the neutrons and stop the reaction.",
      "To cool the nuclear waste."
    ],
    answer: 1,
    explanation: "Fast neutrons rarely cause U-235 fissions. A moderator slows them down (thermalise) increasing their probability of causing another fission, maintaining the chain reaction."
  },
  {
    id: 4,
    scene: 4,
    question: "In a Pressurised Water Reactor (PWR), how does nuclear heat generate electricity?",
    options: [
      "The fuel rods themselves spin a generator.",
      "The hot coolant creates steam, which spins a steam turbine connected to a generator.",
      "Neutrons directly generate electric current.",
      "It heats up solar panels inside the reactor."
    ],
    answer: 1,
    explanation: "The primary heated water loop heats a secondary loop, producing steam that spins massive steam turbines, turning motion into electricity."
  },
  {
    id: 5,
    scene: 5,
    question: "Which of the following describes Gamma radiation?",
    options: [
      "A heavy particle consisting of 2 protons and 2 neutrons.",
      "A single high-speed electron.",
      "High-energy electromagnetic waves that require lead or concrete to block.",
      "A neutron trying to escape the reactor."
    ],
    answer: 2,
    explanation: "Unlike alpha and beta particles, gamma rays are photons (electromagnetic waves) which are highly penetrating and require dense materials like lead to block effectively."
  },
  {
    id: 6,
    scene: 6,
    question: "What happens to spent nuclear fuel (high-level waste) initially upon removal from a reactor?",
    options: [
      "It is immediately buried deep underground.",
      "It is thrown into the ocean.",
      "It cools in deep spent fuel pools for several years to shed residual heat and radiation.",
      "It is turned into steam."
    ],
    answer: 2,
    explanation: "Spent assemblies are intensely hot and radioactive, so they must be cooled safely under water for about 5-10 years before being transferred to dry casks or reprocessed."
  }
];

const Quiz = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSubmit = () => {
    if (selected === q.answer) {
      setScore(prev => prev + 1);
    }
    setSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setSubmitted(false);
      setSelected(null);
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      // Persist score
      localStorage.setItem('nuclear101-quiz-score', score + (selected === q.answer ? 1 : 0));
    }
  };

  if (quizFinished) {
    const finalScore = score + (submitted && selected === q.answer ? 1 : 0);
    return (
      <motion.div className="quiz-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h3>Quiz Complete!</h3>
        <div className="quiz-score-circle">
          {finalScore} / {QUIZ_QUESTIONS.length}
        </div>
        <p>{finalScore === QUIZ_QUESTIONS.length ? "Perfect score! You're an expert." : "Great effort!"}</p>
        <button onClick={onComplete} className="quiz-btn-primary">Return to Review</button>
      </motion.div>
    );
  }

  return (
    <motion.div className="quiz-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Progress header */}
      <div className="quiz-header">
        <h4>Knowledge Check</h4>
        <div className="quiz-progress-text">Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</div>
      </div>
      
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${((currentIdx) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>

      <div className="quiz-body">
        <h2 className="quiz-question">{q.question}</h2>
        
        <div className="quiz-options">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.answer;
            const isSelected = i === selected;
            
            let statusClass = '';
            if (submitted) {
              if (isCorrect) statusClass = 'correct';
              else if (isSelected && !isCorrect) statusClass = 'incorrect';
              else statusClass = 'dimmed';
            }

            return (
              <button
                key={i}
                className={`quiz-option-btn ${isSelected ? 'selected' : ''} ${statusClass}`}
                onClick={() => !submitted && setSelected(i)}
                disabled={submitted}
              >
                <div className="quiz-opt-letter">{String.fromCharCode(65 + i)}</div>
                <div className="quiz-opt-text">{opt}</div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {submitted && (
            <motion.div 
              className={`quiz-feedback ${selected === q.answer ? 'feedback-correct' : 'feedback-incorrect'}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="feedback-result">
                {selected === q.answer ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <p className="feedback-reason">{q.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="quiz-footer">
          {!submitted ? (
            <button 
              className="quiz-btn-primary" 
              disabled={selected === null}
              onClick={handleSubmit}
            >Submit Answer</button>
          ) : (
            <button 
              className="quiz-btn-primary"
              onClick={handleNext}
            >{currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'}</button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Quiz;