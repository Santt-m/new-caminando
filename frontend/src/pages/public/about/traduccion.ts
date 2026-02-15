export interface ITranslation {
    es: Record<string, unknown>;
    en: Record<string, unknown>;
    pt: Record<string, unknown>;
    [key: string]: Record<string, unknown>;
}

export const traducciones: ITranslation = {
    es: {
        title: "Tu Marca, Potenciada por Nuestra Tecnología",
        subtitle: "Unimos la identidad y propuesta de tu negocio con un motor de ecommerce de grado empresarial.",
        // Section: Personalization
        personalizationTitle: "Diseño que Respira tu Identidad",
        personalizationDesc: "No usamos plantillas rígidas. Nuestro equipo de diseño adapta cada rincón de la interfaz para que refleje los valores, colores y la voz de tu marca.",
        // Section: Turnkey
        turnkeyTitle: "Implementación Llave en Mano",
        turnkeyDesc: "Nos encargamos de todo el despliegue técnico. Recibes tu tienda 100% operativa y lista para recibir clientes en tu propia infraestructura.",
        // Section: Managed
        managedTitle: "Acompañamiento Estratégico",
        managedDesc: "Ofrecemos servicios de mantenimiento proactivo para que nunca tengas que preocuparte por servidores o actualizaciones. Tu éxito es nuestro objetivo.",
        cta: "Hablemos de tu proyecto",
        // Trust Section
        trustTitle: "Tu Historia Genera Confianza",
        trustDesc: "Un ecommerce profesional necesita más que botones de compra. Por eso, tu plataforma incluye secciones diseñadas para contar quién eres y qué valores representas, facilitando el vínculo de confianza con tus clientes.",
        trustQuote: "La tecnología es el motor, pero tu identidad es la que cierra la venta.",
        teamTitle: "Santt Developments",
        teamSubtitle: "Desarrollo y Soporte Tecnológico",
        // ADN Tecnológico
        dnaTitle: "Nuestra ADN Tecnológico",
        dnaPerfTitle: "Rendimiento Extremo",
        dnaPerfDesc: "Cada línea de código está optimizada para la conversión. Menos de 1s de carga es nuestro estándar.",
        dnaSecTitle: "Seguridad Estructural",
        dnaSecDesc: "Protección integrada desde el primer día. Tu negocio y tus clientes están a salvo.",
        dnaScalTitle: "Escalabilidad Infinita",
        dnaScalDesc: "Arquitectura Cloud-ready que crece con tu demanda sin comprometer la estabilidad.",
        dnaSpeedVal: "0.8s",
        dnaSpeedLabel: "Velocidad Promedio de Carga"
    },
    en: {
        title: "Your Brand, Powered by Our Technology",
        subtitle: "We merge your brand identity and value with an enterprise-grade ecommerce engine.",
        personalizationTitle: "Design that Breathes Your Identity",
        personalizationDesc: "We don't use rigid templates. Our design team adapts every corner of the interface to reflect your brand values, colors, and voice.",
        turnkeyTitle: "Turnkey Implementation",
        turnkeyDesc: "We handle all the technical deployment. You receive your store 100% operational and ready to receive customers on your own infrastructure.",
        managedTitle: "Strategic Support",
        managedDesc: "We offer proactive maintenance services so you never have to worry about servers or updates. Your success is our goal.",
        cta: "Let's talk about your project",
        // Trust Section
        trustTitle: "Your Story Builds Trust",
        trustDesc: "A professional ecommerce needs more than just checkout buttons. That's why your platform includes sections designed to tell who you are and what values you represent, facilitating a trust bond with your customers.",
        trustQuote: "Technology is the engine, but your identity is what closes the sale.",
        teamTitle: "Santt Developments",
        teamSubtitle: "Technology Development & Support",
        // DNA
        dnaTitle: "Our Tech DNA",
        dnaPerfTitle: "Extreme Performance",
        dnaPerfDesc: "Every line of code is optimized for conversion. Less than 1s load is our standard.",
        dnaSecTitle: "Structural Security",
        dnaSecDesc: "Integrated protection from day one. Your business and your customers are safe.",
        dnaScalTitle: "Infinite Scalability",
        dnaScalDesc: "Cloud-ready architecture that grows with your demand without compromising stability.",
        dnaSpeedVal: "0.8s",
        dnaSpeedLabel: "Average Load Speed"
    },
    pt: {
        title: "Sua Marca, Impulsionada pela Nossa Tecnologia",
        subtitle: "Unimos a identidade e proposta do seu negócio com um motor de ecommerce de nível empresarial.",
        personalizationTitle: "Design que Respira Sua Identidade",
        personalizationDesc: "Não usamos templates rígidos. Nossa equipe de design adapta cada canto da interface para refletir os valores, cores e voz da sua marca.",
        turnkeyTitle: "Implementação Chave na Mão",
        turnkeyDesc: "Cuidamos de toda a implementação técnica. Você recebe sua loja 100% operacional e pronta para receber clientes em sua própria infraestrutura.",
        managedTitle: "Acompanhamento Estratégico",
        managedDesc: "Oferecemos serviços de manutenção proativa para que você nunca precise se preocupar com servidores ou atualizações. Seu sucesso é o nosso objetivo.",
        cta: "Vamos falar sobre o seu projeto",
        // Trust Section
        trustTitle: "Sua História Gera Confiança",
        trustDesc: "Um ecommerce profissional precisa de mais do que apenas botões de compra. Por isso, sua plataforma inclui seções projetadas para contar quem você é e quais valores representa, facilitando o vínculo de confiança com seus clientes.",
        trustQuote: "A tecnologia é o motor, mas sua identidade é o que fecha a venda.",
        teamTitle: "Santt Developments",
        teamSubtitle: "Desenvolvimento e Suporte Tecnológico",
        // ADN
        dnaTitle: "Nossa ADN Tecnológica",
        dnaPerfTitle: "Desempenho Extremo",
        dnaPerfDesc: "Cada linha de código é otimizada para conversão. Menos de 1s de carga é o nosso padrão.",
        dnaSecTitle: "Segurança Estrutural",
        dnaSecDesc: "Proteção integrada desde o primeiro dia. Seu negócio e seus clientes estão seguros.",
        dnaScalTitle: "Escalabilidade Infinita",
        dnaScalDesc: "Arquitetura Cloud-ready que cresce com sua demanda sem comprometer a estabilidade.",
        dnaSpeedVal: "0.8s",
        dnaSpeedLabel: "Velocidade Média de Carga"
    }
};
