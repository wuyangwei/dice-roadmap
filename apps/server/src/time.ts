export function nowIsoSeconds(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function createDefaultGameName(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
