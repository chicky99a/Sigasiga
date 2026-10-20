import './globals.css';

export const metadata = {
  title: 'Siga Siga — Greek Language & Culture Center',
  description: 'Greek language school and cultural centre in Athens.',
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
