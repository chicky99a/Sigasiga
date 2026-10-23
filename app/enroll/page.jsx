import EnrollmentForm from '../../components/EnrollmentForm';

export const metadata = {
  title: 'Contact Us | Siga Siga',
  description: 'Contact Siga Siga Greek Language & Culture Center.',
};

export default function EnrollPage() {
  return <main className="enrollment-page">
    <a className="enrollment-home" href="/">← SIGA SIGA</a>
    <p className="eyebrow">GREEK LANGUAGE & CULTURE CENTER</p>
    <h1>CONTACT US</h1>
    <p className="enrollment-intro">This is the place to ask about courses at Siga Siga or send us love letters.</p>
    <EnrollmentForm contact />
  </main>;
}
