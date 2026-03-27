import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'
import landingStyles from '@/components/landing/landing.module.css'
import { verifySession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Schedly',
  description: 'Conheça como o Schedly coleta, usa e protege os dados pessoais dos usuários.',
}

const sections: LegalSection[] = [
  {
    id: 'escopo',
    title: 'Escopo desta política',
    paragraphs: [
      'Esta Política de Privacidade explica como o Schedly trata dados pessoais coletados por meio do site, da página inicial, da área autenticada, das páginas de agendamento e das integrações disponibilizadas na plataforma.',
      'Ao utilizar o Schedly, você concorda com o tratamento de dados necessário para fornecer recursos como criação de agenda, confirmação de compromissos, notificações, cobranças e integrações com serviços de terceiros.',
    ],
  },
  {
    id: 'dados-coletados',
    title: 'Dados que podemos coletar',
    paragraphs: [
      'Os dados tratados variam conforme o uso da plataforma, mas podem incluir informações fornecidas diretamente por você, dados gerados durante o uso do sistema e dados compartilhados por integrações autorizadas.',
    ],
    items: [
      'Dados de cadastro, como nome, e-mail, telefone, senha criptografada e informações do perfil profissional.',
      'Dados de clientes e agendamentos, como nome do cliente, e-mail, telefone, serviço escolhido, horário marcado, observações e histórico de alterações.',
      'Dados técnicos, como endereço IP, navegador, dispositivo, idioma, logs de acesso, preferências e identificadores usados para manter a sessão segura.',
      'Dados de integrações e pagamento, como identificadores de assinaturas, informações de calendário conectado e metadados necessários para processar cobranças ou notificações.',
    ],
  },
  {
    id: 'uso-dos-dados',
    title: 'Como usamos os dados',
    paragraphs: [
      'Utilizamos os dados para operar e melhorar o Schedly, viabilizando a experiência principal de agendamento e a administração da conta.',
    ],
    items: [
      'Criar e manter sua conta, autenticar acessos e personalizar a experiência dentro da plataforma.',
      'Processar agendamentos, enviar confirmações, lembretes, e-mails transacionais e notificações relacionadas aos serviços contratados.',
      'Sincronizar eventos com ferramentas externas, como calendários conectados por você.',
      'Cobrar planos, prevenir fraude, monitorar uso indevido e cumprir obrigações legais ou regulatórias.',
      'Analisar desempenho, corrigir erros e desenvolver melhorias de produto, sempre buscando minimizar o uso de dados pessoais quando possível.',
    ],
  },
  {
    id: 'compartilhamento',
    title: 'Compartilhamento de informações',
    paragraphs: [
      'Não vendemos dados pessoais. O compartilhamento acontece apenas quando necessário para entregar o serviço, cumprir a lei ou proteger direitos legítimos do Schedly, de nossos usuários e de terceiros.',
    ],
    items: [
      'Provedores de infraestrutura, autenticação, e-mail, analytics, notificações e pagamento que atuam em nosso nome.',
      'Plataformas integradas por sua escolha, como serviços de calendário ou processamento de pagamento.',
      'Autoridades competentes, quando houver obrigação legal, decisão judicial ou necessidade de defesa em processo administrativo ou judicial.',
    ],
  },
  {
    id: 'retencao',
    title: 'Retenção e armazenamento',
    paragraphs: [
      'Mantemos os dados pelo período necessário para prestar os serviços contratados, cumprir obrigações legais, resolver disputas e preservar a segurança da plataforma.',
      'Quando a exclusão da conta for solicitada, faremos o bloqueio, a remoção ou a anonimização dos dados, observados os prazos legais e as informações que precisem ser mantidas para auditoria, faturamento ou cumprimento regulatório.',
    ],
  },
  {
    id: 'direitos',
    title: 'Seus direitos',
    paragraphs: [
      'Respeitamos os direitos previstos na legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais (LGPD), quando aplicável ao tratamento realizado.',
    ],
    items: [
      'Confirmar a existência de tratamento e solicitar acesso aos dados pessoais.',
      'Pedir correção, atualização, portabilidade, anonimização, bloqueio ou exclusão, nos limites técnicos e legais cabíveis.',
      'Revogar consentimentos concedidos e solicitar informações sobre compartilhamentos realizados.',
      'Apresentar oposição ao tratamento quando entender que ele não está em conformidade com a legislação aplicável.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies, sessões e tecnologias semelhantes',
    paragraphs: [
      'O Schedly utiliza cookies e tecnologias equivalentes para autenticar usuários, lembrar preferências, melhorar desempenho, entender falhas e proteger a plataforma contra abuso.',
      'Você pode gerenciar cookies diretamente no navegador, mas a desativação de alguns recursos pode impactar login, segurança, integrações e funcionamento de páginas de agendamento.',
    ],
  },
  {
    id: 'seguranca',
    title: 'Segurança da informação',
    paragraphs: [
      'Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados, incluindo controles de acesso, criptografia em trânsito, segregação de ambientes e monitoramento operacional.',
      'Nenhum sistema é completamente imune a incidentes. Por isso, recomendamos que você mantenha suas credenciais seguras e nos comunique imediatamente caso identifique uso indevido da conta.',
    ],
  },
  {
    id: 'alteracoes-e-contato',
    title: 'Alterações e contato',
    paragraphs: [
      'Podemos atualizar esta Política de Privacidade para refletir evoluções do produto, alterações legais ou melhorias operacionais. Quando a mudança for relevante, publicaremos a nova versão nesta página.',
      'Para dúvidas, solicitações relacionadas à privacidade ou exercício de direitos, entre em contato pelo e-mail contato@schedlyfy.com.',
    ],
  },
]

export default async function PrivacyPage() {
  const session = await verifySession()

  return (
    <div className={landingStyles.page}>
      <Header isAuthenticated={Boolean(session)} />
      <LegalPage
        eyebrow="Privacidade"
        title="Política de Privacidade"
        summary="Transparência sobre como tratamos dados pessoais, informações de agenda, integrações e comunicações dentro do Schedly."
        lastUpdated="26 de março de 2026"
        sections={sections}
      />
      <Footer />
    </div>
  )
}