/*
 * Interactive quiz: one question at a time, instant feedback with a short
 * explanation, then a score with a full review and best-score tracking.
 * Finishing dispatches "yaqeen:quiz-complete" with
 * { score, total, completedAt, answers: [{ id, chosen, correct }] }
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { QUESTIONS } from "../data/quiz.js";
import { BY_ID } from "../data/chapters.js";
import { recordQuiz, snapshot, useProgress } from "../lib/progress.js";
import { ar, emit } from "../lib/utils.js";
import { Icon } from "./ui.jsx";

const LETTERS = ["أ", "ب", "ج", "د"];
const ease = [0.22, 0.7, 0.2, 1];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Cards slide in from the reading direction: forward comes from the left */
const card = {
  enter: (dir) => ({ opacity: 0, x: dir * -60, filter: "blur(4px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: (dir) => ({ opacity: 0, x: dir * 60, filter: "blur(4px)", transition: { duration: 0.3, ease } }),
};

const list = { center: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
const item = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

function Intro({ onStart }) {
  const { quiz } = useProgress();
  return (
    <>
      <p className="quiz__eyebrow">اختياري · {ar(QUESTIONS.length)} أسئلة قصيرة</p>
      <h3 className="quiz__heading" tabIndex={-1}>هل تود اختبار ما تعلمته؟</h3>
      <p className="quiz__lede">بعد كل إجابة يظهر الصواب مع شرح قصير، ولا وقت محدد</p>
      {quiz && <p className="quiz__best">أفضل نتيجة سابقة: <b>{ar(quiz.best)} من {ar(quiz.total)}</b></p>}
      <div className="quiz__nav">
        <motion.button className="btn btn--light" type="button" onClick={onStart} whileTap={{ scale: 0.96 }}>
          {quiz ? "ابدأ محاولة جديدة" : "ابدأ الاختبار"}
        </motion.button>
        <a className="btn btn--outline-light" href="#site-footer">ليس الآن</a>
      </div>
    </>
  );
}

function Question({ run, onAnswer, onNext, onPrev }) {
  const { questions, index, answers } = run;
  const q = questions[index];
  const chosen = answers[q.id];
  const answered = chosen !== undefined;
  const right = chosen === q.answer;
  const isLast = index === questions.length - 1;
  const nextRef = useRef(null);

  useEffect(() => {
    if (answered) nextRef.current?.focus({ preventScroll: true });
  }, [answered]);

  return (
    <>
      <div className="quiz__top">
        <p className="quiz__count">السؤال {ar(index + 1)} من {ar(questions.length)}</p>
        <div className="quiz__steps" aria-hidden="true">
          {questions.map((it, i) => {
            const a = answers[it.id];
            const state = a === undefined ? (i === index ? "is-current" : "") : a === it.answer ? "is-right" : "is-wrong";
            return <motion.span key={it.id} layout className={`quiz__step ${state}`} />;
          })}
        </div>
      </div>

      <h3 className="quiz__question" id="quiz-q" tabIndex={-1}>{q.q}</h3>

      <motion.div className="quiz__options" role="group" aria-labelledby="quiz-q" variants={list} initial="enter" animate="center">
        {q.options.map((opt, i) => {
          let state = "";
          if (answered) state = opt.id === q.answer ? "is-correct" : opt.id === chosen ? "is-wrong" : "is-muted";
          return (
            <motion.button
              key={opt.id}
              variants={item}
              className={`option ${state}`}
              type="button"
              aria-disabled={answered || undefined}
              aria-pressed={opt.id === chosen || undefined}
              onClick={() => !answered && onAnswer(q.id, opt.id)}
              whileHover={answered ? undefined : { x: -6 }}
              whileTap={answered ? undefined : { scale: 0.98 }}
              animate={state === "is-wrong" ? { x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.45 } } : undefined}
            >
              <span className="option__key" aria-hidden="true">{LETTERS[i]}</span>
              <span className={`option__text${opt.text.startsWith("﴿") ? " is-verse" : ""}`}>{opt.text}</span>
              {state === "is-correct" && (
                <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
                  <Icon name="check" className="option__mark" />
                </motion.span>
              )}
              {state === "is-wrong" && <Icon name="x" className="option__mark" />}
            </motion.button>
          );
        })}
      </motion.div>

      <div className="quiz__live" aria-live="polite">
        <AnimatePresence>
          {answered && (
            <motion.div
              className={`quiz__feedback ${right ? "is-right" : "is-wrong"}`}
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              <p className="quiz__verdict">{right ? "إجابة صحيحة" : "ليست هذه الإجابة الصحيحة"}</p>
              <p className="quiz__why">{q.why}</p>
              <a className="quiz__ref" href={`#${q.ref}`}>راجع: {BY_ID.get(q.ref)?.title}</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="quiz__nav">
        {index > 0 && (
          <button className="btn btn--outline-light" type="button" onClick={onPrev}>السابق</button>
        )}
        <motion.button
          ref={nextRef}
          className="btn btn--light quiz__next"
          type="button"
          disabled={!answered}
          onClick={onNext}
          whileTap={{ scale: 0.96 }}
        >
          {isLast ? "عرض النتيجة" : "السؤال التالي"}
        </motion.button>
      </div>
    </>
  );
}

/** A small burst of star ornaments for a perfect score */
function Sparks() {
  return (
    <span className="sparks" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <motion.svg
            key={i}
            className="spark"
            initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(angle) * 110, y: Math.sin(angle) * 70, scale: [0, 1, 0.6], opacity: [1, 1, 0], rotate: 180 }}
            transition={{ duration: 1.4, delay: 0.5 + (i % 3) * 0.05, ease: "easeOut" }}
          >
            <use href="#i-star" />
          </motion.svg>
        );
      })}
    </span>
  );
}

