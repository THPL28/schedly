import { google } from 'googleapis';

// Create client lazily inside functions so env vars are always read at runtime
function createOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

export function getAuthUrl() {
    const oauth2Client = createOAuth2Client();

    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
}

export async function getTokensFromCode(code: string) {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

export function getCalendarClient(tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }) {
    const auth = createOAuth2Client();
    auth.setCredentials(tokens);
    return google.calendar({ version: 'v3', auth });
}
