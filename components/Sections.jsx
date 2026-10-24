import SectionHeading from './SectionHeading';
import CourseList from './CourseList';

export function Hero() {
  return <header id="hero" aria-label="Siga Siga">
    <nav className="main-nav" aria-label="Main navigation">
      <a href="#about">ABOUT →</a>
      <a href="#courses">COURSES →</a>
      <a href="/enroll">CONTACT US →</a>
    </nav>
    <h1 className="sr-only">Siga Siga — Greek Language & Culture Center</h1>
    <img className="hero-logo" src="/assets/ChatGPT Image Sep 7, 2026, 05_59_42 PM.png" alt="" />
    <img className="hero-descriptor" src="/assets/ChatGPT Image Sep 7, 2026, 06_12_33 PM.png" alt="" />
    <img className="decoration hero-flower" src="/assets/red-flower.png" alt="" />
    <span className="decoration spray hero-blue" aria-hidden="true" />
    <img className="decoration hero-snail" src="/assets/snail_tran.png" alt="" />
    <a className="level-test" href="/level-test/index.html">TAKE A LEVEL TEST →</a>
  </header>;
}

export function About() {
  return <section id="about" aria-label="About Siga Siga">
    <span className="decoration spray about-pink" aria-hidden="true" />
    <div className="about-copy">
      <p>Siga Siga is a Greek language school and cultural centre that began in our living room. We were two expats who moved to Athens and fell in love with the city.</p>
      <p>When we started learning Greek, we rediscovered the place we live in and the famous Greek philoxenia. We started getting the jokes, chatting with the vendors at the laiki,</p>
      <p>or finally making sense of the building group chat. We really wanted to share that experience with others and that’s how Siga Siga was born.</p>
    </div>
  </section>;
}

export function WhyGreek() {
  return <section id="why-greek" aria-labelledby="why-greek-heading">
    <span className="decoration spray why-blue" aria-hidden="true" />
    <SectionHeading id="why-greek-heading" asset="why-greek.png">WHY GREEK?</SectionHeading>
    <div className="benefits">
      <article><h3>GET<br />THE JOKES</h3></article>
      <article><h3>TALK<br />TO PEOPLE</h3></article>
      <article><h3>FEEL<br />AT HOME</h3></article>
    </div>
    <p className="why-greek-copy">Learning Greek takes place in small groups, with experienced teachers and good company, in person in Koukaki neighbourhood, central Athens, or online from anywhere in the cosmos <em>(and kosmos is a Greek word).</em> We have several Greek language classes running year-round, at all levels. You are welcome to take our <a href="/level-test/index.html">placement test</a> and join us.</p>
  </section>;
}

export function Courses() {
  return <section id="courses" aria-labelledby="courses-heading">
    <img className="decoration courses-peach" src="/assets/ChatGPT Image Sep 8, 2026, 06_31_35 PM.png" alt="" />
    <span className="decoration spray courses-blue" aria-hidden="true" />
    <SectionHeading id="courses-heading" asset="courses.png">COURSES</SectionHeading>
    <CourseList levelTestUrl={'/level-test/index.html'} />
  </section>;
}

export function Footer() {
  return <footer aria-label="Footer">
    <div className="footer-contact">
      <nav aria-label="Social and contact">
        <a href="https://www.instagram.com/siga__siga_language_center/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
        <a href="https://www.facebook.com/sigasigaculture" target="_blank" rel="noopener noreferrer">FACEBOOK</a>
        <a href="mailto:sigasigacenter@gmail.com">EMAIL</a>
        <a href="https://wa.me/306981279627">WHATSAPP</a>
      </nav>
      <a className="footer-phone" href="tel:+306981279627">Phone/Whatsapp +306981279627</a>
      <address className="footer-address"><a href="https://www.google.com/maps/search/?api=1&query=Odissea%20Androutsou%2036%2C%20Koukaki%2C%20Athens%2011741" target="_blank" rel="noopener noreferrer">Odissea Androutsou 36, Koukaki, Athens 11741 ↗</a></address>
    </div>
    <img className="footer-logo" src="/assets/Logo white.png" alt="Siga Siga" width="1536" height="1024" />
  </footer>;
}
