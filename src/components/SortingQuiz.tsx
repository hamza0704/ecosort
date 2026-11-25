import { useState } from 'react';
import {
  advanceQuizState,
  BIN_ORDER,
  BIN_REGISTRY,
  createInitialQuizState,
  QUIZ_QUESTIONS,
  submitQuizAnswer,
  type BinColor,
} from '../utils/wasteLogic';

export function SortingQuiz() {
  const [quiz, setQuiz] = useState(createInitialQuizState);

  const currentQuestion = QUIZ_QUESTIONS[quiz.currentIndex];
  const isAnswered = quiz.selectedBin !== null;
  const isCorrect = isAnswered && quiz.selectedBin === currentQuestion.correctBin;

  const handleChoose = (bin: BinColor) => {
    setQuiz((prev) => submitQuizAnswer(prev, bin));
  };

  const handleNext = () => {
    setQuiz((prev) => advanceQuizState(prev));
  };

  const handleRestart = () => {
    setQuiz(createInitialQuizState());
  };

  return (
    <section id="quiz-section" className="py-14">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#dce3de] bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#dce3de] pb-5">
            <div>
              <h2 className="text-xl font-bold text-[#14211a]">
                Tricky Waste Sorting Mini-Quiz
              </h2>
              <p className="mt-1 text-sm text-[#425449]">
                Check your judgment on three commonly mis-sorted everyday items.
              </p>
            </div>
            <div className="font-mono-num flex items-center gap-2 text-xs font-medium text-[#425449]">
              <span>
                Question {Math.min(quiz.currentIndex + 1, QUIZ_QUESTIONS.length)} of{' '}
                {QUIZ_QUESTIONS.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Score: {quiz.score} / {QUIZ_QUESTIONS.length}
              </span>
            </div>
          </div>

          {!quiz.completed ? (
            <div>
              <p className="mb-5 text-base font-semibold text-[#14211a]">
                {quiz.currentIndex + 1}. {currentQuestion.question}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Dustbin options">
                {BIN_ORDER.map((binId) => {
                  const bin = BIN_REGISTRY[binId];
                  let buttonStyle =
                    'border-[#c2cdc5] bg-[#f7f9f7] hover:border-[#15803d] hover:bg-[#ecfdf3]';

                  if (isAnswered) {
                    if (binId === currentQuestion.correctBin) {
                      buttonStyle = 'border-[#15803d] bg-[#ecfdf3]';
                    } else if (binId === quiz.selectedBin && !isCorrect) {
                      buttonStyle = 'border-[#dc2626] bg-[#fef2f2]';
                    } else {
                      buttonStyle = 'border-[#dce3de] bg-white opacity-60';
                    }
                  }

                  return (
                    <button
                      key={binId}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleChoose(binId)}
                      className={`flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d] disabled:cursor-default ${buttonStyle}`}
                    >
                      <span className="text-sm font-semibold text-[#14211a]">
                        {bin.name}
                      </span>
                      <span className="text-xs text-[#64756a]">{bin.category}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  aria-live="polite"
                  className={`mt-5 rounded-xl border px-4 py-3.5 text-sm ${
                    isCorrect
                      ? 'border-[#bbf7d0] bg-[#ecfdf3] text-[#14532d]'
                      : 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]'
                  }`}
                >
                  <strong className="font-semibold">
                    {isCorrect ? 'Correct — ' : 'Not quite — '}
                  </strong>
                  {currentQuestion.explanation}
                </div>
              )}

              {isAnswered && (
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="cursor-pointer whitespace-nowrap rounded-lg bg-[#15803d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
                  >
                    {quiz.currentIndex < QUIZ_QUESTIONS.length - 1
                      ? 'Next Question'
                      : 'View Results'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <h3 className="text-2xl font-bold text-[#14211a]">
                You scored {quiz.score} / {QUIZ_QUESTIONS.length}
              </h3>
              <p className="mx-auto mt-2 mb-6 max-w-[48ch] text-sm text-[#425449]">
                {quiz.score === QUIZ_QUESTIONS.length
                  ? 'Perfect score. You handled every tricky household waste scenario accurately.'
                  : 'Good run. Review the four-bin guide above and retake the quiz to master every stream.'}
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="cursor-pointer whitespace-nowrap rounded-lg bg-[#15803d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166534]"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
