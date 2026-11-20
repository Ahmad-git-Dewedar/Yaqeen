# يقين | YAQEEN

**تعلم دينك.. وازدد يقينك**: an Arabic (RTL) educational website on Islamic Aqeedah, built with React

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:5173>. `npm run build` writes a static site to `dist/` that any static host can serve.

## Stack

- React 18 + Vite
- Framer Motion for component animation (masked word reveals, tabs, quiz, dialogs, counters)
- Lenis for smooth scrolling (only when motion is set to full)
- Plain CSS with design tokens, no CSS framework

## Structure

```
index.html              Page shell, fonts, boot script
public/boot.js          Applies saved theme, motion and text settings before first paint
public/assets/img/      Paintings
src/
  main.jsx, App.jsx     Entry and page assembly
  data/                 Chapter list and quiz questions
  chapters/             One component per station
  components/           Loader, Hero, Header, Rail, Quiz, Dialogs, shared UI
  hooks/                Scroll spy, completion, reveals, smooth scroll
  lib/                  Progress store, preferences, search, Arabic normalisation
  styles/               tokens, base, layout, components, chapters, motion, react, theme
docs/content-source/    Pages of the approved content document
```

## Look and motion

- Editorial cream and ink with gold accents, dark painted bands between light sections
- Opening sequence once per visit: a star is drawn, the name rises, stations count to ten, the page lifts away
- The page stays on the hero until «ابدأ الرحلة»: the copy lifts, the painting pushes in, paper spreads from the
  button with the first station's name, then lifts to reveal it. Trying to scroll early nudges the button
- Hero with a pointer spotlight and copy that lifts as you scroll
- Headings rise word by word out of a mask; blocks and lists fade up quickly
- Paintings: a gold wipe that follows each frame's shape (top to bottom or bottom to top for tall frames,
  sideways for wide bands, opening from the centre for the closing plate), then the painting settles into focus
- Header slides away while reading down and returns on scroll up; a back-to-top button fills a gold ring as you read
- The marquee speeds up with scroll velocity and reverses when you scroll back
- Settings: live preview, cards that cascade in, gliding selection pill, named text sizes (صغير، عادي، كبير، أكبر)
- A moving band of key words, counting stats, sliding tab underline, animated quiz cards
- Settings → motion: full, reduced (fades only) or none (everything static)

## Fonts

- Headings: **Readex Pro**
- Quran and hadith: **Amiri**
- Body: **Vazirmatn** (200 by default, 300 or 400 in settings)

## Content

- Ten stations; the last one is an optional quiz that does not count toward completion
- Quiz: ten questions supplied by the site owner, four options each, with a short explanation linking back to
  the relevant station
- Source note in the footer: موقع الإمام ابن باز (binbaz.org.sa)
- Text follows the approved content document. Every Quran quotation was checked against the Tanzil text;
  hadith wording and numbers were checked on sunnah.com (Muslim 8, Muslim 2999, Bukhari 9, Abu Dawud 4682)
- Writing style: no em dashes, no period at the end of sentences, short text, no tashkeel in regular text.
  Quran verses and hadith keep their original vocalisation
- The content is a short introduction; it should still be reviewed by a qualified teacher before publishing
- One provided painting (a robed figure on a mountain path) is intentionally not used

## Events

```js
document.addEventListener("yaqeen:quiz-complete", (e) => {
  // e.detail = { score, total, completedAt, answers: [{ id, chosen, correct }] }
});
```

Progress changes fire `yaqeen:progress`, and settings changes fire `yaqeen:settings`.
