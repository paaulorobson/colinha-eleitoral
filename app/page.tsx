import Tela from "@/components/Tela";
import Acoes from "@/components/Acoes";
import { UF, ANO } from "@/lib/tse";

const ORDEM = [
  {
    chave: "fed",
    cargo: "deputado-federal",
    titulo: "Deputado Federal",
    digitos: 4,
  },
  {
    chave: "est",
    cargo: "deputado-estadual",
    titulo: "Deputado Estadual",
    digitos: 5,
  },
  { chave: "sen1", cargo: "senador", titulo: "Senador 1ª vaga", digitos: 3 },
  { chave: "sen2", cargo: "senador", titulo: "Senador 2ª vaga", digitos: 3 },
  { chave: "gov", cargo: "governador", titulo: "Governador", digitos: 2 },
  { chave: "pres", cargo: "presidente", titulo: "Presidente", digitos: 2 },
];

export default function Page() {
  return (
    <main>
      <div className="folha">
        <header className="topo">
          <small>
            Eleições {ANO} · {UF}
          </small>
          <h1>Cola eleitoral</h1>
        </header>
        <div className="miolo">
          <div className="intro">
            <h2>Anote todos os seus votos.</h2>
            <p>Estes números você não pode esquecer.</p>
          </div>
          <ol className="linha-tempo">
            {ORDEM.map((t, i) => (
              <Tela key={t.chave} ordinal={`${i + 1}º`} {...t} />
            ))}
          </ol>
          <div className="lateral">
            <p className="nota">
              <b>*</b> Para votar, não se esqueça de levar o título de eleitor e
              um documento oficial de identificação com foto.
            </p>
          </div>
        </div>
      </div>
      <Acoes
        ordem={ORDEM.map((o) => ({
          chave: o.chave,
          titulo: o.titulo,
          digitos: o.digitos,
        }))}
        ano={ANO}
        uf={UF}
      />
      <p className="fonte">
        Dados do DivulgaCandContas (TSE). A situação do registro pode mudar até
        a votação; confira o número na urna antes de confirmar.
      </p>
    </main>
  );
}
