import { Art, Ayah, Chapter, ChapterEnd, ChapterFoot, ChapterHead, Evidence } from "../components/ui.jsx";

export default function Sources() {
  return (
    <Chapter id="sources">
      <div className="wrap">
        <ChapterHead id="sources" />

        <p className="lead lead--narrow" data-reveal="">تستمد العقيدة من الوحي، وأهم مصادرها:</p>

        <div className="sources">
          <figure className="plate sources__plate" data-reveal="" data-parallax="">
            <Art src="mushaf-hall.webp" wipe="up" />
          </figure>

          <ol className="source-list">
            <li className="source" data-reveal="">
              <p className="source__rank"><span className="source__rank-num">١</span> المصدر الأول</p>
              <h3 className="source__title">القرآن الكريم</h3>
              <p>كلام الله المنزل على النبي محمد ﷺ</p>
              <Evidence compact cite="سورة الإسراء، من الآية ٩">﴿إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾</Evidence>
            </li>
            <li className="source" data-reveal="">
              <p className="source__rank"><span className="source__rank-num">٢</span> المصدر الثاني</p>
              <h3 className="source__title">السنة النبوية الصحيحة</h3>
              <p>ما ثبت عن النبي ﷺ من قول أو فعل أو تقرير</p>
              <Evidence compact cite="سورة النجم، الآيتان ٣–٤">
                ﴿وَمَا يَنْطِقُ عَنِ الْهَوَىٰ <Ayah n={3} /> إِنْ هُوَ إِلَّا وَحْيٌ يُوحَىٰ <Ayah n={4} />﴾
              </Evidence>
            </li>
          </ol>
        </div>

        <aside className="callout" aria-labelledby="why-sources" data-reveal="">
          <h3 className="callout__title" id="why-sources">لماذا نرجع إلى المصادر الصحيحة؟</h3>
          <p>مسائل العقيدة من أعظم مسائل الدين، فلا تبنى على الشائعات أو الأحاديث الضعيفة</p>
          <Evidence compact cite="سورة الحجرات، من الآية ٦">﴿يَا أَيُّهَا الَّذِينَ آمَنُوا إِنْ جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا﴾</Evidence>
        </aside>

        <ChapterEnd />
        <ChapterFoot id="sources" />
      </div>
    </Chapter>
  );
}
