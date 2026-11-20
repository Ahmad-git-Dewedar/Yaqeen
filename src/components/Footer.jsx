import { Words } from "./ui.jsx";

export default function Footer() {
  return (
    <footer className="site-footer" id="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__brand">
          <p className="brand__ar">يقين</p>
          <Words className="site-footer__slogan" text="تعلم دينك.. وازدد يقينك" />
        </div>
        <p className="site-footer__note">موقع تعليمي في أصول العقيدة الإسلامية من القرآن الكريم والسنة</p>
        <p className="site-footer__en" lang="en">YAQEEN · Learn your faith, grow in certainty</p>
      </div>
    </footer>
  );
}
