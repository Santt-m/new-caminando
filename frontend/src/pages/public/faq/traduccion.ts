export interface ITranslation {
    es: Record<string, unknown>;
    en: Record<string, unknown>;
    pt: Record<string, unknown>;
    [key: string]: Record<string, unknown>;
}

import { BRANDING } from '@/config/branding';

export const traducciones: ITranslation = {
    es: {
        title: "Preguntas Frecuentes",
        subtitle: `Todo lo que necesitas saber sobre el motor de ${BRANDING.appName} y nuestro modelo Llave en Mano.`,
        q1: "¿Qué significa 'Llave en Mano'?",
        a1: "Es el servicio donde entregamos la plataforma operativa bajo tu total control. Realizas un pago único por la implementación y puesta en marcha. Al igual que un negocio físico tiene costos de servicios, permanecer en internet conlleva gastos de infraestructura (servidor, dominio) que son ajenos a nuestros honorarios y necesarios para que tu tienda sea siempre accesible.",
        q2: "¿Dónde se almacena mi tienda?",
        a2: "Trabajamos con Vercel y Railway por su excelencia en escala, pero nuestro sistema es compatible con AWS, Google Cloud, Azure o cualquier plataforma que desees.",
        q3: "¿Se puede integrar con mi banco?",
        a3: "Sí, siempre que el banco ofrezca una API de pagos moderna (como lo hacen Stripe o Mercado Pago), podemos implementar la conexión directa.",
        q4: "¿Soy el dueño de mi tienda?",
        a4: "Sí. A diferencia de las plataformas de suscripción, aquí el motor operativo te pertenece. Tienes el control total sobre tus datos y tu flujo de ventas.",
        q5: "¿Ofrecen mantenimiento?",
        a5: "Sí, ofrecemos planes de mantenimiento proactivo para asegurarnos de que tu tienda esté siempre en la última versión estable y segura."
    },
    en: {
        title: "Frequently Asked Questions",
        subtitle: `Everything you need to know about the ${BRANDING.appName} engine and our Turnkey model.`,
        q1: "What does 'Turnkey' mean?",
        a1: "It's the service where we deliver the operating platform under your full control. You make a single payment for implementation and setup. Just as a physical business has utility costs, staying online entails infrastructure expenses (server, domain) that are independent of our fees and necessary for your store to always be accessible.",
        q2: "Where is my store stored?",
        a2: "We work with Vercel and Railway for their excellence in scaling, but our system is compatible with AWS, Google Cloud, Azure, or any platform you desire.",
        q3: "Can it be integrated with my bank?",
        a3: "Yes, as long as the bank offers a modern payment API (like Stripe or Mercado Pago do), we can implement the direct connection.",
        q4: "Do I own my store?",
        a4: "Yes. Unlike subscription platforms, here the operating engine belongs to you. You have full control over your data and your sales flow.",
        q5: "Do you offer maintenance?",
        a5: "Yes, we offer proactive maintenance plans to ensure your store is always on the latest stable and secure version."
    },
    pt: {
        title: "Perguntas Frequentes",
        subtitle: `Tudo o que você precisa saber sobre o motor ${BRANDING.appName} e nosso modelo Chave na Mão.`,
        q1: "O que significa 'Chave na Mão'?",
        a1: "É o serviço onde entregamos a plataforma operacional sob seu total controle. Você faz um pagamento único pela implementação e comissionamento. Assim como um negócio físico tem custos de serviços, permanecer na internet acarreta gastos de infraestrutura (servidor, domínio) que são alheios aos nossos honorários e necessários para que sua loja esteja sempre acessível.",
        q2: "Onde minha loja fica armazenada?",
        a2: "Trabalhamos com Vercel e Railway por sua excelência em escala, mas nosso sistema é compatível com AWS, Google Cloud, Azure ou qualquer plataforma que você desejar.",
        q3: "Pode ser integrado ao meu banco?",
        a3: "Sim, desde que o banco ofereça uma API de pagamentos moderna (como o Stripe ou o Mercado Pago fazem), podemos implementar a conexão direta.",
        q4: "Eu sou o dono da minha loja?",
        a4: "Sim. Diferente das plataformas de assinatura, aqui o motor operacional pertence a você. Você tem controle total sobre seus dados e seu fluxo de vendas.",
        q5: "Vocês oferecem manutenção?",
        a5: "Sim, oferecemos planos de manutenção proativa para garantir que sua loja esteja sempre na versão estável e segura mais recente."
    }
};
