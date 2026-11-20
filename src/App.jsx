import { useState } from "react";
import { MotionConfig, MotionGlobalConfig } from "framer-motion";
import { useMotionLevel } from "./lib/prefs.js";
import { useChapterEnds, useOverArt, useScrollReveal, useScrollSpy } from "./hooks/usePage.js";
import { useSmoothScroll } from "./hooks/useSmoothScroll.js";
import Loader from "./components/Loader.jsx";
import { Marquee, ToTop } from "./components/Extras.jsx";
import { Sprite } from "./components/ui.jsx";
import Header from "./components/Header.jsx";
import Rail from "./components/Rail.jsx";
import Hero from "./components/Hero.jsx";
import Footer from "./components/Footer.jsx";
import { IndexSheet, SearchDialog, SettingsSheet } from "./components/Dialogs.jsx";
import Intro from "./chapters/Intro.jsx";
import Definition from "./chapters/Definition.jsx";
import Pillars from "./chapters/Pillars.jsx";
import Tawhid from "./chapters/Tawhid.jsx";
import Sources from "./chapters/Sources.jsx";
import Impact from "./chapters/Impact.jsx";
import Faq from "./chapters/Faq.jsx";
import QuizChapter from "./chapters/QuizChapter.jsx";
import Conclusion from "./chapters/Conclusion.jsx";
import References from "./chapters/References.jsx";

export default function App() {
  const motion = useMotionLevel();
  // "none" finishes every Framer Motion animation instantly, even ones with their own timing
  MotionGlobalConfig.skipAnimations = motion === "none";
  const [ready, setReady] = useState(false);
  useSmoothScroll(motion);
  const current = useScrollSpy();
  const overArt = useOverArt();
  useChapterEnds();
  useScrollReveal();

  return (
    // Reduced motion keeps fades only; "none" makes every transition instant
    <MotionConfig
      reducedMotion={motion === "full" ? "never" : "always"}
      transition={motion === "none" ? { duration: 0 } : undefined}
    >
      <Sprite />
      <Loader level={motion} onDone={() => setReady(true)} />
      <a className="skip-link" href="#main">تخط إلى المحتوى</a>
      <Header current={current} overArt={overArt.header} />
      <Rail current={current} overArt={overArt.rail} />

      <main id="main">
        <Hero ready={ready} level={motion} />
        <Marquee />
        <Intro />
        <Definition />
        <Pillars />
        <Tawhid />
        <Sources />
        <Impact />
        <Faq />
        <Conclusion />
        <References />
        <QuizChapter />
      </main>

      <Footer />
      <ToTop />
      <IndexSheet current={current} />
      <SearchDialog />
      <SettingsSheet />
    </MotionConfig>
  );
}
