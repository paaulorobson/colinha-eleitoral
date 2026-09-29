import "./globals.css";
import { Barlow, Barlow_Condensed } from "next/font/google";
const corpo = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--corpo",
});
const numeros = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--numeros",
});

export const metadata = {
  title: "Colinha eleitoral",
  description: "Consulte candidatos pelo número da urna",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${corpo.variable} ${numeros.variable}`}>
        {children}
      </body>
    </html>
  );
}
