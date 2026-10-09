import { OfflineManager } from '@maplibre/maplibre-react-native';
import { useCallback, useEffect, useState } from 'react';

export type PacoteConhecido = { id: string; nome: string; estado: string; megabytes: number; tiles: number };

// Lista o que o OfflineManager conhece ao abrir. Sem nenhum tratamento para sobreviver ao Refresh.
export const usePacotes = () => {
  const [pacotes, setPacotes] = useState<PacoteConhecido[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const atualizar = useCallback(async () => {
    try {
      const lista = await OfflineManager.getPacks();
      const itens = await Promise.all(
        lista.map(async (pacote) => {
          const status = await pacote.status();
          return {
            id: pacote.id,
            nome: typeof pacote.metadata.nome === 'string' ? pacote.metadata.nome : '(sem nome)',
            estado: status.state,
            megabytes: status.completedResourceSize / (1024 * 1024),
            tiles: status.completedTileCount,
          };
        }),
      );
      setPacotes(itens);
      setErro(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : String(falha));
    }
  }, []);

  useEffect(() => {
    atualizar();
  }, [atualizar]);

  return { pacotes, erro, atualizar };
};
