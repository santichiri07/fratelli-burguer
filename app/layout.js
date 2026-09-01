import "./globals.css";

export const metadata = {
  title: "Fratelli Burger Web — Pedí online",
  description: "Pedí tus hamburguesas online y coordiná el retiro o envío por WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Fuentes: Anton para títulos (estilo cartel de parrilla), DM Sans para texto */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
