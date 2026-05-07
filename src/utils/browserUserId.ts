const BROWSER_USER_ID_KEY = 'monomat-browser-user-id';

export function getOrCreateBrowserUserId(): string {
    const savedUserId = localStorage.getItem(BROWSER_USER_ID_KEY);

    if (savedUserId) {
        return savedUserId;
    }

    const newUserId = crypto.randomUUID();
    localStorage.setItem(BROWSER_USER_ID_KEY, newUserId);

    return newUserId;
}