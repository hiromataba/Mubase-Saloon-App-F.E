import { MB_PHONE_COUNTRIES_DATA } from './phone-countries.data';

export type MbPhoneCountry = {
  iso2: string;
  dial: string;
  name: string;
};

/** Flag from ISO 3166-1 alpha-2 (Unicode regional indicators). */
export function mbFlagEmoji(iso2: string): string {
  const u = iso2.toUpperCase();
  if (u.length !== 2 || /[^A-Z]/.test(u)) {
    return '🏳️';
  }
  const base = 0x1f1e6;
  return String.fromCodePoint(base + u.charCodeAt(0) - 65, base + u.charCodeAt(1) - 65);
}

/** World list for the picker; shared calling codes (+1, +7, …) appear once per territory. */
export const MB_PHONE_COUNTRIES: MbPhoneCountry[] = MB_PHONE_COUNTRIES_DATA.map((c) => ({ ...c }));

/** Longest dial code first — used to parse stored values into country + national digits. */
export const MB_PHONE_COUNTRIES_PARSE_ORDER: MbPhoneCountry[] = [...MB_PHONE_COUNTRIES].sort(
  (a, b) => b.dial.replace(/\D/g, '').length - a.dial.replace(/\D/g, '').length,
);

export const MB_DEFAULT_PHONE_ISO2 = 'CD';

export function mbParseStoredPhone(
  raw: string | null | undefined,
): { country: MbPhoneCountry; nationalDigits: string } {
  const empty = MB_PHONE_COUNTRIES.find((c) => c.iso2 === MB_DEFAULT_PHONE_ISO2) ?? MB_PHONE_COUNTRIES[0];
  if (!raw?.trim()) {
    return { country: empty, nationalDigits: '' };
  }
  let digits = raw.replace(/\D/g, '');
  if (!digits.length) {
    return { country: empty, nationalDigits: '' };
  }
  for (const c of MB_PHONE_COUNTRIES_PARSE_ORDER) {
    const d = c.dial.replace(/\D/g, '');
    if (digits.startsWith(d)) {
      return { country: c, nationalDigits: digits.slice(d.length).slice(0, 15) };
    }
  }
  return { country: empty, nationalDigits: digits.slice(0, 15) };
}

export function mbFormatStoredPhone(dial: string, nationalDigits: string): string {
  const n = nationalDigits.replace(/\D/g, '').slice(0, 15);
  if (!n.length) {
    return '';
  }
  return `${dial} ${n}`;
}
