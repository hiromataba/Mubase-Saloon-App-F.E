/**
 * Manual WhatsApp flow for accountants (opens prefilled message; user sends in WhatsApp app).
 * Aligns with future “notification service” replacing wa.me links.
 */
export function buildReceiptThankYouMessage(input: {
  customerName: string;
  branchName: string;
  serviceName: string;
}): string {
  const name = input.customerName.trim() || 'there';
  return `Hello ${name}, thank you for visiting ${input.branchName}. Your payment for ${input.serviceName} has been received successfully. We appreciate your visit.`;
}

/** Opens WhatsApp: with phone if digits present, otherwise generic share link with text only. */
export function openWhatsAppPrefilled(phone: string | null | undefined, message: string): void {
  const text = encodeURIComponent(message);
  const digits = (phone ?? '').replace(/\D/g, '');
  const url =
    digits.length >= 10
      ? `https://wa.me/${digits}?text=${text}`
      : `https://wa.me/?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
