import { Camera, Map } from '@maplibre/maplibre-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CENTRO_LEIRIA, ESTILO_CLARO, ESTILO_ESCURO, ZOOM_INICIAL } from './src/config';
import { PainelDownload } from './src/PainelDownload';
import { Botao } from './src/ui';
import { useDownload } from './src/useDownload';
import { useInternet } from './src/useInternet';

export default function App() {
  const [escuro, setEscuro] = useState(false);
  const [erroMapa, setErroMapa] = useState<string | null>(null);
  const download = useDownload(() => {});
  const internet = useInternet();

  const alternarEstilo = () => {
    setErroMapa(null);
    setEscuro((atual) => !atual);
  };

  return (
    <View style={styles.tela}>
      <View style={[styles.topo, internet === 'SEM internet' ? styles.topoOffline : styles.topoOnline]}>
        <Text style={styles.topoTexto}>Rede: {internet}</Text>
      </View>
      <Map
        style={styles.mapa}
        mapStyle={escuro ? ESTILO_ESCURO : ESTILO_CLARO}
        attribution
        onDidFailLoadingMap={() =>
          setErroMapa(`Nao carregou o estilo ${escuro ? 'escuro' : 'claro'}.`)
        }
      >
        <Camera initialViewState={{ center: CENTRO_LEIRIA, zoom: ZOOM_INICIAL }} />
      </Map>

      <ScrollView style={styles.painel} contentContainerStyle={styles.painelConteudo}>
        {erroMapa ? <Text style={styles.erro}>{erroMapa}</Text> : null}
        <Botao
          titulo={`Estilo: ${escuro ? 'escuro' : 'claro'} (toque para alternar)`}
          aoTocar={alternarEstilo}
        />
        <PainelDownload
          estado={download.estado}
          aoBaixar={download.baixar}
          aoApagar={download.apagarTudo}
        />
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  topo: { paddingTop: 48, paddingBottom: 8, paddingHorizontal: 12 },
  topoOnline: { backgroundColor: '#15803d' },
  topoOffline: { backgroundColor: '#b91c1c' },
  topoTexto: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  mapa: { flex: 1 },
  painel: { maxHeight: 280, backgroundColor: '#ffffff' },
  painelConteudo: { padding: 12, gap: 8 },
  erro: { color: '#b91c1c', fontSize: 16 },
});
