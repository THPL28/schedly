# Schedly Médico — MVP

## Product direction

The Schedly core remains profession-agnostic. The medical vertical adds patient and clinical-history workflows without turning the appointment itself into a medical record.

### Core distinction

- `Appointment`: scheduling, time, service, status and attendance.
- `ClinicalEncounter`: what happened during the consultation.
- `PatientMedicalProfile`: stable clinical information associated with the patient.
- `ClinicalAuditLog`: traceability of access-changing clinical operations.

## MVP included

1. Professional vertical: `GENERAL` or `MEDICAL`.
2. Medical workspace activation.
3. Patient profile based on the existing tenant-scoped `Client` entity.
4. Basic medical profile: birth date, sex, allergies, current medications, relevant conditions and emergency contact.
5. Clinical encounter form: chief complaint, anamnesis, physical exam, assessment, conduct and observations.
6. Optional link between an encounter and an appointment.
7. Patient timeline with appointments and clinical encounters.
8. Tenant isolation through `userId` on every clinical query.
9. Audit event when a clinical encounter is created.

## Explicitly out of MVP

Prescriptions, medical certificates, digital signatures, telemedicine, insurance/TISS, RNDS integration, laboratory integrations, AI diagnosis, shared records and patient access to clinical notes.

## Product language

Until regulatory and certification requirements are validated for the intended commercial scope, use terms such as **Histórico clínico** and **Registro de atendimento** in the product instead of claiming that the MVP is a certified electronic medical record system.

## Next engineering steps

1. Sync the Prisma schema with the clinical tables and regenerate the Prisma Client.
2. Add role-based clinical permissions for teams and assistants.
3. Add an immutable/revisioned record strategy before allowing clinical records to be edited after finalization.
4. Expand the audit trail to capture user, timestamp, action, patient and accessed functionality without storing clinical content in audit metadata.
5. Add encryption/secrets management and operational controls appropriate to health data.
6. Add automated tests for tenant isolation and unauthorized patient access.
7. Review retention, export, correction and deletion workflows with qualified legal/healthcare compliance specialists.
8. Only then evaluate a certified S-RES path if the product scope requires it.
