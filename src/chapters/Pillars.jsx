import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ar } from "../lib/utils.js";
import { Art, Ayah, Chapter, ChapterEnd, ChapterFoot, ChapterHead, Evidence } from "../components/ui.jsx";

const PILLARS = [
  {
    id: "allah",
    tab: "الإيمان بالله",
    title: "الإيمان بالله",
    text: "الإيمان بوجود الله تعالى وربوبيته وألوهيته وأسمائه وصفاته، وإفراده بالعبادة",
    evidence: [
      {
        cite: "سورة الإخلاص، الآيات ١–٤",
        verse: <>﴿قُلْ هُوَ اللَّهُ أَحَدٌ <Ayah n={1} /> اللَّهُ الصَّمَدُ <Ayah n={2} /> لَمْ يَلِدْ وَلَمْ يُولَدْ <Ayah n={3} /> وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ <Ayah n={4} />﴾</>,
      },
    ],
  },
  {
    id: "angels",
    tab: "بالملائكة",
    title: "الإيمان بالملائكة",
    text: "التصديق بوجود الملائكة، عباد مكرمون يفعلون ما يؤمرون",
    evidence: [{ cite: "سورة التحريم، من الآية ٦", verse: <>﴿لَا يَعْصُونَ اللَّهَ مَا أَمَرَهُمْ وَيَفْعَلُونَ مَا يُؤْمَرُونَ﴾</> }],
  },
  {
    id: "books",
    tab: "بالكتب",
    title: "الإيمان بالكتب السماوية",
    text: "التصديق بالكتب التي أنزلها الله على رسله، ومنها القرآن والتوراة والإنجيل والزبور وصحف إبراهيم وموسى",
    evidence: [
      {
        cite: "سورة الأعلى، الآيتان ١٨–١٩",
        verse: <>﴿إِنَّ هَٰذَا لَفِي الصُّحُفِ الْأُولَىٰ <Ayah n={18} /> صُحُفِ إِبْرَاهِيمَ وَمُوسَىٰ <Ayah n={19} />﴾</>,
      },
    ],
  },
  {
    id: "messengers",
    tab: "بالرسل",
    title: "الإيمان بالرسل",
    text: "التصديق بأن الله أرسل رسلا لهداية الناس، وأن محمدا ﷺ خاتم الأنبياء والمرسلين",
    evidence: [
      { cite: "سورة النحل، من الآية ٣٦", verse: <>﴿وَلَقَدْ بَعَثْنَا فِي كُلِّ أُمَّةٍ رَسُولًا أَنِ اعْبُدُوا اللَّهَ وَاجْتَنِبُوا الطَّاغُوتَ﴾</> },
      { cite: "سورة الأحزاب، من الآية ٤٠", verse: <>﴿مَا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِنْ رِجَالِكُمْ وَلَٰكِنْ رَسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ﴾</> },
    ],
  },
  {
    id: "lastday",
    tab: "باليوم الآخر",
    title: "الإيمان باليوم الآخر",
    text: "التصديق بالبعث والحساب والجزاء والجنة والنار",
    evidence: [
      {
        cite: "سورة الزلزلة، الآيتان ٧–٨",
        verse: <>﴿فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ <Ayah n={7} /> وَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ <Ayah n={8} />﴾</>,
      },
    ],
  },
  {
    id: "qadar",
    tab: "بالقدر",
    title: "الإيمان بالقدر خيره وشره",
    text: "الإيمان بأن كل شيء يقع بعلم الله ومشيئته وكتابته وخلقه، مع إثبات مسؤولية الإنسان عن اختياراته وأعماله",
    evidence: [
      { cite: "سورة القمر، الآية ٤٩", verse: <>﴿إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ﴾</> },
      {
        label: "مشيئة الإنسان ومشيئة الله",
        cite: "سورة التكوير، الآيتان ٢٨–٢٩",
        verse: <>﴿لِمَنْ شَاءَ مِنْكُمْ أَنْ يَسْتَقِيمَ <Ayah n={28} /> وَمَا تَشَاءُونَ إِلَّا أَنْ يَشَاءَ اللَّهُ رَبُّ الْعَالَمِينَ <Ayah n={29} />﴾</>,
      },
    ],
  },
];

