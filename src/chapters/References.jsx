import { Chapter, ChapterEnd, ChapterFoot, ChapterHead } from "../components/ui.jsx";

const REFS = [
  { tag: "الوحي", title: "القرآن الكريم" },
  { tag: "الحديث", title: "صحيح البخاري، كتاب الإيمان" },
  { tag: "الحديث", title: "صحيح مسلم، كتاب الإيمان، حديث جبريل" },
  { tag: "العقيدة", title: "الأصول الثلاثة", author: "محمد بن عبد الوهاب" },
  { tag: "العقيدة", title: "العقيدة الواسطية", author: "ابن تيمية" },
  { tag: "العقيدة", title: "شرح العقيدة الطحاوية", author: "ابن أبي العز الحنفي" },
  { tag: "الحديث", title: "سنن أبي داود", author: "مصدر حديث «أكمل المؤمنين إيمانًا» في المحطة السادسة" },
];

export default function References() {
  return (
    <Chapter id="references">
      <div className="wrap">
        <ChapterHead id="references" />

        <div className="refs">
          <ol className="ref-list" data-reveal="" data-stagger="">
            {REFS.map((r) => (
              <li className="ref" key={r.title}>
                <span className="ref__tag">{r.tag}</span>
                <p className="ref__title">{r.title}</p>
                {r.author && <p className="ref__author">{r.author}</p>}
              </li>
            ))}
          </ol>

          <aside className="method" data-reveal="">
            <h3 className="method__title">منهج التوثيق</h3>
            <ul className="method__list" data-stagger="">
              <li>الآيات وفق نص المصحف (<span lang="en">Tanzil</span>) مع السورة ورقم الآية</li>
              <li>الأحاديث بترقيم <span lang="en">sunnah.com</span>، مع الحكم لما خرج عن الصحيحين</li>
              <li>محتوى مختصر، والتوسع بالرجوع إلى أهل العلم</li>
            </ul>
          </aside>
        </div>

        <ChapterEnd />
        <ChapterFoot id="references" />
      </div>
    </Chapter>
  );
}
