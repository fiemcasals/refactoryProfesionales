/** Hora actual como HH:MM, igual que en app.js. */
export function currentTime(date = new Date()): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
