import { useId, useRef, useState } from "react";
import { Panel, useRevealOpen } from "../components/Collapsible.jsx";
import { Chapter, ChapterEnd, ChapterFoot, ChapterHead, Evidence, Icon } from "../components/ui.jsx";

function FaqItem({ q, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef(null);
  useRevealOpen(ref, () => setOpen(true));

  return (
    <div className={`faq__item${open ? " is-open" : ""}`} data-reveal="" ref={ref}>
      <h3 className="faq__h">
        <button className="faq__q" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
          <span>{q}</span>
          <Icon name="chevron" className="faq__icon" />
        </button>
      </h3>
      <Panel id={id} open={open} className="faq__a">
        <div className="faq__a-inner">{children}</div>
      </Panel>
    </div>
  );
}

export default function Faq() {
  return (
    <Chapter id="faq">
      <div className="wrap">
        <div className="faq-layout">
          <ChapterHead id="faq" />

          <div className="faq">
            <FaqItem q="ما الفرق بين العقيدة والعبادة؟">
              <p>العقيدة ما يؤمن به القلب من أصول الدين، والعبادة ما يحبه الله من الأقوال والأفعال الظاهرة والباطنة</p>
            </FaqItem>

            <FaqItem q="هل الإيمان يقتصر على القلب؟">
              <p>الإيمان يشمل اعتقاد القلب، وقول اللسان، وعمل الجوارح، ويزيد بالطاعة وينقص بالمعصية</p>
              <Evidence compact hadith cite="رواه البخاري، كتاب الإيمان (٩)، من حديث أبي هريرة رضي الله عنه">
                «الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ»
              </Evidence>
              <Evidence compact label="في زيادة الإيمان" cite="سورة الأنفال، من الآية ٢">
                ﴿وَإِذَا تُلِيَتْ عَلَيْهِمْ آيَاتُهُ زَادَتْهُمْ إِيمَانًا﴾
              </Evidence>
            </FaqItem>

            <FaqItem q="لماذا يجب أن نتعلم العقيدة؟">
              <p>لفهم الدين، والتمييز بين الاعتقاد الصحيح والمعلومات الخاطئة</p>
            </FaqItem>
          </div>
        </div>

        <ChapterEnd />
        <ChapterFoot id="faq" />
      </div>
    </Chapter>
  );
}
