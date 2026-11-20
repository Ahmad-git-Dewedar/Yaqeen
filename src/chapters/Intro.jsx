import { Stats } from "../components/Extras.jsx";
import { Chapter, ChapterEnd, ChapterFoot, ChapterHead, Words } from "../components/ui.jsx";

export default function Intro() {
  return (
    <Chapter id="intro">
      <div className="wrap">
        <ChapterHead id="intro" />

        <div className="intro">
          <Words as="h3" className="intro__question" text="ما الذي يؤمن به المسلم؟" />
          <div className="intro__text prose" data-reveal="">
            <p className="lead">أساس إيمان المسلم: معتقدات يصدق بها القلب، ويظهر أثرها في العبادة والسلوك</p>
          </div>
        </div>

        <Stats />

        <ChapterEnd />
        <ChapterFoot id="intro" />
      </div>
    </Chapter>
  );
}
