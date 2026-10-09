import { useEffect, useState } from 'react';

const URL_TESTE = 'https://www.gstatic.com/generate_204';
const INTERVALO_MS = 5000;
const TEMPO_LIMITE_MS = 3000;

export type SituacaoInternet = 'testando' | 'com internet' | 'SEM internet';

// Teste real de rede (nao so "o aparelho diz que esta conectado"): um pedido pequeno a cada 5 s.
export const useInternet = (): SituacaoInternet => {
  const [situacao, setSituacao] = useState<SituacaoInternet>('testando');

  useEffect(() => {
    let ativo = true;
    const testar = async () => {
      const controle = new AbortController();
      const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
      try {
        await fetch(URL_TESTE, { method: 'HEAD', cache: 'no-store', signal: controle.signal });
        if (ativo) setSituacao('com internet');
      } catch {
        if (ativo) setSituacao('SEM internet');
      } finally {
        clearTimeout(relogio);
      }
    };
    testar();
    const intervalo = setInterval(testar, INTERVALO_MS);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, []);

  return situacao;
};
