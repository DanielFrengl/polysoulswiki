// Slug helpers — kebab-case normalization and validation.

/**
 * Normalize arbitrary input into a URL-safe kebab-case slug:
 * lower-cased, diacritics stripped, punctuation removed, spaces/underscores
 * collapsed to single hyphens, leading/trailing hyphens trimmed.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD") // split accented chars into base + combining marks
    .replace(/[̀-ͯ]/g, "") // strip diacritic marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // drop anything that isn't alnum/space/hyphen
    .replace(/[\s_]+/g, "-") // whitespace & underscores -> hyphen
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/** True when `s` is already a valid, non-empty kebab-case slug. */
export function isValidSlug(s: string): boolean {
  return s.length > 0 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}
