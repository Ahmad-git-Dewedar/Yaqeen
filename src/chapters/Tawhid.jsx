import { Disclosure } from "../components/Collapsible.jsx";
import { Chapter, ChapterEnd, ChapterFoot, ChapterHead, Evidence, Words } from "../components/ui.jsx";

const FACETS = [
  {
    ord: "أولا",
    title: "توحيد الربوبية",
    text: "الإيمان بأن الله وحده هو الخالق والمالك والمدبر لجميع شؤون الكون",
    key: "خلاصته: توحيد الله بأفعاله",
    evidence: [{ cite: "سورة الزمر، الآية ٦٢", verse: "﴿اللَّهُ خَالِقُ كُلِّ شَيْءٍ ۖ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ وَكِيلٌ﴾" }],
  },
  {
    ord: "ثانيا",
    title: "توحيد الألوهية",
    text: "إفراد الله وحده بالعبادة، فلا تصرف العبادة لغيره",
    key: "خلاصته: توحيد الله بأفعال العباد",
    evidence: [{ cite: "سورة الفاتحة، الآية ٥", verse: "﴿إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ﴾" }],
  },
  {
    ord: "ثالثا",
    title: "توحيد الأسماء والصفات",
    text: "الإيمان بما وصف الله به نفسه، وما وصفه به رسوله ﷺ من الأسماء والصفات، على الوجه اللائق بجلاله، من غير تحريف ولا تعطيل ولا تكييف ولا تمثيل",
    key: "خلاصته: إثبات ما أثبته الله لنفسه",
    evidence: [
      { cite: "سورة الشورى، من الآية ١١", verse: "﴿لَيْسَ كَمِثْلِهِ شَيْءٌ ۖ وَهُوَ السَّمِيعُ الْبَصِيرُ﴾" },
      { cite: "سورة الأعراف، من الآية ١٨٠", verse: "﴿وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا﴾" },
    ],
  },
];

export default function Tawhid() {
  return (
    <Chapter id="tawhid">
      <div className="wrap">
        <ChapterHead id="tawhid" />

        <Words
          className="statement statement--center"
          text="التوحيد إفراد الله بما يختص به، وهو أساس العقيدة"
        />
        <p className="note-line" data-reveal="">وقسمه كثير من العلماء، تقريبا للفهم، إلى ثلاثة أقسام متلازمة</p>

        <ol className="facets">
          {FACETS.map((f) => (
            <li key={f.title} className="facet" data-reveal="">
              <p className="facet__ord">{f.ord}</p>
              <h3 className="facet__title">{f.title}</h3>
              <p className="facet__text">{f.text}</p>
              <p className="facet__key">{f.key}</p>
              <Disclosure>
                {f.evidence.map((ev) => (
                  <Evidence key={ev.cite} compact cite={ev.cite}>{ev.verse}</Evidence>
                ))}
              </Disclosure>
            </li>
          ))}
        </ol>

        <ChapterEnd />
        <ChapterFoot id="tawhid" />
      </div>
    </Chapter>
  );
}
