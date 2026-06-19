import { format } from 'date-fns';

/**
 * Get the Date object corresponding to Indochina Time (ICT, UTC+7)
 * Ensures consistency between the Server (typically UTC) and Client.
 * 
 * MODIFICATION: Uses calculation based on offset instead of toLocaleString 
 * to avoid "Invalid Date" errors on certain Node.js environments.
 */
export function getVietnamTime(date: Date = new Date()): Date {
    // 1. Check if input is valid
    if (!date || isNaN(date.getTime())) {
        return new Date(); // Fallback to current time if input is invalid
    }

    try {
        // UTC time = local time + localized offset
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        // Vietnam is always UTC+7
        const vnTime = new Date(utc + (3600000 * 7));
        
        // Check final results
        if (isNaN(vnTime.getTime())) return new Date();
        
        return vnTime;
    } catch (e) {
        console.error('[DateUtils] getVietnamTime error:', e);
        return new Date(); 
    }
}

/**
 * Returns YYYY-MM-DD date string in ICT timezone (UTC+7)
 */
export function getVietnamDateString(date: Date = new Date()): string {
    return format(getVietnamTime(date), 'yyyy-MM-dd');
}

/**
 * Returns the start and end of the month in ICT timezone (UTC+7)
 */
export function getVietnamMonthRange(monthsOffset: number = 0) {
    const vnNow = getVietnamTime();
    const target = new Date(vnNow.getFullYear(), vnNow.getMonth() + monthsOffset, 1);
    const vnTarget = getVietnamTime(target);

    const year = vnTarget.getFullYear();
    const month = vnTarget.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd')
    };
}
