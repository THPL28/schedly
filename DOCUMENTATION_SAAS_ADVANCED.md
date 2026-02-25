# Documentação Técnica: Schedlyfy SaaS Advanced Features

Esta documentação detalha a implementação do Portal do Cliente, Analytics Avançado de Cancelamento, Gestão de Clientes e Sistema de Relatórios.

## 1. Modelagem de Banco de Dados (SQL/Prisma)

A modelagem foi expandida para suportar multi-tenancy e rastreabilidade total de cancelamentos e histórico de clientes.

### Modelos Adicionados/Atualizados:

```prisma
model Client {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  appointments Appointment[]
  notes        ClientNote[]
}

model ClientNote {
  id        String   @id @default(cuid())
  clientId  String
  userId    String   // Prestador
  content   String
  createdAt DateTime @default(now())
  
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AppointmentCancellation {
  id            String   @id @default(cuid())
  appointmentId String   @unique
  cancelledBy   String   // CLIENT, PROVIDER
  reasonType    String   // DESISTIU, REAGENDAMENTO, FINANCEIRO, OUTROS
  reasonText    String?
  createdAt     DateTime @default(now())

  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
}

model Appointment {
  // ... campos existentes
  clientId    String?
  status      String   @default("SCHEDULED") // SCHEDULED, CANCELED, COMPLETED
  attended    Boolean  @default(false)
  client      Client?  @relation(fields: [clientId], references: [id])
  cancellation AppointmentCancellation?
}
```

### Índices Recomendados para Escala:
Para suportar milhares de agendamentos:
- `CREATE INDEX idx_appointment_userId_date ON "Appointment"("userId", "date");`
- `CREATE INDEX idx_appointment_clientEmail ON "Appointment"("clientEmail");`
- `CREATE INDEX idx_cancellation_reasonType ON "AppointmentCancellation"("reasonType");`
- `CREATE INDEX idx_client_name_email ON "Client"("name", "email");`

---

## 2. Endpoints REST (API)

### Portal do Cliente (Autenticação Mágica)
- `POST /api/client/auth/magic-link`: Solicita link de acesso.
- `GET /api/client/auth/verify?token=...`: Valida token e inicia sessão (JWT 15min).
- `GET /api/client/appointments`: Lista agendamentos (Futuros e Histórico).
- `DELETE /api/client/appointments/[id]`: Cancela com motivo obrigatório.

### Dashboard do Prestador (Analytics)
- `GET /api/provider/analytics`: Retorna métricas de performance (Churn, Revenue, Attendance).
- `GET /api/provider/clients`: Gestão de clientes com busca e paginação.
- `GET /api/provider/reports?format=xlsx&startDate=...`: Exportação de dados.

---

## 3. Segurança e Multi-Tenancy

- **Isolamento de Dados**: Todas as queries de serviços (`AnalyticsService`, `ClientService`) incluem obrigatoriamente o `userId` (providerId) no filtro `where`.
- **Portal do Cliente**: O acesso é validado via JWT assinado com `JWT_SECRET`. O payload contém `clientId` e `providerId`, impedindo que um cliente veja dados de outro prestador.
- **Middleware**: Bloqueio de rotas `/portal/*` sem cookie de sessão válido.

---

## 4. Roadmap de Implementação Backend-to-Frontend

### Fase 1 (Concluída ✅)
- Modelagem de dados e Migrações SQL.
- Camada de Serviços (`Services`).
- Endpoints de API Core.

### Fase 2 (Próximos Passos)
- **UI Portal**: Tela de login (/portal/slug/login) e Dashboard do Cliente.
- **UI Dashboard**: Widgets de indicadores (Gráficos de Cancelamento).
- **UI Gestão de Clientes**: Tabela paginada com histórico detalhado.

### Fase 3
- **Processamento Assíncrono**: Mover geração de PDF/Excel para background jobs caso o volume de dados seja massivo.
- **Notificações**: Alertas automáticos para o prestador quando um cancelamento por motivo "Financeiro" ocorrer.
