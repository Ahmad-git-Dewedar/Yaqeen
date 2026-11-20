import { Art, Chapter, ChapterEnd, ChapterFoot, ChapterHead, Evidence } from "../components/ui.jsx";

const IMPORTANCE = [
  "أساس الدين الذي تقوم عليه الأعمال",
  "طريق معرفة الله وتوحيده",
  "تصور واضح للحياة وغايتها",
  "توجه السلوك والأخلاق والعبادة",
];

export default function Definition() {
  return (
    <Chapter id="definition">
      <div className="wrap">
        <ChapterHead id="definition" />

        <div className="definition">
          <figure className="plate definition__plate" data-reveal="" data-parallax="">
            <Art src="gateway.webp" wipe="down" />
          </figure>

          <div className="definition__body">
            <h3 className="eyebrow-title" data-reveal="">ما هي العقيدة الإسلامية؟</h3>
            <dl className="def-pair" data-reveal="" data-stagger="">
              <div className="def-pair__item">
                <dt>لغة</dt>
                <dd>من <b>العقد</b>، وهو الربط والإحكام</dd>
              </div>
              <div className="def-pair__item">
                <dt>اصطلاحا</dt>
                <dd>ما يؤمن به المسلم إيمانا جازما لا شك فيه، مما جاء به الوحي من أمور الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر</dd>
              </div>
            </dl>

            <h3 className="eyebrow-title" data-reveal="">أهمية العقيدة</h3>
            <ol className="ledger" data-reveal="" data-stagger="">
              {IMPORTANCE.map((text, i) => (
                <li key={i}>
                  <span className="ledger__num" aria-hidden="true">{"١٢٣٤"[i]}</span>
                  <p>{text}</p>
                </li>
              ))}
            </ol>

            <Evidence reveal label="الغاية من الوجود" cite="سورة الذاريات، الآية ٥٦">
              ﴿وَمَا خَلَقْتُ الْجِنَّ وَالْإِنْسَ إِلَّا لِيَعْبُدُونِ﴾
            </Evidence>
          </div>
        </div>

        <ChapterEnd />
        <ChapterFoot id="definition" />
      </div>
    </Chapter>
  );
}
