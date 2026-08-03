import './globals.css';

export const metadata = {
  title: 'Générateur de pubs',
  description: "Génère des pubs prêtes à publier à partir d'une photo, d'un prix et d'une phrase.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,900&family=Space+Grotesk:wght@500;700&family=Manrope:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
