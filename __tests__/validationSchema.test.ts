import { onboardingSchema } from '../lib/validationSchema';

describe('Onboarding Schema Validation', () => {
  const validData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    companyName: 'Tech Corp',
    services: ['UI/UX', 'Web Dev'],
    budgetUsd: 50000,
    projectStartDate: '2025-12-01',
    acceptTerms: true,
  };

  test('validates correct data', () => {
    const result = onboardingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('rejects invalid email', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      email: 'invalid-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email']);
      expect(result.error.issues[0].message).toContain('valid email');
    }
  });

  test('rejects short full name', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      fullName: 'A',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['fullName']);
    }
  });

  test('rejects invalid characters in full name', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      fullName: 'John123 Doe',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('letters, spaces, apostrophes');
    }
  });

  test('requires at least one service', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      services: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['services']);
      expect(result.error.issues[0].message).toContain('at least one service');
    }
  });

  test('validates budget range - too low', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      budgetUsd: 50,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least $100');
    }
  });

  test('validates budget range - too high', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      budgetUsd: 2000000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('cannot exceed $1,000,000');
    }
  });

  test('allows valid budget', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      budgetUsd: 150000,
    });
    expect(result.success).toBe(true);
  });

  test('requires future date', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      projectStartDate: '2020-01-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('today or later');
    }
  });

  test('allows today as project start date', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = onboardingSchema.safeParse({
      ...validData,
      projectStartDate: today,
    });
    expect(result.success).toBe(true);
  });

  test('requires accepting terms', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['acceptTerms']);
      expect(result.error.issues[0].message).toContain('accept the terms');
    }
  });

  test('allows empty budget (optional field)', () => {
    const { budgetUsd, ...dataWithoutBudget } = validData;
    const result = onboardingSchema.safeParse(dataWithoutBudget);
    expect(result.success).toBe(true);
  });
});