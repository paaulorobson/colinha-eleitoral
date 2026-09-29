"use client";
import { useState } from "react";

type Item = { chave: string; titulo: string; digitos: number };
const VERDE = "#0b8a3e",
  AMARELO = "#f7c60a";
const FONTE =
  '"Barlow Condensed","Arial Narrow","Helvetica Neue",Arial,sans-serif';

function ler(chave: string) {
  try {
    return JSON.parse(localStorage.getItem("colinha:" + chave) || "{}");
  } catch {
    return {};
  }
}

function desenhar(ordem: Item[], ano: string, uf: string): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = 1080;
  cv.height = 1920;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 1080, 1920);
  g.fillStyle = VERDE;
  g.fillRect(0, 0, 1080, 400);
  g.textAlign = "center";
  g.fillStyle = "#fff";
  g.font = `500 44px ${FONTE}`;
  g.fillText(`ELEIÇÕES ${ano} · ${uf}`, 540, 120);
  g.fillStyle = AMARELO;
  g.font = `700 170px ${FONTE}`;
  g.fillText("COLA ELEITORAL", 540, 300);

  g.fillStyle = VERDE;
  g.fillRect(178, 520, 8, 5 * 200);
  ordem.forEach((o, i) => {
    const s = ler(o.chave),
      y = 470 + i * 200;
    g.fillStyle = s.ok ? AMARELO : VERDE;
    g.fillRect(140, y, 84, 84);
    g.fillStyle = s.ok ? "#111" : "#fff";
    g.textAlign = "center";
    g.font = `700 44px ${FONTE}`;
    g.fillText(`${i + 1}º`, 182, y + 58);
    g.textAlign = "left";
    g.fillStyle = "#1b1d1a";
    g.font = `700 40px ${FONTE}`;
    g.fillText(o.titulo.toUpperCase(), 270, y + 30);
    if (s.branco) {
      g.font = `700 56px ${FONTE}`;
      g.fillText("VOTO EM BRANCO", 270, y + 105);
    } else
      for (let d = 0; d < o.digitos; d++) {
        const x = 270 + d * 92;
        g.lineWidth = 5;
        g.strokeStyle = "#222";
        g.strokeRect(x, y + 44, 80, 80);
        g.textAlign = "center";
        g.font = `700 60px ${FONTE}`;
        g.fillText((s.n || "")[d] ?? "", x + 40, y + 106);
        g.textAlign = "left";
      }
    if (s.nome && !s.branco) {
      g.font = `500 34px ${FONTE}`;
      g.fillStyle = "#3d453d";
      g.fillText(s.nome.slice(0, 40), 270, y + 168);
    }
  });

  g.fillStyle = VERDE;
  g.fillRect(0, 1720, 1080, 200);
  g.fillStyle = AMARELO;
  g.fillRect(0, 1720, 1080, 12);
  g.textAlign = "center";
  g.fillStyle = "#fff";
  g.font = `700 74px ${FONTE}`;
  return cv;
}

export default function Acoes({
  ordem,
  ano,
  uf,
}: {
  ordem: Item[];
  ano: string;
  uf: string;
}) {
  const [msg, setMsg] = useState("");

  const gerar = async (): Promise<Blob> => {
    await document.fonts.ready;
    const cv = desenhar(ordem, ano, uf);
    return new Promise((ok, erro) =>
      cv.toBlob((b) => (b ? ok(b) : erro(new Error("falha"))), "image/png"),
    );
  };
  const baixar = (b: Blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = "cola-eleitoral-story.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };

  const stories = async () => {
    try {
      const b = await gerar();
      const f = new File([b], "cola-eleitoral-story.png", {
        type: "image/png",
      });
      if (navigator.canShare?.({ files: [f] })) {
        await navigator.share({ files: [f], title: "Minha cola eleitoral" });
        setMsg("Escolha o Instagram na lista e toque em Stories.");
      } else {
        baixar(b);
        setMsg(
          "Imagem baixada. Abra o Instagram, crie um story e escolha essa imagem na galeria.",
        );
      }
    } catch (e: any) {
      if (e?.name !== "AbortError")
        setMsg("Não deu para gerar a imagem. Tente de novo.");
    }
  };

  return (
    <div className="acoes">
      <button className="acao" onClick={() => window.print()}>
        Imprimir
      </button>
      <button
        className="acao"
        onClick={async () => {
          try {
            baixar(await gerar());
            setMsg("Imagem baixada.");
          } catch {
            setMsg("Não deu para gerar a imagem.");
          }
        }}
      >
        Baixar imagem
      </button>
      <button className="acao destaque" onClick={stories}>
        Postar nos stories
      </button>
      {msg && (
        <p className="msg" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
