"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  chave: string;
  cargo: string;
  titulo: string;
  digitos: number;
  ordinal: string;
};
type Salvo = { n: string; branco: boolean; ok: boolean; nome?: string };

export default function Tela({
  chave,
  cargo,
  titulo,
  digitos,
  ordinal,
}: Props) {
  const [n, setN] = useState("");
  const [branco, setBranco] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [nome, setNome] = useState("");
  const [c, setC] = useState<any>(null);
  const [estado, setEstado] = useState<"ocioso" | "buscando" | "nao" | "erro">(
    "ocioso",
  );
  const [dica, setDica] = useState("");
  const [pronto, setPronto] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const s: Salvo = JSON.parse(
        localStorage.getItem("colinha:" + chave) || "{}",
      );
      setN(s.n || "");
      setBranco(!!s.branco);
      setConfirmado(!!s.ok);
      setNome(s.nome || "");
    } catch {}
    setPronto(true);
  }, [chave]);

  useEffect(() => {
    if (pronto)
      localStorage.setItem(
        "colinha:" + chave,
        JSON.stringify({ n, branco, ok: confirmado, nome }),
      );
  }, [n, branco, confirmado, nome, chave, pronto]);

  useEffect(() => {
    setC(null);
    if (branco || n.length !== digitos) return setEstado("ocioso");
    setEstado("buscando");
    const ctl = new AbortController();
    fetch(`/api/candidato?cargo=${cargo}&numero=${n}`, { signal: ctl.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.erro) return setEstado("erro");
        if (!j.candidato) return setEstado("nao");
        setC(j.candidato);
        setEstado("ocioso");
        setNome(
          `${j.candidato.nomeUrna}${j.candidato.partido ? ` (${j.candidato.partido})` : ""}`,
        );
      })
      .catch(() => {});
    return () => ctl.abort();
  }, [n, branco, cargo, digitos]);

  const digitar = (v: string) => {
    setDica("");
    setNome("");
    setN(v.replace(/\D/g, "").slice(0, digitos));
  };
  const corrige = () => {
    setNome("");
    setN("");
    setBranco(false);
    setConfirmado(false);
    setDica("");
    ref.current?.focus();
  };
  const votarBranco = () => {
    setNome("");
    setN("");
    setBranco(true);
    setConfirmado(false);
    setDica("");
  };
  const confirma = () => {
    if (branco || c) {
      setConfirmado(true);
      setDica("");
    } else
      setDica(
        n.length < digitos
          ? "Complete o número antes de confirmar."
          : "Só dá para confirmar um candidato encontrado ou voto em branco.",
      );
  };

  const caixas = Array.from({ length: digitos }, (_, i) => n[i] ?? "");
  const moeda = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const deferido =
    c && /deferido/i.test(c.situacao) && !/indeferido/i.test(c.situacao);

  return (
    <li
      className={`linha${confirmado ? " ok" : ""}`}
      onClick={() => !confirmado && ref.current?.focus()}
    >
      <span className="marca">{ordinal}</span>
      <div className="conteudo">
        <h3 className="cargo">
          {titulo}
          {confirmado && <em> · voto confirmado</em>}
        </h3>
        <div className="digitos">
          {branco ? (
            <p className="votobranco">Voto em branco</p>
          ) : (
            caixas.map((d, i) => (
              <b
                key={i}
                className={i === n.length && !confirmado ? "atual" : ""}
              >
                {d}
              </b>
            ))
          )}
          <input
            ref={ref}
            value={n}
            inputMode="numeric"
            maxLength={digitos}
            disabled={confirmado || branco}
            aria-label={`Número de ${titulo}`}
            onChange={(e) => digitar(e.target.value)}
          />
        </div>
        <div className="info">
          {estado === "buscando" && <p className="aviso">Buscando no TSE…</p>}
          {estado === "nao" && (
            <p className="aviso">
              Nenhum candidato com o número {n}. Corrija e digite de novo.
            </p>
          )}
          {estado === "erro" && (
            <p className="aviso">
              Não foi possível consultar o TSE agora. Tente de novo.
            </p>
          )}
          {branco && (
            <p className="aviso">
              Você não escolheu candidato para este cargo.
            </p>
          )}
          {dica && <p className="dica">{dica}</p>}
          {c && (
            <div className="ficha">
              <div className="foto">
                {c.foto ? (
                  <img
                    src={`/api/foto?u=${encodeURIComponent(c.foto)}`}
                    alt={`Foto de ${c.nomeUrna}`}
                  />
                ) : (
                  <span>Sem foto</span>
                )}
              </div>
              <div>
                <p className="nome">{c.nomeUrna}</p>
                <p>
                  {c.partido}
                  {c.partidoNome ? ` – ${c.partidoNome}` : ""}
                </p>
                <p className={deferido ? "sit ok" : "sit"}>
                  {c.situacao || "Situação não informada"}
                </p>
                {c.vice && <p>Vice: {c.vice}</p>}
              </div>
            </div>
          )}
        </div>
        <div className="teclas">
          <button
            className="tecla branco"
            onClick={(e) => {
              e.stopPropagation();
              votarBranco();
            }}
            disabled={confirmado}
          >
            Branco
          </button>
          <button
            className="tecla corrige"
            onClick={(e) => {
              e.stopPropagation();
              corrige();
            }}
          >
            Corrige
          </button>
          <button
            className="tecla confirma"
            onClick={(e) => {
              e.stopPropagation();
              confirma();
            }}
            disabled={confirmado}
          >
            Confirma
          </button>
        </div>
      </div>
    </li>
  );
}
