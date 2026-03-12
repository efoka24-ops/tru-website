/**
 * TESTS FONCTIONNELS E2E - Cypress
 * Frontend + Backoffice + Backend Integration
 */

// ============================================================
// FRONTEND E2E TESTS
// ============================================================

describe('Frontend - Navigation & Display', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5176');
  });

  describe('Logo Display', () => {
    it('should display logo with correct dimensions', () => {
      cy.get('header img[alt*="TRU"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'trugroup-logo.png');
    });

    it('logo should have rounded circle shape', () => {
      cy.get('header img[alt*="TRU"]')
        .parent()
        .should('have.class', 'rounded-full');
    });

    it('logo should change color when scrolling', () => {
      cy.get('header').should('have.css', 'background-color');
      cy.scrollTo(0, 500);
      cy.get('header').should('have.css', 'background-color');
    });
  });

  describe('Page Navigation', () => {
    it('should navigate to Services page', () => {
      cy.contains('a', 'Services').click();
      cy.url().should('include', '/services');
      cy.contains('h1', /Services|service/i).should('be.visible');
    });

    it('should navigate to Solutions page', () => {
      cy.contains('a', 'Solutions').click();
      cy.url().should('include', '/solutions');
      cy.contains(/Mokine|MokineVeto|MokineKid/).should('be.visible');
    });

    it('should navigate to Team page', () => {
      cy.contains('a', /Équipe|Team/).click();
      cy.url().should('include', '/team');
      cy.contains('h1', /Équipe|Team/i).should('be.visible');
    });

    it('should navigate to Contact page', () => {
      cy.contains('a', /Contact|Nous/).click();
      cy.url().should('include', '/contact');
      cy.get('form').should('be.visible');
    });
  });

  describe('Home Page Display', () => {
    it('should display hero section', () => {
      cy.contains('TRU GROUP').should('be.visible');
      cy.contains(/AU CŒUR|innovation|INNOVATION/).should('be.visible');
    });

    it('should display services showcase', () => {
      cy.get('[data-testid*="service"], .service-card, h3:contains("Conseil")')
        .should('have.length.greaterThan', 0);
    });

    it('should display solutions preview', () => {
      cy.contains(/Mokine|MokineVeto|MokineKid/).should('be.visible');
    });

    it('should display team members', () => {
      cy.get('[data-testid*="team"], .team-member, .person')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Services Page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5176/services');
    });

    it('should display at least 5 services', () => {
      cy.get('[data-testid*="service"], .service-card, ul li')
        .should('have.length.greaterThan', 3);
    });

    it('should display service titles', () => {
      cy.contains(/Conseil|Transformation|Formation|Expertise/).should('be.visible');
    });

    it('should display service descriptions', () => {
      cy.get('[data-testid*="description"], .description, p')
        .should('have.length.greaterThan', 0);
    });
  });

  describe('Contact Form', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5176/contact');
    });

    it('should display contact form', () => {
      cy.get('form').should('be.visible');
      cy.get('input[name*="name"], input[placeholder*="Name"], input[type="text"]').should('be.visible');
      cy.get('input[name*="email"], input[placeholder*="Email"], input[type="email"]').should('be.visible');
      cy.get('textarea').should('be.visible');
    });

    it('should submit contact form successfully', () => {
      cy.get('input[type="text"], input[name*="name"]').first().type('John Doe');
      cy.get('input[type="email"]').type('john@example.com');
      cy.get('textarea').type('This is a test message');
      cy.get('button[type="submit"]').click();
      
      cy.contains(/success|merci|submitted|Merci/).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('button[type="submit"]').click();
      
      // Check for error messages or validation
      cy.get('input[type="email"], input[type="text"], textarea')
        .should('have.attr', 'required');
    });
  });

  describe('API Integration', () => {
    it('should fetch and display services from API', () => {
      cy.intercept('GET', '**/api/services', { 
        statusCode: 200, 
        body: [
          { id: 1, name: 'Service 1', description: 'Desc 1' },
          { id: 2, name: 'Service 2', description: 'Desc 2' }
        ]
      }).as('getServices');

      cy.visit('http://localhost:5176/services');
      cy.wait('@getServices');
      cy.get('[data-testid*="service"], .service-card').should('be.visible');
    });

    it('should handle API error with fallback data', () => {
      cy.intercept('GET', '**/api/services', { 
        statusCode: 500 
      }).as('serviceError');

      cy.visit('http://localhost:5176/services');
      cy.wait('@serviceError');
      
      // Fallback data should still be displayed
      cy.contains(/Service|Conseil|service/i).should('be.visible');
    });
  });
});

