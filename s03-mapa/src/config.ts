import type { LngLat, LngLatBounds } from '@maplibre/maplibre-react-native';

export const ESTILO_CLARO = 'https://tiles.openfreemap.org/styles/liberty';
// Nao confirmado (o site do OpenFreeMap estava fora do alcance ao escrever o spike).
// Se o mapa nao carregar com esta URL, a tela mostra o erro.
export const ESTILO_ESCURO = 'https://tiles.openfreemap.org/styles/dark';

export const CENTRO_LEIRIA: LngLat = [-8.8071, 39.7437];
export const ZOOM_INICIAL = 14;

// [oeste, sul, leste, norte]
export const REGIAO_LEIRIA: LngLatBounds = [-8.93, 39.66, -8.69, 39.82];
export const TILES_ESTIMADOS = 2400;
export const LIMITE_TILES = 6000;
export const LIMITE_MB = 150;
