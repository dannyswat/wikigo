export async function getErrorMessage(r: Response): Promise<string> {
    const data = await r.json();
    return data.message || data.Message || data.error || (typeof data === 'string' ? data : r.statusText);
}