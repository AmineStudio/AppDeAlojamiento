const envAdminEmails = import.meta.env.VITE_ADMIN_EMAILS
  ? (import.meta.env.VITE_ADMIN_EMAILS as string)
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean)
  : [];

export const ADMIN_EMAILS: string[] = envAdminEmails.length > 0
  ? envAdminEmails
  : ['mila@milanomad.es'];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
