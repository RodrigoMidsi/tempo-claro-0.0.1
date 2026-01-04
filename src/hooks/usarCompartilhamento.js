import { useCallback } from 'react';
import { gerenciadorRotinas } from '../manager/gerenciadorRotinas'; // Caminho ajustado para sua estrutura

export const UsarCompartilhamento = () => {
  
  const compartilharRotina = useCallback(async (rotina) => {
    // Gera o texto usando o método corrigido no passo 1
    const textoFormatado = gerenciadorRotinas.gerarTextoCompartilhamento(rotina);
    const titulo = `Rotina: ${rotina.nome}`;

    // 1. Tenta usar a API Nativa do Navegador (Android/iOS)
    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: textoFormatado,
        });
        return { sucesso: true, mensagem: 'Compartilhado com sucesso!' };
      } catch (erro) {
        if (erro.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', erro);
        }
        return { sucesso: false };
      }
    } else {
      // 2. Fallback: Abre WhatsApp Web se estiver no PC
      const textoCodificado = encodeURIComponent(textoFormatado);
      const urlWhatsapp = `https://wa.me/?text=${textoCodificado}`;
      window.open(urlWhatsapp, '_blank');
      return { sucesso: true, mensagem: 'Abrindo WhatsApp...' };
    }
  }, []);

  return { compartilharRotina };
};