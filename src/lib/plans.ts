export type PlanType = 'FREE' | 'BASIC' | 'PRO';

export interface PlanDetails {
    name: string;
    maxAppointmentsPerMonth: number;
    emailReminders: boolean;
    customBranding: boolean;
    multipleEventTypes: boolean;
    bufferTime: boolean;
}

export const PLANS: Record<PlanType, PlanDetails> = {
    FREE: {
        name: 'Trial',
        maxAppointmentsPerMonth: 5,
        emailReminders: false,
        customBranding: false,
        multipleEventTypes: false,
        bufferTime: false,
    },
    BASIC: {
        name: 'Basic',
        maxAppointmentsPerMonth: 100,
        emailReminders: false,
        customBranding: false,
        multipleEventTypes: true,
        bufferTime: true,
    },
    PRO: {
        name: 'Pro',
        maxAppointmentsPerMonth: Infinity,
        emailReminders: true,
        customBranding: true,
        multipleEventTypes: true,
        bufferTime: true,
    }
};

export function getPlanLimit(status: string | null | undefined, planName: string | null | undefined): PlanDetails {
    if (status === 'TRIAL') return PLANS.FREE;
    if (planName === 'Pro') return PLANS.PRO;
    if (planName === 'Basic') return PLANS.BASIC;
    return PLANS.FREE;
}
