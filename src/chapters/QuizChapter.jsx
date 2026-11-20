import Quiz from "../components/Quiz.jsx";
import { Art, Chapter, ChapterFoot, ChapterHead } from "../components/ui.jsx";

export default function QuizChapter() {
  return (
    <Chapter id="quiz">
      <div className="quiz-stage" data-parallax="">
        <Art src="hourglass.webp" className="quiz-stage__art" wipe="rtl" />
        <div className="wrap quiz-stage__inner">
          <ChapterHead id="quiz" onArt />
          <Quiz />
        </div>
      </div>
      <div className="wrap">
        <ChapterFoot id="quiz" />
      </div>
    </Chapter>
  );
}
