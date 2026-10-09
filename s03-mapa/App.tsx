import {
  Camera,
  type CameraRef,
  GeoJSONSource,
  Layer,
  Map,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Constants from 'expo-constants';

import { CENTRO_LEIRIA, ESTILO_CLARO, ESTILO_ESCURO, ZOOM_INICIAL } from './src/config';
import { ListaPacotes } from './src/ListaPacotes';
import { PainelDownload } from './src/PainelDownload';
import { Botao } from './src/ui';
import { useDownload } from './src/useDownload';
import { useInternet } from './src/useInternet';
import { useLocalizacao } from './src/useLocalizacao';
import { usePacotes } from './src/usePacotes';
import { gerarPontos, QUANTIDADES, type QuantidadePontos } from './src/pontos';

const { commit, buildDate } = Constants.expoConfig?.extra ?? {};

export default function App() {
  const [escuro, setEscuro] = useState(false);
  const [erroMapa, setErroMapa] = useState<string | null>(null);
  const lista = usePacotes();
  const download = useDownload(lista.atualizar);
  const internet = useInternet();
  const camera = useRef<CameraRef>(null);
  const { permissao, posicaoAtual } = useLocalizacao();
  const [avisoLocal, setAvisoLocal] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState<QuantidadePontos | null>(null);
  const [pontoTocado, setPontoTocado] = useState<string | null>(null);
  const pontos = useMemo(() => (quantidade ? gerarPontos(quantidade) : null), [quantidade]);

  const irParaMim = async () => {
    setAvisoLocal(null);
    const posicao = await posicaoAtual();
    if (!posicao) {
      setAvisoLocal('Sem posicao: permissao negada ou sinal indisponivel. O resto do app segue normal.');
      return;
    }
    camera.current?.flyTo({ center: posicao, zoom: 16, duration: 1000 });
  };

  const alternarEstilo = () => {
    setErroMapa(null);
    setEscuro((atual) => !atual);
  };

  return (
    <View style={styles.tela}>
      <View style={[styles.topo, internet === 'SEM internet' ? styles.topoOffline : styles.topoOnline]}>
        <Text style={styles.topoTexto}>Rede: {internet}</Text>
        <Text style={styles.topoTexto}>
          Ponto tocado: {pontoTocado ?? 'nenhum'}
          {quantidade ? ` | ${quantidade} pontos` : ''}
        </Text>
      </View>
      <Map
        style={styles.mapa}
        mapStyle={escuro ? ESTILO_ESCURO : ESTILO_CLARO}
        attribution
        onDidFailLoadingMap={() =>
          setErroMapa(`Nao carregou o estilo ${escuro ? 'escuro' : 'claro'}.`)
        }
      >
        <Camera ref={camera} initialViewState={{ center: CENTRO_LEIRIA, zoom: ZOOM_INICIAL }} />
        {permissao === 'liberada' ? <UserLocation /> : null}
        {pontos ? (
          <GeoJSONSource
            id="pontos-teste"
            data={pontos}
            hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}
            onPress={(evento) => {
              const alvo = evento.nativeEvent.features[0]?.properties?.id;
              setPontoTocado(typeof alvo === 'string' ? alvo : null);
            }}
          >
            <Layer
              id="pontos-circulos"
              type="circle"
              paint={{
                'circle-radius': 9,
                'circle-color': '#dc2626',
                // Forma, nao so cor: cheio = opaco; vazado = so o contorno.
                'circle-opacity': ['case', ['get', 'cheio'], 1, 0],
                'circle-stroke-width': 3,
                'circle-stroke-color': '#7f1d1d',
              }}
            />
          </GeoJSONSource>
        ) : null}
      </Map>

      <ScrollView style={styles.painel} contentContainerStyle={styles.painelConteudo}>
        {erroMapa ? <Text style={styles.erro}>{erroMapa}</Text> : null}
        <Botao
          titulo={`Estilo: ${escuro ? 'escuro' : 'claro'} (toque para alternar)`}
          aoTocar={alternarEstilo}
        />
        <Botao titulo="Onde estou" aoTocar={irParaMim} />
        <Text style={styles.aviso}>
          Localizacao: {permissao === 'liberada' ? 'liberada' : permissao === 'negada' ? 'negada' : 'pedindo'}
        </Text>
        {avisoLocal ? <Text style={styles.erro}>{avisoLocal}</Text> : null}
        <View style={styles.linhaBotoes}>
          {QUANTIDADES.map((valor) => (
            <View key={valor} style={styles.celula}>
              <Botao titulo={`${valor} pontos`} aoTocar={() => setQuantidade(valor)} />
            </View>
          ))}
        </View>
        <Botao
          titulo="Tirar pontos"
          aoTocar={() => {
            setQuantidade(null);
            setPontoTocado(null);
          }}
        />
        <ListaPacotes pacotes={lista.pacotes} erro={lista.erro} />
        <PainelDownload
          estado={download.estado}
          aoBaixar={download.baixar}
          aoApagar={download.apagarTudo}
        />
      </ScrollView>
      <Text style={styles.rodape}>
        Build {String(commit ?? 'local')} | {String(buildDate ?? 'sem data')}
      </Text>
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
  linhaBotoes: { flexDirection: 'row', gap: 8 },
  celula: { flex: 1 },
  aviso: { color: '#111827', fontSize: 15 },
  rodape: {
    backgroundColor: '#111827',
    color: '#ffffff',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 24,
  },
  erro: { color: '#b91c1c', fontSize: 16 },
});
