const BASE =
  process.env.TSE_BASE ||
  "https://divulgacandcontas.tse.jus.br/divulga/rest/v1";
export const H = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "pt-BR,pt;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  Referer: "https://divulgacandcontas.tse.jus.br/divulga/",
  Origin: "https://divulgacandcontas.tse.jus.br",
};
export const UF = process.env.UF || "MA";
export const ANO = process.env.ANO || "2026";

export const CARGOS: Record<
  string,
  { cod: number; ue: string; digitos: number; nome: string }
> = {
  presidente: { cod: 1, ue: "BR", digitos: 2, nome: "Presidente" },
  governador: { cod: 3, ue: UF, digitos: 2, nome: "Governador" },
  senador: { cod: 5, ue: UF, digitos: 3, nome: "Senador" },
  "deputado-federal": { cod: 6, ue: UF, digitos: 4, nome: "Deputado Federal" },
  "deputado-estadual": {
    cod: 7,
    ue: UF,
    digitos: 5,
    nome: "Deputado Estadual",
  },
};

async function tse(path: string, revalidate = 300) {
  const r = await fetch(BASE + path, { headers: H, next: { revalidate } });
  if (!r.ok) {
    console.error("TSE", r.status, path);
    throw new Error(`TSE respondeu ${r.status} em ${path}`);
  }
  return r.json();
}

// Descobre os códigos das eleições ordinárias do ano (a API não é documentada oficialmente).
async function eleicoes(): Promise<string[]> {
  if (process.env.TSE_ELEICAO) return process.env.TSE_ELEICAO.split(",");
  const lista = await tse("/eleicao/ordinarias", 3600);
  return (Array.isArray(lista) ? lista : [])
    .filter((e: any) => String(e.ano ?? e.anoEleicao) === ANO)
    .map((e: any) => String(e.codigo ?? e.id));
}

export async function buscar(cargoKey: string, numero: string) {
  const c = CARGOS[cargoKey];
  if (!c || !/^\d+$/.test(numero)) throw new Error("Cargo ou número inválido");
  for (const el of await eleicoes()) {
    let lista: any;
    try {
      lista = await tse(
        `/candidatura/listar/${ANO}/${c.ue}/${el}/${c.cod}/candidatos`,
      );
    } catch {
      continue;
    }
    const cands = lista?.candidatos ?? [];
    if (!cands.length) continue;
    const achado = cands.find((x: any) => String(x.numero) === numero);
    if (!achado) return null;
    const d = await tse(
      `/candidatura/buscar/${ANO}/${c.ue}/${el}/candidato/${achado.id}`,
      600,
    );
    return normalizar(d, achado);
  }
  throw new Error(
    "Não encontrei a eleição no TSE. Defina TSE_ELEICAO no .env.local.",
  );
}

function normalizar(d: any, base: any) {
  const bens = Array.isArray(d.bens) ? d.bens : [];
  return {
    id: d.id ?? base.id,
    numero: d.numero ?? base.numero,
    nomeUrna: d.nomeUrna ?? base.nomeUrna,
    nomeCompleto: d.nomeCompleto ?? base.nomeCompleto,
    partido: d.partido?.sigla ?? base.partido?.sigla ?? "",
    partidoNome: d.partido?.nome ?? "",
    situacao: d.descricaoSituacao ?? base.descricaoSituacao ?? "",
    cargo: d.cargo?.nome ?? "",
    foto: d.fotoUrl ?? null,
    ocupacao: d.ocupacao ?? "",
    instrucao: d.grauInstrucao ?? "",
    nascimento: d.dataDeNascimento ?? "",
    naturalidade: [d.nomeMunicipioNascimento, d.sgUfNascimento]
      .filter(Boolean)
      .join(" / "),
    totalBens:
      d.totalDeBens ??
      (bens.length
        ? bens.reduce((s: number, b: any) => s + Number(b.valor || 0), 0)
        : null),
    vice: d.vices?.[0]?.nomeUrna ?? null,
    federacao: d.nomeColigacao ?? d.composicaoColigacao ?? "",
  };
}
