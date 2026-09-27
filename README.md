# notebus-spikes

Testes práticos (spikes) do **NoteBus**, um caderno pessoal de horários de ônibus.
Cada spike responde uma dúvida técnica antes de uma decisão de arquitetura. O código é **descartável**: não é o app.

| Spike | Pergunta | Pasta |
|---|---|---|
| S-01 | Notificações locais agendadas funcionam num iPhone com Apple ID gratuito, instalado por sideload e sem Mac? | [`s01-notificacoes/`](s01-notificacoes/) |

## S-01 — como gerar e instalar

1. Todo push em `s01-notificacoes/` roda o workflow **S-01 iOS build** (ou rode à mão em *Actions → Run workflow*).
2. O GitHub gera dois `.ipa` **sem assinatura** e publica numa *Release* `s01-build-N`:
   - `S01-basic.ipa`: sem entitlements especiais.
   - `S01-entitlements.ipa`: com *time-sensitive* e *App Group*.
3. No iPhone, abra a Release no Safari, baixe o `.ipa` (vai para o app Arquivos) e instale pelo **SideStore** (`+` → escolher o arquivo). O SideStore assina com o seu Apple ID.

## S-01 — roteiro de testes

| ID | Passos | Anotar |
|---|---|---|
| T1 | Toque em **Agendar 3 avisos**, feche o app (deslize para cima) e bloqueie o celular | Hora de chegada de cada aviso |
| T2 | No aviso de +5 min, toque **Registrar passagem** (sem abrir o app). No de +10, toque **Perdi** | Abra o app: quais registros apareceram? |
| T3 | Toque em **Agendar 70 avisos** | A mensagem mostra quantos o iOS guardou e quais |
| T4 | (app *Ent*) Ligue um modo Foco e toque em **Aviso time-sensitive** | O aviso furou o Foco? |
| T5 | (app *Ent*) A instalação funcionou? O SideStore reclamou do App Group? | Mensagem de erro, se houver |
| T6 | Toque em **Gravar registro** algumas vezes, anote o total, faça **Refresh** no SideStore, abra o app | O total continua igual? |
| T7 | (opcional, 7 dias) Desligue o refresh automático e deixe vencer | Os avisos disparam? Os dados voltam após o refresh? |
| T8 | — | Tempo do workflow no GitHub e do download até o app aberto |

## Stack

Expo SDK 57 · React Native 0.86 · `expo-notifications` · `expo-sqlite` · TypeScript.
