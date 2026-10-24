import { describe, it, expect } from 'vitest';
import { isAdminEmail, ADMIN_EMAILS } from './admins';

describe('admins configuration', () => {
  it('validates registered admin email in lowercase', () => {
    const admin = ADMIN_EMAILS[0];
    expect(isAdminEmail(admin)).toBe(true);
    expect(isAdminEmail(admin.toUpperCase())).toBe(true);
    expect(isAdminEmail(`  ${admin}  `)).toBe(true);
  });

  it('rejects non-admin emails', () => {
    expect(isAdminEmail('huesped_aleatorio@gmail.com')).toBe(false);
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail('')).toBe(false);
  });
});