function Result({ run, onRestart }) {
  const { questions, answers, previousBest } = run;
  const score = questions.filter((q) => answers[q.id] === q.answer).length;
  const total = questions.length;
  const ratio = score / total;
  const message =
    ratio === 1
      ? "إجابات كاملة، بارك الله فيك وزادك علما"
      : ratio >= 0.7
        ? "نتيجة طيبة، راجع ما فاتك لتكتمل الصورة"
        : ratio >= 0.4
          ? "بداية جيدة، ومرور سريع على المحطات يرفع نتيجتك"
          : "لا بأس، العلم بالتدرج، فراجع المحطات ثم أعد المحاولة";
  const newBest = previousBest !== null && score > previousBest;

  const count = useMotionValue(0);
  const shown = useTransform(count, (v) => ar(Math.round(v)));
  const [display, setDisplay] = useState(ar(0));
  useEffect(() => shown.on("change", setDisplay), [shown]);
  useEffect(() => {
    const controls = animate(count, score, { duration: 1.1, ease: "easeOut", delay: 0.25 });
    return () => controls.stop();
  }, [count, score]);

  return (
    <>
      <div className="score">
        <p className="score__value" aria-hidden="true">
          <span>{display}</span>
          <span className="score__total">/ {ar(total)}</span>
          {ratio === 1 && <Sparks />}
        </p>
        <h3 className="quiz__heading" tabIndex={-1}>نتيجتك {ar(score)} من {ar(total)}</h3>
        <div className="meter meter--light" aria-hidden="true">
          <motion.span
            className="meter__fill meter__fill--motion"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: ratio }}
            transition={{ duration: 1.2, ease, delay: 0.3 }}
          />
        </div>
        <p className="quiz__lede">{message}{newBest ? "، وهي أفضل نتيجة لك حتى الآن" : ""}</p>
      </div>

      <details className="review">
        <summary className="review__toggle">مراجعة الإجابات</summary>
        <ol className="review__list">
          {questions.map((q) => {
            const chosen = q.options.find((o) => o.id === answers[q.id]);
            const correct = q.options.find((o) => o.id === q.answer);
            const ok = chosen?.id === correct.id;
            return (
              <li key={q.id} className={`review__item ${ok ? "is-right" : "is-wrong"}`}>
                <Icon name={ok ? "check" : "x"} className="review__icon" />
                <div>
                  <p className="review__q">{q.q}</p>
                  {ok ? (
                    <p className="review__a">{correct.text}</p>
                  ) : (
                    <p className="review__a">إجابتك: {chosen?.text ?? "لا إجابة"}<br />الصواب: <b>{correct.text}</b></p>
                  )}
                  <span className="visually-hidden">{ok ? "إجابة صحيحة" : "إجابة خاطئة"}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </details>

      <div className="quiz__nav">
        <motion.button className="btn btn--light" type="button" onClick={onRestart} whileTap={{ scale: 0.96 }}>أعد الاختبار</motion.button>
        <a className="btn btn--outline-light" href="#top">العودة إلى البداية</a>
      </div>
    </>
  );
}

export default function Quiz() {
  const [view, setView] = useState("intro"); // intro | question | result
  const [run, setRun] = useState(null);
  const [dir, setDir] = useState(1);
  const root = useRef(null);

  // Move focus to the new heading after each transition
  const focusHeading = () =>
    root.current?.querySelector(".quiz__question, .quiz__heading")?.focus({ preventScroll: true });

  const start = () => {
    setDir(1);
    setRun({
      questions: QUESTIONS.map((q) => ({ ...q, options: shuffle(q.options) })),
      index: 0,
      answers: {},
      previousBest: snapshot().quiz?.best ?? null,
    });
    setView("question");
    root.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const answer = (qid, optionId) => setRun((r) => ({ ...r, answers: { ...r.answers, [qid]: optionId } }));

  const next = () => {
    setDir(1);
    if (run.index < run.questions.length - 1) {
      setRun((r) => ({ ...r, index: r.index + 1 }));
      return;
    }
    const score = run.questions.filter((q) => run.answers[q.id] === q.answer).length;
    const total = run.questions.length;
    recordQuiz({ score, total });
    setView("result");
    emit("yaqeen:quiz-complete", {
      score,
      total,
      completedAt: new Date().toISOString(),
      answers: run.questions.map((q) => ({ id: q.id, chosen: run.answers[q.id], correct: run.answers[q.id] === q.answer })),
    });
  };

  const prev = () => {
    setDir(-1);
    setRun((r) => ({ ...r, index: Math.max(0, r.index - 1) }));
  };

  const key = view === "question" ? `q-${run.index}` : view;

  return (
    <div className="quiz" ref={root}>
      <AnimatePresence mode="wait" custom={dir} onExitComplete={focusHeading}>
        <motion.div
          key={key}
          className={`quiz__card quiz__card--${view}`}
          custom={dir}
          variants={card}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {view === "intro" && <Intro onStart={start} />}
          {view === "question" && <Question run={run} onAnswer={answer} onNext={next} onPrev={prev} />}
          {view === "result" && <Result run={run} onRestart={start} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
