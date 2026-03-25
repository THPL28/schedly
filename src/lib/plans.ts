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

export function getPlanLimit(subscription: any): PlanDetails {
    const status = subscription?.status;
    const priceIdOrName = subscription?.stripePriceId || subscription?.planId;

    let plan: PlanDetails = PLANS.FREE;

    if (status === 'TRIAL') {
        plan = { ...PLANS.FREE };
    } else if (priceIdOrName === process.env.STRIPE_PRICE_PRO || priceIdOrName === 'Pro' || priceIdOrName === 'PRO') {
        plan = { ...PLANS.PRO };
    } else if (priceIdOrName === process.env.STRIPE_PRICE_BASIC || priceIdOrName === 'Basic' || priceIdOrName === 'BASIC') {
        plan = { ...PLANS.BASIC };
    }

    // Apply Overrides if they exist
    if (subscription) {
        if (subscription.maxAppointmentsOverride !== null && subscription.maxAppointmentsOverride !== undefined) {
            plan.maxAppointmentsPerMonth = subscription.maxAppointmentsOverride;
        }
        if (subscription.emailRemindersOverride !== null && subscription.emailRemindersOverride !== undefined) {
            plan.emailReminders = subscription.emailRemindersOverride;
        }
        if (subscription.customBrandingOverride !== null && subscription.customBrandingOverride !== undefined) {
            plan.customBranding = subscription.customBrandingOverride;
        }
        if (subscription.multipleEventTypesOverride !== null && subscription.multipleEventTypesOverride !== undefined) {
            plan.multipleEventTypes = subscription.multipleEventTypesOverride;
        }
        if (subscription.bufferTimeOverride !== null && subscription.bufferTimeOverride !== undefined) {
            plan.bufferTime = subscription.bufferTimeOverride;
        }
    }

    return plan;
}
