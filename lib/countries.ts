import { all } from "country-codes-list";

/**
 * Country dial-code dataset for the contact form's phone field.
 * Sourced from `country-codes-list` (single calling code per country) rather
 * than hand-typing ~250 entries. ISO2 (`iso2`) is unique and used as the
 * dropdown value; several countries share a `dialCode` (e.g. +1).
 */
export interface Country {
  iso2: string;
  name: string;
  dialCode: string; // e.g. "+91"
  flag: string; // emoji
}

export const countries: Country[] = all()
  .filter((c) => c.countryCallingCode && c.flag)
  .map((c) => ({
    iso2: c.countryCode,
    name: c.countryNameEn,
    dialCode: `+${c.countryCallingCode}`,
    flag: c.flag,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Default to India (+91) — the business operates from India. */
export const defaultCountry: Country =
  countries.find((c) => c.iso2 === "IN") ?? countries[0];
