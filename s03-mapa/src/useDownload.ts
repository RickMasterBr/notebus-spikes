import { OfflineManager } from '@maplibre/maplibre-react-native';
import type { OfflinePackStatus } from '@maplibre/maplibre-react-native';
import { useRef, useState } from 'react';

import { ESTILO_CLARO, LIMITE_TILES, REGIAO_LEIRIA } from './config';

export type ZoomMaximo = 15 | 16;

export type EstadoDownload = {
  rotulo: string;
  baixando: boolean;
  tiles: number;
  recursos: number;
  recursosTotais: number;
  porcento: number;
  megabytes: number;
  segundos: number;
  erro: string | null;
  espacoLiberadoMb: number | null;
};

const VAZIO: EstadoDownload = {
  rotulo: '',
  baixando: false,
  tiles: 0,
  recursos: 0,
  recursosTotais: 0,
  porcento: 0,
  megabytes: 0,
  segundos: 0,
  erro: null,
  espacoLiberadoMb: null,
};

const paraMb = (bytes: number) => bytes / (1024 * 1024);

export const useDownload = (aoMudarPacotes: () => void) => {
  const [estado, setEstado] = useState<EstadoDownload>(VAZIO);
  const inicio = useRef(0);

  const baixar = async (zoomMaximo: ZoomMaximo) => {
    const rotulo = `Leiria z10-${zoomMaximo}`;
    inicio.current = Date.now();
    setEstado({ ...VAZIO, rotulo, baixando: true });
    try {
      // Folga sobre a estimativa de ~2.400 tiles (calculo da grade: 2.395).
      OfflineManager.setTileCountLimit(LIMITE_TILES);
      await OfflineManager.createPack(
        {
          mapStyle: ESTILO_CLARO,
          bounds: REGIAO_LEIRIA,
          minZoom: 10,
          maxZoom: zoomMaximo,
          metadata: { nome: rotulo },
        },
        (_pack, status: OfflinePackStatus) => {
          setEstado((atual) => ({
            ...atual,
            baixando: status.state !== 'complete',
            tiles: status.completedTileCount,
            recursos: status.completedResourceCount,
            recursosTotais: status.requiredResourceCount,
            porcento: status.percentage,
            megabytes: paraMb(status.completedResourceSize),
            segundos: Math.round((Date.now() - inicio.current) / 1000),
          }));
          if (status.state === 'complete') aoMudarPacotes();
        },
        (_pack, erro) => {
          setEstado((atual) => ({ ...atual, baixando: false, erro: erro.message }));
        },
      );
    } catch (erro) {
      setEstado((atual) => ({
        ...atual,
        baixando: false,
        erro: erro instanceof Error ? erro.message : String(erro),
      }));
    }
  };

  const apagarTudo = async () => {
    try {
      const pacotes = await OfflineManager.getPacks();
      const status = await Promise.all(pacotes.map((pacote) => pacote.status()));
      const bytes = status.reduce((soma, item) => soma + item.completedResourceSize, 0);
      await Promise.all(pacotes.map((pacote) => OfflineManager.deletePack(pacote.id)));
      setEstado({ ...VAZIO, espacoLiberadoMb: paraMb(bytes) });
      aoMudarPacotes();
    } catch (erro) {
      setEstado((atual) => ({
        ...atual,
        erro: erro instanceof Error ? erro.message : String(erro),
      }));
    }
  };

  return { estado, baixar, apagarTudo };
};
