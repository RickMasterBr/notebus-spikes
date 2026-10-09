import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type Permissao = 'pedindo' | 'liberada' | 'negada';

export const useLocalizacao = () => {
  const [permissao, setPermissao] = useState<Permissao>('pedindo');

  useEffect(() => {
    let ativo = true;
    Location.requestForegroundPermissionsAsync()
      .then((resposta) => {
        if (ativo) setPermissao(resposta.granted ? 'liberada' : 'negada');
      })
      .catch(() => {
        if (ativo) setPermissao('negada');
      });
    return () => {
      ativo = false;
    };
  }, []);

  // Devolve [lng, lat] ou null; nunca lanca, para negar a permissao nao travar nada.
  const posicaoAtual = async (): Promise<[number, number] | null> => {
    try {
      const resposta = await Location.requestForegroundPermissionsAsync();
      setPermissao(resposta.granted ? 'liberada' : 'negada');
      if (!resposta.granted) return null;
      const ponto = await Location.getCurrentPositionAsync({});
      return [ponto.coords.longitude, ponto.coords.latitude];
    } catch {
      return null;
    }
  };

  return { permissao, posicaoAtual };
};
