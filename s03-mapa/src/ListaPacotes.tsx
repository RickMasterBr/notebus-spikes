import { StyleSheet, Text, View } from 'react-native';

import type { PacoteConhecido } from './usePacotes';

type Props = { pacotes: PacoteConhecido[] | null; erro: string | null };

export const ListaPacotes = ({ pacotes, erro }: Props) => (
  <View style={styles.caixa}>
    <Text style={styles.titulo}>Pacotes offline conhecidos ao abrir</Text>
    {erro ? <Text style={styles.erro}>Erro: {erro}</Text> : null}
    {pacotes === null ? <Text style={styles.linha}>Carregando...</Text> : null}
    {pacotes?.length === 0 ? <Text style={styles.linha}>Nenhum pacote.</Text> : null}
    {pacotes?.map((pacote) => (
      <Text key={pacote.id} style={styles.linha}>
        {pacote.nome} | {pacote.estado} | {pacote.megabytes.toFixed(1)} MB | {pacote.tiles} tiles
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  caixa: { gap: 4 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#111827' },
  linha: { fontSize: 15, color: '#111827' },
  erro: { fontSize: 15, color: '#b91c1c' },
});
