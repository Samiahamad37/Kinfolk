/**
 * pg v8 treats sslmode=require as verify-full and warns about a future
 * semantic change. Add uselibpqcompat so require keeps libpq meaning.
 */
export function normalizeDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if (
      sslmode &&
      ["prefer", "require", "verify-ca"].includes(sslmode) &&
      !parsed.searchParams.has("uselibpqcompat")
    ) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
