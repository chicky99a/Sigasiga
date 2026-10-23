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
    <p className="enrollment-intro">This is the place to ask about courses at Siga Siga or send us love letters. Too lazy to fill out the form? Give us a <a href="tel:+306981279627">call</a>, send us a <a href="https://wa.me/306981279627" target="_blank" rel="noopener noreferrer">WhatsApp</a> at <a href="tel:+306981279627">+30 698 127 9627</a>, or drop us an <a href="mailto:sigasigacenter@gmail.com">email</a> at <a href="mailto:sigasigacenter@gmail.com">sigasigacenter@gmail.com</a>.</p>
    <EnrollmentForm contact />
  </main>;
}