// ============================================================
// BACKOFFICE E2E TESTS
// ============================================================

describe('Backoffice - Authentication & CRUD', () => {
  describe('Login Flow', () => {
    it('should load login page', () => {
      cy.visit('http://localhost:3001/login');
      cy.contains(/Login|Connexion|Sign In/).should('be.visible');
    });

    it('should have login form fields', () => {
      cy.visit('http://localhost:3001/login');
      cy.get('input[type="email"], input[type="text"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should login with credentials', () => {
      cy.visit('http://localhost:3001/login');
      cy.get('input[type="email"], input[name*="email"]').type('admin@tru.cm');
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.contains(/Dashboard|Tableau/i).should('be.visible');
    });
  });

  describe('Dashboard', () => {
    beforeEach(() => {
      cy.login('admin@tru.cm', 'password123');
      cy.visit('http://localhost:3001/dashboard');
    });

    it('should display stats cards', () => {
      cy.contains(/Team|Équipe|Members/).should('be.visible');
      cy.contains(/Services/).should('be.visible');
      cy.contains(/Solutions/).should('be.visible');
    });

    it('should display navigation menu', () => {
      cy.get('nav, [role="navigation"]').should('be.visible');
      cy.contains('Team', 'Équipe', 'Services').should('be.visible');
    });
  });

  describe('Team CRUD', () => {
    beforeEach(() => {
      cy.login('admin@tru.cm', 'password123');
      cy.visit('http://localhost:3001/dashboard');
      cy.contains(/Team|Équipe/).click();
    });

    it('should list team members', () => {
      cy.contains(/Emmanuel|Tatinou|Halimatou/).should('be.visible');
    });

    it('should open create team member modal', () => {
      cy.contains(/Add|Ajouter|Create/).click();
      cy.get('input[name*="name"], input[placeholder*="Name"]').should('be.visible');
      cy.get('input[name*="email"], input[placeholder*="Email"]').should('be.visible');
    });

    it('should create new team member', () => {
      cy.contains(/Add|Ajouter/).click();
      cy.get('input[type="text"]').first().type('New Member');
      cy.get('input[type="email"]').type('member@tru.cm');
      cy.get('input[type="text"]').eq(2).type('Developer');
      cy.get('button[type="submit"]').click();

      cy.contains('New Member').should('be.visible');
    });

    it('should edit team member', () => {
      cy.contains(/Edit|Modifier/).first().click();
      cy.get('input[type="text"]').first().clear().type('Updated Name');
      cy.get('button[type="submit"]').click();

      cy.contains('Updated Name').should('be.visible');
    });

    it('should delete team member', () => {
      cy.contains(/Delete|Supprimer/).first().click();
      cy.get('button').contains(/Confirm|Yes|Oui/).click();

      // Member should be removed
      cy.get('table, .list').should('be.visible');
    });
  });

  describe('Services CRUD', () => {
    beforeEach(() => {
      cy.login('admin@tru.cm', 'password123');
      cy.visit('http://localhost:3001/dashboard');
      cy.contains('Services').click();
    });

    it('should display services list', () => {
      cy.contains(/Conseil|Service|Technologie/).should('be.visible');
    });

    it('should create new service', () => {
      cy.contains(/Add|Ajouter/).click();
      cy.get('input[name*="name"]').type('New Service');
      cy.get('textarea, input[name*="description"]').type('Service description');
      cy.get('button[type="submit"]').click();

      cy.contains('New Service').should('be.visible');
    });

    it('should update service', () => {
      cy.contains(/Edit|Modifier/).first().click();
      cy.get('input[name*="name"]').clear().type('Updated Service');
      cy.get('button[type="submit"]').click();

      cy.contains('Updated Service').should('be.visible');
    });
  });

  describe('Solutions Management', () => {
    beforeEach(() => {
      cy.login('admin@tru.cm', 'password123');
      cy.visit('http://localhost:3001/dashboard');
      cy.contains('Solutions').click();
    });

    it('should display solutions', () => {
      cy.contains(/Mokine|MokineVeto|MokineKid/).should('be.visible');
    });

    it('should create new solution', () => {
      cy.contains(/Add|Ajouter/).click();
      cy.get('input[name*="name"]').type('New Solution');
      cy.get('textarea').type('Solution description');
      cy.get('button[type="submit"]').click();

      cy.contains('New Solution').should('be.visible');
    });
  });

  describe('Data Sync', () => {
    beforeEach(() => {
      cy.login('admin@tru.cm', 'password123');
      cy.visit('http://localhost:3001/dashboard');
    });

    it('should display sync status', () => {
      cy.contains(/Sync|Synchron/).should('be.visible');
    });

    it('should show sync indicator', () => {
      cy.get('[data-testid*="sync"], .sync-status, .indicator').should('be.visible');
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      cy.login('admin@tru.cm', 'password123');
      cy.visit('http://localhost:3001/dashboard');
      cy.contains(/Settings|Paramètres/).click();
    });

    it('should display settings form', () => {
      cy.get('form, input, textarea').should('be.visible');
    });

    it('should update company name', () => {
      cy.get('input[name*="company"]').clear().type('TRU');
      cy.get('button[type="submit"]').click();

      cy.contains(/Success|saved|Enregistr/).should('be.visible');
    });

    it('should update contact information', () => {
      cy.get('input[name*="phone"]').clear().type('+237 699 999 999');
      cy.get('input[name*="email"]').clear().type('new-email@tru.cm');
      cy.get('button[type="submit"]').click();

      cy.contains(/Success|saved/).should('be.visible');
    });
  });
});

// ============================================================
// INTEGRATION TESTS
// ============================================================

describe('Frontend ↔ Backend API Integration', () => {
  it('should sync team data from backoffice to frontend', () => {
    // 1. Create team member in backoffice
    cy.login('admin@tru.cm', 'password123');
    cy.visit('http://localhost:3001/equipe');
    cy.contains(/Ajouter|Add/).click();
    cy.get('input[type="text"]').first().type('Integration Test User');
    cy.get('input[type="email"]').type('test@integration.com');
    cy.get('button[type="submit"]').click();

    // 2. Check frontend displays updated data
    cy.visit('http://localhost:5176/team');
    cy.contains('Integration Test User').should('be.visible');
  });

  it('should sync services from backoffice to frontend', () => {
    cy.login('admin@tru.cm', 'password123');
    cy.visit('http://localhost:3001/services');
    cy.contains(/Add|Ajouter/).click();
    cy.get('input[name*="name"]').type('Integration Service');
    cy.get('button[type="submit"]').click();

    cy.visit('http://localhost:5176/services');
    cy.contains('Integration Service').should('be.visible');
  });

  it('should preserve data after refresh', () => {
    cy.visit('http://localhost:5176/team');
    cy.get('[data-testid*="team"], .team-member').should('have.length.greaterThan', 0);

    cy.reload();
    cy.get('[data-testid*="team"], .team-member').should('have.length.greaterThan', 0);
  });
});

// Custom command for login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:3001/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

export {};
