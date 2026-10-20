import { Hero, About, WhyGreek, Courses, Footer } from '../components/Sections';
import LevelTestCTA from '../components/LevelTestCTA';

export default function Home() {
  return <>
    <main>
      <Hero />
      <About />
      <WhyGreek />
      <Courses />
    </main>
    <Footer />
    <LevelTestCTA />
  </>;
}
