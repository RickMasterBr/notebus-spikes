import type { ExpoConfig } from 'expo/config';

// Spike S-03: MapLibre + offline pack no iPhone com sideload (Apple ID gratuito).
// Descartavel. Hash e data do build chegam pelo workflow (S03_COMMIT, S03_BUILD_DATE).
const config: ExpoConfig = {
  name: 'S03 Mapa',
  slug: 's03-mapa',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'io.github.rickmasterbr.s03',
    supportsTablet: false,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'O spike usa sua posicao para mostrar o circulo azul no mapa.',
    },
  },
  plugins: [
    '@maplibre/maplibre-react-native',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'O spike usa sua posicao para mostrar o circulo azul no mapa.',
      },
    ],
  ],
  extra: {
    commit: process.env.S03_COMMIT ?? 'local',
    buildDate: process.env.S03_BUILD_DATE ?? 'sem data',
  },
};

export default config;
