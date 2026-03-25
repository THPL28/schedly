export function generateGoogleCalendarLink(params: {
    title: string;
    details: string;
    location: string;
    date: string; // ISO format
    startTime: string; // HH:mm
    duration: number; // in minutes
}) {
    const start = new Date(`${params.date}T${params.startTime}:00`);
    const end = new Date(start.getTime() + params.duration * 60000);

    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const dates = `${formatDate(start)}/${formatDate(end)}`;
    
    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', params.title);
    url.searchParams.append('details', params.details);
    url.searchParams.append('location', params.location);
    url.searchParams.append('dates', dates);

    return url.toString();
}
