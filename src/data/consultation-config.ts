// Address consultation request emails land in. The /api/consultation
// serverless function reads this one constant, so updating it here is
// enough — no other file needs to change. Note: while the Resend sender is
// the shared onboarding@resend.dev address (see api/consultation.ts),
// Resend only delivers to the email the Resend account was created with.
export const CONSULTATION_EMAIL = 'tirth.m.7633@gmail.com'
