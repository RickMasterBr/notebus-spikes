import { StyleSheet, Text, View } from 'react-native';

import { LIMITE_MB, TILES_ESTIMADOS } from './config';
import type { EstadoDownload, ZoomMaximo } from './useDownload';
import { Botao } from './ui';

type Props = {
  estado: EstadoDownload;
  aoBaixar: (zoomMaximo: ZoomMaximo) => void;
  aoApagar: () => void;
};

export const PainelDownload = ({ estado, aoBaixar, aoApagar }: Props) => (
  <View style={styles.caixa}>
    <Botao titulo="Baixar Leiria (zoom 10 a 16)" aoTocar={() => aoBaixar(16)} />
    <Botao titulo="Baixar teste (zoom 10 a 15)" aoTocar={() => aoBaixar(15)} />
    <Botao titulo="Apagar pacotes" aoTocar={aoApagar} perigo />
    {estado.rotulo ? (
      <Text style={styles.linha}>
        {estado.rotulo}: {estado.baixando ? 'baixando' : 'parado'} {estado.porcento.toFixed(0)}%
        {'\n'}Tiles: {estado.tiles} (estimativa {TILES_ESTIMADOS}) | Recursos: {estado.recursos} de{' '}
        {estado.recursosTotais}
        {'\n'}Baixado: {estado.megabytes.toFixed(1)} MB (meta {LIMITE_MB} MB) | {estado.segundos} s
      </Text>
    ) : null}
    {estado.erro ? <Text style={styles.erro}>Erro: {estado.erro}</Text> : null}
    {estado.espacoLiberadoMb !== null ? (
      <Text style={styles.linha}>Espaco liberado: {estado.espacoLiberadoMb.toFixed(1)} MB</Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  caixa: { gap: 8 },
  linha: { fontSize: 15, color: '#111827' },
  erro: { fontSize: 15, color: '#b91c1c' },
});
