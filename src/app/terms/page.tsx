import type { Metadata } from 'next'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'
import { LegalPage, type LegalSection } from '@/components/legal/legal-page'
import landingStyles from '@/components/landing/landing.module.css'
import { verifySession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Termos de Serviço | Schedly',
  description: 'Leia os Termos de Serviço que regem o uso da plataforma Schedly.',
}

const sections: LegalSection[] = [
  {
    id: 'aceitacao',
    title: 'Aceitação dos termos',
    paragraphs: [
      'Ao acessar ou utilizar o Schedly, você concorda com estes Termos de Serviço. Se estiver usando a plataforma em nome de uma empresa ou equipe, você declara que possui autorização para aceitar estes termos em nome da organização.',
      'Se não concordar com estes termos, interrompa o uso da plataforma e não conclua cadastro, assinatura ou integração.',
    ],
  },
  {
    id: 'descricao-do-servico',
    title: 'Descrição do serviço',
    paragraphs: [
      'O Schedly oferece ferramentas para criação de páginas de agendamento, gestão de disponibilidade, atendimento a clientes, integrações com calendários, envio de notificações e recursos relacionados à operação de agendas profissionais.',
      'Podemos adicionar, remover ou ajustar funcionalidades para evolução do produto, manutenção, segurança ou adequação legal.',
    ],
  },
  {
    id: 'cadastro-e-seguranca',
    title: 'Cadastro e segurança da conta',
    paragraphs: [
      'Você é responsável por fornecer informações verdadeiras, manter seus dados atualizados e preservar a confidencialidade das credenciais de acesso.',
      'Também é sua responsabilidade revisar permissões concedidas a terceiros, dispositivos conectados e integrações externas vinculadas à sua conta.',
    ],
  },
  {
    id: 'uso-permitido',
    title: 'Uso permitido',
    paragraphs: [
      'O uso do Schedly deve respeitar a legislação aplicável, estes termos e os direitos de terceiros.',
    ],
    items: [
      'Não é permitido utilizar a plataforma para fraude, spam, abuso, assédio, phishing, distribuição de malware ou atividades ilícitas.',
      'Você não deve tentar contornar controles de segurança, extrair dados em massa sem autorização ou interferir na disponibilidade do serviço.',
      'Ao tratar dados de clientes na plataforma, você deve ter base legal adequada e agir de forma compatível com as normas de privacidade aplicáveis ao seu negócio.',
    ],
  },
  {
    id: 'conteudo-e-integracoes',
    title: 'Conteúdo, agendamentos e integrações',
    paragraphs: [
      'Você mantém a responsabilidade pelos dados, mensagens, descrições de serviço, links e informações de clientes inseridos na plataforma.',
      'Quando optar por integrar contas externas, como calendários ou meios de pagamento, o funcionamento dessas integrações também depende dos termos e políticas dos respectivos provedores.',
    ],
  },
  {
    id: 'planos-e-cobranca',
    title: 'Planos, cobrança e cancelamento',
    paragraphs: [
      'Recursos gratuitos e pagos podem coexistir no Schedly. Quando houver assinatura, preço, ciclo de cobrança, testes e condições comerciais, essas informações serão apresentadas no momento da contratação.',
      'Você autoriza o processamento das cobranças pelos meios disponibilizados na plataforma. Cancelamentos futuros interrompem novas renovações, mas não geram reembolso automático de períodos já faturados, salvo quando exigido por lei ou por política comercial expressa.',
    ],
  },
  {
    id: 'propriedade-intelectual',
    title: 'Propriedade intelectual',
    paragraphs: [
      'O Schedly, sua marca, seu código, seu design, sua documentação e seus elementos de interface pertencem ao Schedly ou aos respectivos licenciantes e são protegidos pela legislação aplicável.',
      'Estes termos não transferem propriedade intelectual ao usuário. Concedemos apenas uma licença limitada, revogável, não exclusiva e intransferível para usar a plataforma conforme estes termos.',
    ],
  },
  {
    id: 'disponibilidade',
    title: 'Disponibilidade e suporte',
    paragraphs: [
      'Buscamos manter a plataforma disponível e confiável, mas não garantimos operação ininterrupta, livre de falhas ou compatível com qualquer configuração externa de terceiros.',
      'Poderemos realizar manutenções, atualizações, correções emergenciais e ajustes de infraestrutura sempre que necessário para preservar desempenho e segurança.',
    ],
  },
  {
    id: 'suspensao',
    title: 'Suspensão e encerramento',
    paragraphs: [
      'Podemos limitar, suspender ou encerrar contas que violem estes termos, apresentem risco de segurança, gerem dano a terceiros ou utilizem a plataforma de modo abusivo.',
      'Você pode deixar de usar o Schedly a qualquer momento. Algumas obrigações que, por sua natureza, devam sobreviver ao encerramento continuam válidas, como disposições sobre propriedade intelectual, responsabilidade e cumprimento legal.',
    ],
  },
  {
    id: 'limitacao-de-responsabilidade',
    title: 'Limitação de responsabilidade',
    paragraphs: [
      'Na extensão permitida pela lei, o Schedly não será responsável por lucros cessantes, perda indireta de receita, indisponibilidade de provedores externos, falhas de terceiros, perda de oportunidade comercial ou danos consequenciais decorrentes do uso da plataforma.',
      'Nada nestes termos afasta responsabilidades que não possam ser legalmente excluídas.',
    ],
  },
  {
    id: 'alteracoes-e-contato',
    title: 'Alterações destes termos e contato',
    paragraphs: [
      'Podemos atualizar estes Termos de Serviço periodicamente. A versão mais recente permanecerá publicada nesta página, com a data da última revisão.',
      'Se você tiver dúvidas sobre estes termos, entre em contato pelo e-mail contato@schedlyfy.com.',
    ],
  },
]

export default async function TermsPage() {
  const session = await verifySession()

  return (
    <div className={landingStyles.page}>
      <Header isAuthenticated={Boolean(session)} />
      <LegalPage
        eyebrow="Termos"
        title="Termos de Serviço"
        summary="Condições que regem o uso do Schedly, incluindo cadastro, uso permitido, assinatura, disponibilidade e responsabilidades."
        lastUpdated="26 de março de 2026"
        sections={sections}
      />
      <Footer />
    </div>
  )
}