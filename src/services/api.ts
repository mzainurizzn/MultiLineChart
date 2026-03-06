export async function apiGet<T>(path: string): Promise<T> {
  const base = import.meta.env.VITE_API_URL ?? "";
  const url = `${base}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const text = await res.text(); // baca dulu sebagai text
  let json: unknown;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // kalau bukan JSON, tampilkan sebagian agar ketahuan
    throw new Error(`Non-JSON response from ${url}: ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} from ${url}: ${JSON.stringify(json).slice(0, 200)}`
    );
  }

  // DEBUG
  console.log("apiGet", url, json);

  return json as T;
}
