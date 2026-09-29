# Colinha eleitoral (Next.js)

Consulta candidatos pelo número da urna (Presidente, Governador, Senador 1 e 2, Deputado Federal e Estadual)
na API do DivulgaCandContas (TSE). As chamadas ao TSE são feitas no servidor (rotas `app/api/*`), o que
contorna a falta de CORS da API, e a foto passa por um proxy (`/api/foto`).

## Rodar
    npm install
    cp .env.example .env.local
    npm run dev   # http://localhost:3000

## Configuração
- `UF` e `ANO` (padrão MA e 2026).
- `TSE_ELEICAO`: se a descoberta automática do código da eleição falhar, informe o código (ou vários, separados por vírgula).

## Atenção
A API do TSE não tem documentação oficial; os nomes dos campos vêm da documentação da comunidade
(github.com/augusto-herrmann/divulgacandcontas-doc). Se algum campo vier vazio, ajuste `normalizar()` em `lib/tse.ts`.
