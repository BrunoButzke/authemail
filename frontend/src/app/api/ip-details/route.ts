import { NextRequest, NextResponse } from 'next/server';
import { IPinfoWrapper } from 'node-ipinfo';

export async function GET(request: NextRequest) {
  const ipinfoToken = process.env.IPINFO_TOKEN;

  if (!ipinfoToken) {
    console.error('IPINFO_TOKEN não está definido nas variáveis de ambiente.');
    return NextResponse.json({ error: "Configuração do servidor incompleta." }, { status: 500 });
  }

  const ipinfo = new IPinfoWrapper(ipinfoToken);
  
  // Na Vercel, o IP do cliente é obtido do cabeçalho 'x-forwarded-for'
  // ou diretamente da propriedade `ip` do objeto `request` (em Edge Functions).
  // A propriedade `request.ip` é mais confiável em ambientes Edge.
  let clientIp = request.ip; // Preferencial para Edge Functions

  if (!clientIp) {
    // Fallback para x-forwarded-for se request.ip não estiver disponível
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0].trim();
    }
  }
  
  // Remover ::ffff: prefixo se for um endereço IPv4 mapeado para IPv6
  if (clientIp && clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.substring(7);
  }

  // Para testes locais na Vercel (vercel dev), o IP pode ser '::1' ou '127.0.0.1'.
  // IPinfo não retorna dados para IPs locais.
  // Se IPINFO_TOKEN_OVERRIDE_IP estiver configurado, use-o para testes.
  const overrideIp = process.env.IPINFO_TOKEN_OVERRIDE_IP;
  if ((clientIp === '::1' || clientIp === '127.0.0.1') && overrideIp) {
    console.log(`Detectado IP local (${clientIp}). Usando IP de override para demonstração (${overrideIp}).`);
    clientIp = overrideIp;
  } else if (clientIp === '::1' || clientIp === '127.0.0.1') {
     console.log(`Detectado IP local (${clientIp}). A API IPinfo pode não retornar dados geográficos.`);
     // Não vamos mais forçar 8.8.8.8 aqui. Se você precisar testar, use IPINFO_TOKEN_OVERRIDE_IP.
     // Ou, para deploy, ele pegará o IP real do usuário.
  }


  if (!clientIp) {
    return NextResponse.json({ error: "Não foi possível determinar o endereço IP." }, { status: 400 });
  }

  try {
    const response = await ipinfo.lookupIp(clientIp);
    // console.log("Resposta completa da API IPinfo (Next.js API Route):", response); // Log para depuração se necessário

    const countryName = response.country; //  Propriedade .country geralmente contém o nome do país
    
    return NextResponse.json({
      country: countryName || response.countryCode || 'Não disponível', // Fallback para countryCode
      city: response.city || 'Não disponível',
      region: response.region || 'Não disponível',
      ip: clientIp, // Retorna o IP que foi usado para a busca
    });
  } catch (error: any) {
    console.error("Erro ao buscar detalhes do IP (Next.js API Route):", error);
    // Não exponha detalhes do erro ao cliente em produção
    let errorMessage = "Erro ao buscar detalhes de geolocalização.";
    if (error && error.message && error.message.includes('HTTP 401: Unauthorized')) {
        errorMessage = "Token IPinfo inválido ou não autorizado.";
    } else if (error && error.message && error.message.includes('HTTP 429: Too Many Requests')) {
        errorMessage = "Limite de requisições IPinfo excedido.";
    }
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
} 