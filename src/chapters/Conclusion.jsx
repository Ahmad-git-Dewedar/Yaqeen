import { motion } from "framer-motion";
import { TOTAL, countDone } from "../data/chapters.js";
import { useProgress } from "../lib/progress.js";
import { ar } from "../lib/utils.js";
import { Art, Chapter, ChapterEnd, ChapterFoot, ChapterHead, Words } from "../components/ui.jsx";

const TAKEAWAYS = [
  ["definition", "العقيدة ما يؤمن به المسلم إيمانا جازما مما جاء به الوحي"],
  ["pillars", "أركان الإيمان ستة: الله، والملائكة، والكتب، والرسل، واليوم الآخر، والقدر"],
  ["tawhid", "التوحيد: الربوبية، والألوهية، والأسماء والصفات"],
  ["sources", "أهم مصادر العقيدة: القرآن الكريم، ثم السنة الثابتة"],
  ["faq", "الإيمان قول وعمل واعتقاد، يزيد بالطاعة وينقص بالمعصية"],
  ["impact", "أثرها: الطمأنينة والصبر والتوكل والمراقبة وحسن الخلق"],
];

function Tally() {
  const { done, quiz } = useProgress();
  const count = countDone(done);
  return (
    <aside className="tally" aria-labelledby="tally-title" data-reveal="">
      <h3 className="tally__title" id="tally-title">حصيلتك</h3>
      <dl className="tally__grid" data-stagger="">
        <div>
          <dt>المحطات المكتملة</dt>
          <dd>{ar(count)} من {ar(TOTAL)}</dd>
        </div>
        <div>
          <dt>أفضل نتيجة في الاختبار الاختياري</dt>
          <dd>{quiz ? `${ar(quiz.best)} من ${ar(quiz.total)}` : "لم يجر بعد"}</dd>
        </div>
      </dl>
      <div className="meter" aria-hidden="true">
        <motion.span
          className="meter__fill meter__fill--motion"
          initial={false}
          animate={{ scaleX: count / TOTAL }}
          transition={{ duration: 1, ease: [0.22, 0.7, 0.2, 1] }}
        />
      </div>
      <a className="btn btn--quiet" href="#quiz">{quiz ? "أعد الاختبار" : "جرب الاختبار الاختياري"}</a>
    </aside>
  );
}

export default function Conclusion() {
  return (
    <Chapter id="conclusion">
      <div className="wrap">
        <ChapterHead id="conclusion" />
      </div>

      <figure className="closing" data-reveal="" data-parallax="">
        <Art src="mushaf-light.webp" className="closing__art" wipe="center" />
        <figcaption>
          <Words as="span" className="closing__text" text="العقيدة أساس الإيمان، والمعرفة طريق الفهم" delay={0.4} />
        </figcaption>
      </figure>

      <div className="wrap">
        <div className="conclusion">
          <div className="conclusion__text prose" data-reveal="">
            <p className="lead">العقيدة أساس يوجه حياة المسلم وعلاقته بربه، فلنجعلها بداية لفهم أعمق وعمل صالح</p>
          </div>
          <Tally />
        </div>

        <h3 className="eyebrow-title" data-reveal="">أهم النقاط</h3>
        <ol className="takeaways">
          {TAKEAWAYS.map(([id, text], i) => (
            <li key={id} data-reveal="">
              <motion.a href={`#${id}`} whileHover={{ x: -6 }} transition={{ type: "spring", stiffness: 320, damping: 26 }}>
                <span className="takeaways__num">{ar(i + 1)}</span>
                <span>{text}</span>
              </motion.a>
            </li>
          ))}
        </ol>

        <ChapterEnd />
        <ChapterFoot id="conclusion" />
      </div>
    </Chapter>
  );
}