const ease = [0.22, 0.7, 0.2, 1];

function PillarTabs() {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(() => new Set([0]));
  const [direction, setDirection] = useState(1);
  const tabs = useRef([]);
  const panels = useRef([]);

  const select = (i, focus = false) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
    setSeen((s) => new Set(s).add(i));
    if (focus) tabs.current[i]?.focus();
  };

  // Search results inside a hidden panel open that panel first
  useEffect(() => {
    const onReveal = (e) => {
      const i = panels.current.findIndex((p) => p?.contains(e.detail));
      if (i >= 0) select(i);
    };
    document.addEventListener("yaqeen:reveal", onReveal);
    return () => document.removeEventListener("yaqeen:reveal", onReveal);
  });

  const onKeyDown = (e, i) => {
    // In RTL the visual "next" tab is to the left
    const keys = { ArrowLeft: i + 1, ArrowRight: i - 1, Home: 0, End: PILLARS.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select((keys[e.key] + PILLARS.length) % PILLARS.length, true);
  };

  const seenLabel =
    seen.size === PILLARS.length ? "استكشفت جميع الأركان الستة" : `استكشفت ${ar(seen.size)} من ${ar(PILLARS.length)} أركان`;

  return (
    <div className="pillars">
      <div className="pillars__bar">
        <div className="pillars__tabs" role="tablist" aria-label="أركان الإيمان الستة">
          {PILLARS.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => (tabs.current[i] = el)}
              className={`pillar-tab${seen.has(i) ? " is-seen" : ""}`}
              role="tab"
              type="button"
              id={`tab-${p.id}`}
              aria-controls={`panel-${p.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="pillar-tab__num">{ar(i + 1)}</span>
              <span>{p.tab}</span>
              {i === active && (
                <motion.span className="pillar-tab__line" layoutId="pillar-line" transition={{ duration: 0.5, ease }} />
              )}
            </button>
          ))}
        </div>
        <p className="pillars__seen" aria-live="polite">{seenLabel}</p>
      </div>

      {PILLARS.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => (panels.current[i] = el)}
          className="pillar-panel"
          role="tabpanel"
          id={`panel-${p.id}`}
          aria-labelledby={`tab-${p.id}`}
          tabIndex={0}
          hidden={i !== active}
        >
          {i === active && (
            <motion.span
              key={`num-${active}`}
              className="pillar-panel__num"
              aria-hidden="true"
              initial={{ opacity: 0, x: direction * -40, rotate: direction * 8 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, ease }}
            >
              {ar(i + 1)}
            </motion.span>
          )}
          <motion.div
            key={`body-${i === active ? active : "idle"}`}
            className="pillar-panel__body"
            initial={{ opacity: 0, x: direction * -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <h3 className="pillar-panel__title">{p.title}</h3>
            <p className="pillar-panel__text">{p.text}</p>
            {p.evidence.map((ev, k) => (
              <Evidence key={k} label={ev.label} cite={ev.cite}>{ev.verse}</Evidence>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default function Pillars() {
  return (
    <Chapter id="pillars">
      <div className="wrap">
        <ChapterHead id="pillars" />
      </div>

      <figure className="banner" data-reveal="" data-parallax="">
        <Art src="pillars.webp" className="banner__art" wipe="rtl" />
        <figcaption className="banner__body">
          <p className="banner__intro">من حديث جبريل عليه السلام:</p>
          <blockquote className="banner__quote">«أَنْ تُؤْمِنَ بِاللَّهِ وَمَلاَئِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ وَالْيَوْمِ الآخِرِ وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ»</blockquote>
          <p className="banner__ref">رواه مسلم (٨)</p>
        </figcaption>
      </figure>

      <div className="wrap">
        <PillarTabs />

        <Evidence reveal wide label="آية جمعت الأركان" cite="سورة البقرة، من الآية ٢٨٥">
          ﴿آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ﴾
        </Evidence>

        <ChapterEnd />
        <ChapterFoot id="pillars" />
      </div>
    </Chapter>
  );
}
