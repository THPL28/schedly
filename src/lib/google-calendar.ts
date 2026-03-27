import { getCalendarClient } from './google-auth';
import { prisma } from './prisma';

export async function createGoogleEvent(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      eventType: true,
    },
  });

  if (!appointment || !appointment.user.googleAccessToken || !appointment.user.googleCalendarEnabled) {
    return null;
  }

  // Set credentials for this user
  const tokens = {
    access_token: appointment.user.googleAccessToken,
    refresh_token: appointment.user.googleRefreshToken,
    expiry_date: appointment.user.googleTokenExpiry?.getTime(),
  };

  const calendar = getCalendarClient(tokens);

  const startDateTime = new Date(appointment.date);
  const [startH, startM] = appointment.startTime.split(':').map(Number);
  startDateTime.setUTCHours(startH, startM, 0, 0);

  const endDateTime = new Date(appointment.date);
  const [endH, endM] = appointment.endTime.split(':').map(Number);
  endDateTime.setUTCHours(endH, endM, 0, 0);

  const event: any = {
    summary: `${appointment.eventType?.name || 'Agendamento'} - ${appointment.clientName}`,
    description: `Agendamento via Schedly.\nCliente: ${appointment.clientName}\nE-mail: ${appointment.clientEmail}\nNotas: ${appointment.notes || ''}`,
    start: {
      dateTime: startDateTime.toISOString(),
    },
    end: {
      dateTime: endDateTime.toISOString(),
    },
    attendees: [
      { email: appointment.clientEmail },
    ],
  };

  // If it's a Google Meet event
  if (appointment.eventType?.locationType === 'GOOGLE_MEET') {
    event.conferenceData = {
      createRequest: {
        requestId: `schedly-${appointment.id}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  } else if (appointment.eventType?.locationAddress) {
    event.location = appointment.eventType.locationAddress;
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
    });

    const googleEventId = response.data.id;
    const googleMeetLink = response.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;

    // Save back to appointment
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        googleEventId,
        googleMeetLink,
      },
    });

    return { googleEventId, googleMeetLink };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return null;
  }
}
