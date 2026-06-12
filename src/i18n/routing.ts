import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt-BR', 'en-GB', 'es-ES'],
  defaultLocale: 'pt-BR',
  localePrefix: 'as-needed',
});
