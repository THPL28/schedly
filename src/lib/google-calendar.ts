import { createOAuth2Client } from './google-auth';
import { prisma } from './prisma';
import { google } from 'googleapis';

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

  // Set credentials for this user using OAuth2 client so we can refresh if needed
  const oauth2Client = createOAuth2Client();
  const tokens = {
    access_token: appointment.user.googleAccessToken || undefined,
    refresh_token: appointment.user.googleRefreshToken || undefined,
    expiry_date: appointment.user.googleTokenExpiry?.getTime() || undefined,
  } as any

  oauth2Client.setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

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
    // If unauthorized, try to refresh the access token (if we have a refresh token)
    const errAny = error as any
    console.error('Error creating Google Calendar event:', errAny?.response?.data || errAny?.message || errAny)

    const status = errAny?.response?.status
    if (status === 401 && appointment.user.googleRefreshToken) {
      try {
        const refreshRes = await oauth2Client.refreshToken(appointment.user.googleRefreshToken as string)
        const refreshed = refreshRes?.credentials || refreshRes as any

        const newAccessToken = refreshed.access_token
        const newRefreshToken = refreshed.refresh_token || appointment.user.googleRefreshToken
        const newExpiry = refreshed.expiry_date ? Number(refreshed.expiry_date) : undefined

        // persist new tokens
        await prisma.user.update({
          where: { id: appointment.userId },
          data: {
            googleAccessToken: newAccessToken,
            googleRefreshToken: newRefreshToken,
            googleTokenExpiry: newExpiry ? new Date(newExpiry) : null,
          },
        })

        // retry with refreshed credentials
        oauth2Client.setCredentials({ access_token: newAccessToken, refresh_token: newRefreshToken, expiry_date: newExpiry })
        const retryCal = google.calendar({ version: 'v3', auth: oauth2Client })
        const retryResp = await retryCal.events.insert({ calendarId: 'primary', requestBody: event, conferenceDataVersion: 1 })

        const googleEventId = retryResp.data.id
        const googleMeetLink = retryResp.data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri

        await prisma.appointment.update({ where: { id: appointmentId }, data: { googleEventId, googleMeetLink } })
        return { googleEventId, googleMeetLink }
      } catch (refreshError) {
        console.error('Error refreshing Google token or retrying event insert:', (refreshError as any)?.response?.data || (refreshError as any)?.message || refreshError)
        // mark user as needing reauth? (optional flow)
        return null
      }
    }

    return null;
  }
}
