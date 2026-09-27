import type { ExpoConfig } from 'expo/config';

// Two builds of the same app:
// - "basic": no special entitlements. Tests T1, T2, T3, T6, T7, T8.
// - "entitlements": adds time-sensitive + App Group. Tests T4 and T5.
// Different bundle IDs so both can live on the phone side by side.
const variant = process.env.S01_VARIANT === 'entitlements' ? 'entitlements' : 'basic';
const bundleIdentifier =
  variant === 'basic' ? 'io.github.rickmasterbr.s01' : 'io.github.rickmasterbr.s01ent';

const config: ExpoConfig = {
  name: variant === 'basic' ? 'S01' : 'S01 Ent',
  slug: 's01-notificacoes',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier,
    supportsTablet: false,
    entitlements:
      variant === 'entitlements'
        ? {
            'com.apple.developer.usernotifications.time-sensitive': true,
            'com.apple.security.application-groups': [`group.${bundleIdentifier}`],
          }
        : {},
  },
  plugins: ['expo-notifications', 'expo-sqlite'],
  extra: { variant },
};

export default config;
