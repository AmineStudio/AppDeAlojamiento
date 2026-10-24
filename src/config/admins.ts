const defaultAdminEmails = [
  'mila@milanomad.es',
  'milalotiairbnb@gmail.com',
  'amine.saidani.101@gmail.com',
];

const envAdminEmails = import.meta.env.VITE_ADMIN_EMAILS
  ? (import.meta.env.VITE_ADMIN_EMAILS as string)
      .split(',')
      .map((email: string) => email.trim().toLowerCase())
      .filter(Boolean)
  : [];

export const ADMIN_EMAILS: string[] = Array.from(
  new Set([...defaultAdminEmails, ...envAdminEmails])
);

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
