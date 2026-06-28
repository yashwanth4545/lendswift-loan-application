import { defineConfig } from 'cypress';

/** Cypress config for paced demo video recording (single spec, video enabled). */
export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? 'http://127.0.0.1:4173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/demo-recording.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 20000,
    requestTimeout: 20000,
    retries: { runMode: 0, openMode: 0 },
  },
});
