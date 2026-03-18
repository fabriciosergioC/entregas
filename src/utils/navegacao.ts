/**
 * Utilitários para abrir apps de navegação (Google Maps e Waze)
 */

/**
 * Abre o Google Maps ou Waze com a rota para o endereço especificado
 * @param endereco - Endereço completo para navegação
 * @param app - App de navegação preferido ('google' | 'waze' | 'both')
 */
export function abrirNavegacao(endereco: string, app: 'google' | 'waze' | 'both' = 'both') {
  // Codificar o endereço para URL
  const enderecoCodificado = encodeURIComponent(endereco);

  // URLs para apps móveis
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${enderecoCodificado}`;
  const wazeUrl = `https://waze.com/ul?q=${enderecoCodificado}&navigate=yes`;

  // Detectar se está em dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (!isMobile) {
    // Em desktop, abre em nova aba
    window.open(googleMapsUrl, '_blank');
    return;
  }

  // Em mobile, tenta abrir o app nativo
  if (app === 'google' || app === 'both') {
    // Google Maps (Android/iOS)
    const googleMapsIntent = `google.navigation:q=${enderecoCodificado}`;
    
    // Tenta abrir o app do Google Maps
    window.location.href = googleMapsIntent;
    
    // Fallback: se não abrir em alguns segundos, abre a URL web
    setTimeout(() => {
      window.open(googleMapsUrl, '_blank');
    }, 2000);
    
    return;
  }

  if (app === 'waze') {
    // Waze (Android/iOS)
    const wazeIntent = `waze://?q=${enderecoCodificado}&navigate=yes`;
    
    // Tenta abrir o app do Waze
    window.location.href = wazeIntent;
    
    // Fallback: se não abrir em alguns segundos, abre a URL web
    setTimeout(() => {
      window.open(wazeUrl, '_blank');
    }, 2000);
    
    return;
  }
}

/**
 * Mostra um modal/prompt para o usuário escolher entre Google Maps ou Waze
 * @param endereco - Endereço para navegação
 */
export function escolherAppNavegacao(endereco: string) {
  const escolha = confirm(
    'Escolha o app de navegação:\n\n✅ OK - Google Maps\n❌ Cancelar - Waze'
  );
  
  abrirNavegacao(endereco, escolha ? 'google' : 'waze');
}
