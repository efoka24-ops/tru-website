/**
 * Configuration Cypress
 * Pour les tests E2E du projet
 */

module.exports = {
  e2e: {
    // Base URL
    baseUrl: 'http://localhost:5176',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/support.js',

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Screenshots & Videos
    screenshotOnRunFailure: true,
    screenshotsFolder: 'test-results/cypress/screenshots',
    videosFolder: 'test-results/cypress/videos',
    video: true,
    videoCompression: 32,

    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,

    // Retries
    retries: {
      runMode: 2,
      openMode: 0
    },

    // Reporting
    reporter: 'junit',
    reporterOptions: {
      mochaFile: 'test-results/cypress/junit.xml',
      toConsole: true
    },

    // Environment variables
    env: {
      BACKEND_URL: 'http://localhost:5000',
      BACKOFFICE_URL: 'http://localhost:3001',
      FRONTEND_URL: 'http://localhost:5176'
    },

    // Disable uncaught exceptions
    uncaught: true,
    failOnStatusCode: false
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    },
    specPattern: 'tests/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/component/support/support.js'
  }
};
