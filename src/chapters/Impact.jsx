import { Art, Chapter, ChapterEnd, ChapterFoot, ChapterHead, Evidence, Words } from "../components/ui.jsx";

const EFFECTS = [
  {
    name: "الطمأنينة",
    text: "بعلم المسلم أن الله مطلع عليه ومدبر أمره",
    cite: "سورة الرعد، الآية ٢٨",
    quote: "﴿الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾",
  },
  {
    name: "الصبر",
    text: "بالإيمان بحكمة الله وقدره عند الشدائد",
    cite: "رواه مسلم (٢٩٩٩) من حديث صهيب رضي الله عنه",
    hadith: true,
    quote: "«عَجَبًا لأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لأَحَدٍ إِلاَّ لِلْمُؤْمِنِ؛ إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ»",
  },
  {
    name: "التوكل",
    text: "الاعتماد على الله مع الأخذ بالأسباب",
    cite: "سورة الطلاق، من الآية ٣",
    quote: "﴿وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ﴾",
  },
  {
    name: "مراقبة الله",
    text: "الحرص على الخير والبعد عن المعصية",
    label: "في بيان الإحسان من حديث جبريل",
    cite: "رواه مسلم (٨)",
    hadith: true,
    quote: "«أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ»",
  },
  {
    name: "حسن الخلق",
    text: "العدل والرحمة والأمانة مع الناس",
    cite: "رواه أبو داود (٤٦٨٢) من حديث أبي هريرة رضي الله عنه، وقال الألباني: حسن صحيح",
    hadith: true,
    quote: "«أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا»",
  },
];

export default function Impact() {
  return (
    <Chapter id="impact" className="chapter--immersive">
      <div className="immersive" data-parallax="">
        <Art src="garden.webp" className="immersive__art" wipe="ltr" />
        <div className="wrap immersive__inner">
          <ChapterHead id="impact" onArt />
          <Words
            className="immersive__lead"
            text="العقيدة إيمان يظهر أثره في حياتنا اليومية"
            delay={0.3}
          />
        </div>
      </div>

      <div className="wrap">
        <h3 className="eyebrow-title" data-reveal="">من آثارها</h3>
        <ol className="effects">
          {EFFECTS.map((e) => (
            <li className="effect" data-reveal="" key={e.name}>
              <h4 className="effect__name">{e.name}</h4>
              <div className="effect__body">
                <p>{e.text}</p>
                <Evidence compact hadith={e.hadith} label={e.label} cite={e.cite}>{e.quote}</Evidence>
              </div>
            </li>
          ))}
        </ol>

        <ChapterEnd />
        <ChapterFoot id="impact" />
      </div>
    </Chapter>
  );
}
