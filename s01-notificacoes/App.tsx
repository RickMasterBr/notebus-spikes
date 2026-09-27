import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { countRecords, insertRecord, listRecords, type LogRecord } from './src/db';
import {
  cancelAllAsync,
  pendingCountAsync,
  recordResponse,
  requestPermissionAsync,
  scheduleSeventyAsync,
  scheduleThreeAsync,
  scheduleTimeSensitiveAsync,
  setUpCategoryAsync,
} from './src/notifications';

const variant = String(Constants.expoConfig?.extra?.variant ?? 'basic');

type ActionButtonProps = {
  title: string;
  hint: string;
  onPress: () => void;
};

const ActionButton = ({ title, hint, onPress }: ActionButtonProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  >
    <Text style={styles.buttonTitle}>{title}</Text>
    <Text style={styles.buttonHint}>{hint}</Text>
  </Pressable>
);

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const [permission, setPermission] = useState('?');
  const [pending, setPending] = useState(0);
  const [records, setRecords] = useState<LogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    setPending(await pendingCountAsync());
    setRecords(listRecords());
    setTotal(countRecords());
  }, []);

  useEffect(() => {
    const init = async () => {
      await setUpCategoryAsync();
      setPermission(await requestPermissionAsync());
      const coldStartResponse = Notifications.getLastNotificationResponse();
      if (coldStartResponse) recordResponse(coldStartResponse);
      await refresh();
    };
    void init();

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      recordResponse(response);
      void refresh();
    });
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      responseSub.remove();
      appStateSub.remove();
    };
  }, [refresh]);

  const run = (label: string, task: () => Promise<string | void>) => async () => {
    try {
      const result = await task();
      setMessage(result ? `${label}: ${result}` : `${label}: ok`);
    } catch (error) {
      setMessage(`${label}: ERRO ${String(error)}`);
    }
    await refresh();
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>S-01 · {variant}</Text>
        <Text style={[styles.status, { color: colors.muted }]}>
          Permissão: {permission} · Pendentes: {pending} · Registros no banco: {total}
        </Text>
        {message ? <Text style={[styles.message, { color: colors.text }]}>{message}</Text> : null}

        <ActionButton
          title="T1/T2 · Agendar 3 avisos"
          hint="+2, +5 e +10 min. Feche o app e bloqueie o celular."
          onPress={run('T1', scheduleThreeAsync)}
        />
        {variant === 'entitlements' ? (
          <ActionButton
            title="T4 · Aviso time-sensitive"
            hint="+1 min. Ligue um modo Foco antes."
            onPress={run('T4', scheduleTimeSensitiveAsync)}
          />
        ) : null}
        <ActionButton
          title="T3 · Agendar 70 avisos"
          hint="Para amanhã. Cancela os outros antes. Mostra quantos o iOS guardou."
          onPress={run('T3', async () => {
            const report = await scheduleSeventyAsync();
            return `pedidos ${report.requested}, guardados ${report.kept} (de ${report.firstKept} a ${report.lastKept})`;
          })}
        />
        <ActionButton
          title="T6 · Gravar registro"
          hint="Grava no SQLite. Depois do refresh no SideStore, o total tem que continuar igual."
          onPress={run('T6', async () => insertRecord('button', 'manual'))}
        />
        <ActionButton
          title="Cancelar todos os avisos"
          hint="Limpa os pendentes."
          onPress={run('Cancelar', cancelAllAsync)}
        />

        <Text style={[styles.section, { color: colors.text }]}>Últimos registros</Text>
        {records.map((record) => (
          <View key={record.id} style={[styles.row, { borderColor: colors.border }]}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>
              #{record.id} · {record.source}
            </Text>
            <Text style={[styles.rowNote, { color: colors.muted }]}>
              {new Date(record.createdAt).toLocaleString('pt-PT')} · {record.note}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const lightColors = { background: '#F6F6F4', text: '#1B1B1B', muted: '#5E5E5E', border: '#DDDDDA' };
const darkColors = { background: '#121212', text: '#F2F2F2', muted: '#A8A8A8', border: '#2C2C2C' };

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', marginTop: 8 },
  status: { fontSize: 15 },
  message: { fontSize: 15, fontWeight: '600' },
  button: { backgroundColor: '#2F6FEB', borderRadius: 14, padding: 16, gap: 4 },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  buttonHint: { color: '#DCE7FF', fontSize: 14 },
  section: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 8, gap: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowNote: { fontSize: 13 },
});
