import { Camera, Map } from '@maplibre/maplibre-react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CENTRO_LEIRIA, ESTILO_CLARO, ESTILO_ESCURO, ZOOM_INICIAL } from './src/config';

export default function App() {
  const [escuro, setEscuro] = useState(false);
  const [erroMapa, setErroMapa] = useState<string | null>(null);

  const alternarEstilo = () => {
    setErroMapa(null);
    setEscuro((atual) => !atual);
  };

  return (
    <View style={styles.tela}>
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

      <View style={styles.painel}>
        {erroMapa ? <Text style={styles.erro}>{erroMapa}</Text> : null}
        <Pressable style={styles.botao} onPress={alternarEstilo}>
          <Text style={styles.botaoTexto}>
            Estilo: {escuro ? 'escuro' : 'claro'} (toque para alternar)
          </Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  mapa: { flex: 1 },
  painel: { padding: 12, gap: 8, backgroundColor: '#ffffff' },
  botao: { backgroundColor: '#1d4ed8', padding: 16, borderRadius: 10, alignItems: 'center' },
  botaoTexto: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
  erro: { color: '#b91c1c', fontSize: 16 },
});
