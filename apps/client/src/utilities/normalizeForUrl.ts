export function normalizeForUrl(input: string): string {
    return input
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^a-z0-9-]/g, '') // Remove any non-alphanumeric characters except -
        .replace(/-+/g, '-') // Replace multiple - with a single -
        .replace(/^-|-$/g, ''); // Remove leading or trailing -
}
