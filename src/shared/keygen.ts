/**
 * Generate a cryptographically-secure random alphanumeric string.
 *
 * @param length – how many characters long the key should be (default: 24)
 * @returns a string containing only AlphaNumeric characters
 */
export function generateApiKey(length = 24): string {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "abcdefghijklmnopqrstuvwxyz" +
        "0123456789";
    const buffer = new Uint8Array(length);
    crypto.getRandomValues(buffer);
    return Array.from(buffer)
        .map((n) => chars[n % chars.length])
        .join("");
}

/**
 * Generate a User ID
 *
 * @returns a UUID
 */
export function generateUserId(): string {
    return crypto.randomUUID();
}
