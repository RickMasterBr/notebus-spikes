import { Pressable, StyleSheet, Text } from 'react-native';

type BotaoProps = { titulo: string; aoTocar: () => void; perigo?: boolean };

export const Botao = ({ titulo, aoTocar, perigo = false }: BotaoProps) => (
  <Pressable style={[styles.botao, perigo && styles.perigo]} onPress={aoTocar}>
    <Text style={styles.texto}>{titulo}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  botao: { backgroundColor: '#1d4ed8', padding: 16, borderRadius: 10, alignItems: 'center' },
  perigo: { backgroundColor: '#b91c1c' },
  texto: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
});
