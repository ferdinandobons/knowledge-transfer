# Design: skill `knowledge-transfer`

**Data**: 2026-06-10
**Stato**: approvato
**Repo pubblico**: `github.com/ferdinandobons/knowledge-transfer`

## Problema

Quando un collega lascia un progetto e un altro subentra, la conoscenza accumulata si perde:
sia quella umana (come funziona il progetto, quali sono i pezzi importanti, i flussi) sia
quella dell'AI (le memories Claude costruite lavorando con il collega uscente). Il nuovo
arrivato oggi deve chiedere all'AI di spiegargli tutto in modo non strutturato, su un
progetto che l'AI della sua macchina non conosce.

## Soluzione

Una Claude Skill prompt-driven con due fasi:

- **`/knowledge-transfer export`** — eseguita dal collega uscente: analizza il progetto e le
  sue memories Claude, produce un pacchetto di handover versionato nel repo del progetto
  (documento di onboarding non tecnico + memories portabili filtrate).
- **`/knowledge-transfer import`** — eseguita dal nuovo collega: verifica le memories del
  pacchetto contro lo stato attuale del codice, installa quelle valide nella sua memory
  directory e gli presenta il documento di onboarding.

Invocata senza argomenti, la skill rileva la situazione: se nel progetto esiste `handover/`
propone l'import, altrimenti l'export.

## Decisioni di design

| Decisione | Scelta |
|---|---|
| Flusso | Due fasi: export + import |
| Fonti dell'export | Codice + docs del progetto, memories Claude del collega |
| Collocazione pacchetto | Cartella `handover/` versionata nel repo del progetto |
| Comportamento import | Verifica contro il codice attuale, poi installa |
| Lingua del documento | Rilevata dal progetto (README/docs/commit) |
| Implementazione | Puramente prompt-driven: SKILL.md + references/, zero codice |

## Architettura

Skill installata in `~/.claude/skills/knowledge-transfer/`:

```
knowledge-transfer/
  SKILL.md                      # istruzioni operative per le due fasi
  references/
    onboarding-template.md      # struttura e tono del documento di onboarding
    package-format.md           # specifica del pacchetto di handover
    privacy-filter.md           # criteri di filtro delle memories
```

Nessuno script: tutta l'analisi e la sintesi le fa Claude a runtime. Claude conosce a
runtime il path della propria memory directory (fornito nel system prompt), quindi non
serve codice per risolverlo.

## Formato del pacchetto di handover

L'export produce nel repo del progetto:

```
handover/
  ONBOARDING.md          # il documento di onboarding
  memories/
    <slug>.md            # memories portabili, stesso formato frontmatter di Claude
  manifest.json          # metadata dell'export
```

`manifest.json` contiene: data export, autore (come da `git config user.name` — il filtro
privacy riguarda il contenuto delle memories, non i metadata git già pubblici nel repo),
commit SHA di riferimento, lingua del documento, conteggio memories esportate/escluse. Il commit SHA è la chiave della verifica
in import: con `git diff <sha>..HEAD` si individuano le aree cambiate dall'export e quindi
le memories a rischio di obsolescenza.

## Fase export

1. **Analisi progetto**: struttura del repo, README, CLAUDE.md, entry point, file di
   config — per identificare componenti principali e flussi logici.
2. **Lettura memories** dalla memory directory del progetto.
3. **Filtro privacy** (il pacchetto finisce nel repo, visibile al team):
   - escluse le memories di tipo `user` (identità e preferenze personali del collega);
   - incluse `project` e `reference`;
   - le `feedback` passano solo se riguardano il progetto e non lo stile personale;
   - tutto riscritto in forma neutra e spersonalizzata (niente nomi, email, dati personali).
4. **Generazione ONBOARDING.md** nella lingua rilevata dal progetto.
5. **Checklist finale** prima di scrivere: nessun dato personale nel pacchetto, documento
   entro la lunghezza target, ogni memory esportata verificabile contro il codice.

Se `handover/` esiste già, l'export lo rigenera chiedendo conferma prima di sovrascrivere.

## Documento ONBOARDING.md

Target: **1–2 pagine (~600–1000 parole)**, linguaggio non tecnico, zero jargon non
spiegato. Struttura:

1. **Cos'è in una frase** — il progetto spiegato a un collega al caffè
2. **A cosa serve** — il problema che risolve, per chi
3. **I pezzi principali** — i componenti, ognuno con 2-3 frasi in linguaggio semplice
4. **Come fluisce il lavoro** — 2-3 flussi logici end-to-end narrati
   ("quando un utente fa X, succede Y, poi Z")
5. **Da dove iniziare** — i primi file da guardare, come avviare il progetto
6. **Cose da sapere** — gotcha, convenzioni, decisioni storiche non deducibili dal codice

## Fase import

1. Legge `handover/` e il manifest.
2. **Verifica ogni memory** contro lo stato attuale: file/funzioni/path citati esistono
   ancora? Se il repo è git e il manifest ha lo SHA, usa il diff per individuare le aree
   cambiate dall'export.
3. Le memories valide vengono installate nella memory directory del nuovo collega, con
   indice `MEMORY.md` aggiornato. Quelle stale vengono aggiornate se la correzione è
   ovvia, altrimenti scartate con motivazione.
4. Presenta al nuovo collega: il documento di onboarding + riassunto di cosa è stato
   importato, aggiornato e scartato.

## Edge case

- **Nessuna memory esistente** → export del solo documento, segnalandolo.
- **Progetto non-git** → manifest senza SHA; la verifica in import si limita
  all'esistenza di file/path citati.
- **Import senza `handover/`** → messaggio chiaro con istruzioni per il collega uscente.
- **Memories già presenti sulla macchina del nuovo collega** → l'import non sovrascrive,
  integra; in caso di conflitto su uno slug esistente segnala e chiede.
- **`handover/` già esistente in export** → conferma prima di sovrascrivere.

## Repo pubblico

```
SKILL.md                # la skill stessa, alla radice del repo
references/             # onboarding-template.md, package-format.md, privacy-filter.md
README.md               # in inglese: cosa fa, install, esempi delle due fasi
LICENSE                 # MIT
CHANGELOG.md
```

Installazione: `git clone https://github.com/ferdinandobons/knowledge-transfer.git
~/.claude/skills/knowledge-transfer`. Release secondo le regole globali dell'utente
(tag solo a lavoro completo, check verdi prima del bump, README sincronizzato).

## Testing

Test manuale end-to-end documentato nel repo: un progetto fixture con memories finte →
export → verifica del pacchetto (incluso il filtro privacy: la memory `user` finta NON
deve comparire) → import su una memory directory pulita → verifica dell'installazione e
del report. Niente framework di test: la skill è prompt, si valida eseguendola.

## Fuori scope (YAGNI)

- Analisi di git history e trascrizioni di sessione come fonti (escluse esplicitamente).
- Formato portabile singolo file / flag `--portable`.
- Import interattivo memory-per-memory.
- Plugin Claude Code o marketplace.
