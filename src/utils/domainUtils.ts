/**
 * Helper utilities for domain, email, and slug extraction.
 */

/**
 * Extract domain from an email address.
 * E.g., 'admin@acme.com' => 'acme.com'
 */
export const extractDomainFromEmail = (email: string | undefined | null): string => {
  if (!email) return '';
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase().trim() : '';
};

/**
 * Extract subdomain from a hostname string.
 * E.g., 'acme.mittarv.com' => 'acme'
 */
export const extractSubdomainFromHost = (host: string | undefined | null): string => {
  if (!host) return '';
  const cleanHost = host.split(':')[0];
  const parts = cleanHost.split('.');
  return parts.length >= 3 ? parts[0] : '';
};

/**
 * Format slug domain URL for display.
 * E.g., 'acme-12345' => 'http://acme-12345'
 */
export const formatSlugDomainUrl = (slugDomain: string | undefined | null): string => {
  if (!slugDomain) return '';
  if (slugDomain.startsWith('http://') || slugDomain.startsWith('https://')) {
    return slugDomain;
  }
  return `http://${slugDomain}`;
};
