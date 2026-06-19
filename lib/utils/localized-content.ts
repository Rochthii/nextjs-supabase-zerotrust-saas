
export function getLocalizedContent(
    data: any,
    locale: string,
    field: string
): string {
    if (!data) return '';

    // 1. Try exact locale match (e.g., title_km)
    const localizedKey = `${field}_${locale}`;
    if (data[localizedKey] && data[localizedKey].trim() !== '') {
        return data[localizedKey];
    }

    // 2. Fallback to English if not 'vi' (e.g., title_en)
    if (locale !== 'vi') {
        const enKey = `${field}_en`;
        if (data[enKey] && data[enKey].trim() !== '') {
            return data[enKey];
        }
    }

    // 3. Fallback to Vietnamese (default)
    const defaultKey = `${field}_vi`;
    if (data[defaultKey]) {
        return data[defaultKey];
    }

    return '';
}
