import { prisma } from './prisma';
import { addMinutes, format, parse, startOfDay, endOfDay, isBefore, isAfter, addHours, differenceInMinutes, addDays } from 'date-fns';

export interface TimeSlot {
    start: string; // HH:mm
    end: string;   // HH:mm
}

export async function getAvailableSlots(
    userId: string,
    date: Date,
    duration: number,
    buffer: number = 0
): Promise<TimeSlot[]> {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');

    // 1. Get user configuration (lead time, future limit)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { minLeadTime: true, maxFutureDays: true }
    });
    const minLeadTime = user?.minLeadTime ?? 2;
    const maxFutureDays = user?.maxFutureDays ?? 30;

    // Check against Max Future Days
    const maxDate = addDays(startOfDay(new Date()), maxFutureDays);
    if (isAfter(startOfDay(date), maxDate)) {
        return [];
    }

    // 2. Get weekly availability for this day
    const availability = await prisma.availability.findMany({
        where: { userId, dayOfWeek }
    });

    // 3. Get specifically disabled/override for this date
    const override = await prisma.availabilityOverride.findFirst({
        where: {
            userId,
            date: {
                gte: startOfDay(date),
                lte: endOfDay(date)
            }
        }
    });

    // If override exists and startTime is null, it's a day off
    if (override && override.startTime === null) {
        return [];
    }

    // Use override if exists, otherwise weekly availability
    const slots_base = override && override.startTime && override.endTime
        ? [{ startTime: override.startTime, endTime: override.endTime }]
        : availability;

    if (slots_base.length === 0) return [];

    // 4. Get existing appointments for this day
    const appointments = await prisma.appointment.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay(date),
                lte: endOfDay(date)
            },
            status: 'SCHEDULED'
        },
        include: {
            eventType: true
        }
    });

    const availableSlots: TimeSlot[] = [];
    const now = new Date();
    const minTimePrefix = addHours(now, minLeadTime);

    for (const range of slots_base) {
        let current = parse(range.startTime, 'HH:mm', date);
        const end = parse(range.endTime, 'HH:mm', date);

        while (addMinutes(current, duration) <= end) {
            const slotStart = current;
            const slotEnd = addMinutes(current, duration);
            const slotStartStr = format(slotStart, 'HH:mm');
            const slotEndStr = format(slotEnd, 'HH:mm');

            // Check against Lead Time
            if (isBefore(slotStart, minTimePrefix)) {
                current = addMinutes(current, 15); // Check next 15min block
                continue;
            }

            // Check against existing appointments + buffer
            const isBlocked = appointments.some(appt => {
                const apptStart = parse(appt.startTime, 'HH:mm', date);
                const apptEnd = parse(appt.endTime, 'HH:mm', date);
                const apptBuffer = appt.eventType?.bufferTime ?? 0;

                // Current request buffer + appt buffer
                const totalBuffer = buffer + apptBuffer;

                // Slot overlaps with appointment (including buffers)
                const blockStart = addMinutes(apptStart, -buffer);
                const blockEnd = addMinutes(apptEnd, buffer);

                return (
                    (isBefore(slotStart, blockEnd) && isAfter(slotEnd, blockStart))
                );
            });

            if (!isBlocked) {
                availableSlots.push({ start: slotStartStr, end: slotEndStr });
                // After finding a valid slot, jump by duration + buffer? 
                // Calendly usually shows slots in fixed intervals (e.g. every 15m or 30m)
                // Let's use 15m intervals for better density
            }

            current = addMinutes(current, 15);
        }
    }

    return availableSlots;
}
