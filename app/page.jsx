import { Hero, About, WhyGreek, Courses, Footer } from '../components/Sections';

export default function Home() {
  return <>
    <main>
      <Hero />
      <About />
      <WhyGreek />
      <Courses />
    </main>
    <Footer />
  </>;
}
