import type { FeatureCollection, Point } from 'geojson';

import { REGIAO_LEIRIA } from './config';

export type QuantidadePontos = 100 | 300 | 800;
export const QUANTIDADES: QuantidadePontos[] = [100, 300, 800];

// Pontos INVENTADOS: grade regular dentro da regiao. Nenhum dado real.
export const gerarPontos = (quantidade: number): FeatureCollection<Point> => {
  const [oeste, sul, leste, norte] = REGIAO_LEIRIA;
  const colunas = Math.ceil(Math.sqrt(quantidade * 1.5));
  const linhas = Math.ceil(quantidade / colunas);
  const margem = 0.1;
  const features = Array.from({ length: quantidade }, (_, indice) => {
    const coluna = indice % colunas;
    const linha = Math.floor(indice / colunas);
    const lng = oeste + (leste - oeste) * (margem + ((1 - 2 * margem) * (coluna + 0.5)) / colunas);
    const lat = sul + (norte - sul) * (margem + ((1 - 2 * margem) * (linha + 0.5)) / linhas);
    return {
      type: 'Feature' as const,
      id: indice,
      properties: { id: `P${indice + 1}`, cheio: indice % 2 === 0 },
      geometry: { type: 'Point' as const, coordinates: [lng, lat] },
    };
  });
  return { type: 'FeatureCollection', features };
};
