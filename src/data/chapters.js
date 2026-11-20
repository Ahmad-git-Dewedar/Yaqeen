/* The stations of the journey, in order. Navigation, progress and the
   chapter headers all read from this list. The quiz closes the journey
   and is optional, so it does not count toward completion */
export const CHAPTERS = [
  { id: "intro", title: "مقدمة في العقيدة الإسلامية", short: "المقدمة", kicker: "المحطة الأولى" },
  { id: "definition", title: "تعريف العقيدة وأهميتها", short: "التعريف", kicker: "المحطة الثانية" },
  { id: "pillars", title: "أركان الإيمان الستة", short: "أركان الإيمان", kicker: "المحطة الثالثة" },
  { id: "tawhid", title: "أقسام التوحيد", short: "التوحيد", kicker: "المحطة الرابعة" },
  { id: "sources", title: "مصادر العقيدة", short: "المصادر", kicker: "المحطة الخامسة" },
  { id: "impact", title: "أثر العقيدة في حياة المسلم", short: "الأثر", kicker: "المحطة السادسة" },
  { id: "faq", title: "أسئلة شائعة", short: "أسئلة شائعة", kicker: "المحطة السابعة" },
  { id: "conclusion", title: "الخاتمة وأهم النقاط", short: "الخاتمة", kicker: "المحطة الثامنة" },
  { id: "references", title: "المراجع والمصادر", short: "المراجع", kicker: "المحطة التاسعة" },
  { id: "quiz", title: "اختبر معرفتك", short: "الاختبار", kicker: "محطة اختيارية", manual: true, optional: true },
].map((c, i) => ({ ...c, n: i + 1 }));

export const BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));

/** Stations that count toward completion */
export const REQUIRED = CHAPTERS.filter((c) => !c.optional);
export const TOTAL = REQUIRED.length;
export const countDone = (done) => REQUIRED.filter((c) => done.includes(c.id)).length;
