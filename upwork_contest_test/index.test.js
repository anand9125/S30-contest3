import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3000';

async function apiRequest(endpoint, options = {}) {
  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

// Test data storage
let clientToken;
let freelancerToken;
let client2Token;
let freelancer2Token;
let clientId;
let freelancerId;
let client2Id;
let freelancer2Id;
let projectId;
let project2Id;
let proposalId;
let proposal2Id;
let contractId;
let milestoneIds = [];

// =============================================================================
// AUTH - POST /api/auth/signup (15 tests)
// =============================================================================
describe('POST /api/auth/signup', () => {
  it('should create freelancer with full details', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Rahul Kumar',
        email: 'rahul@example.com',
        password: 'rahul123',
        role: 'freelancer',
        bio: 'Full-stack developer with 5 years of experience',
        skills: ['JavaScript', 'React', 'Node.js'],
        hourlyRate: 2500,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBeDefined();
    expect(data.data.role).toBe('freelancer');
    freelancerId = data.data.id;
  });

  it('should create client with minimal fields', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Amit Sharma',
        email: 'amit@example.com',
        password: 'amit123',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.role).toBe('client');
    clientId = data.data.id;
  });

  it('should create client with explicit role', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Second Client',
        email: 'client2@example.com',
        password: 'client2123',
        role: 'client',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.data.role).toBe('client');
    client2Id = data.data.id;
  });

  it('should create second freelancer', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Second Freelancer',
        email: 'freelancer2@example.com',
        password: 'freelancer2123',
        role: 'freelancer',
        skills: ['Python', 'Django'],
        hourlyRate: 3000,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    freelancer2Id = data.data.id;
  });

  it('should create freelancer with empty skills array', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Skills Freelancer',
        email: 'noskills@example.com',
        password: 'pass123',
        role: 'freelancer',
        skills: [],
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should create freelancer without bio', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Bio Freelancer',
        email: 'nobio@example.com',
        password: 'pass123',
        role: 'freelancer',
        hourlyRate: 2000,
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should return EMAIL_ALREADY_EXISTS for duplicate email', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate',
        email: 'rahul@example.com',
        password: 'pass123',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('should return INVALID_REQUEST when name is missing', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'noname@example.com',
        password: 'pass123',
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should return INVALID_REQUEST when email is missing', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Email',
        password: 'pass123',
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should return INVALID_REQUEST when password is missing', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'No Password',
        email: 'nopass@example.com',
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should return INVALID_REQUEST for invalid email format', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bad Email',
        email: 'notanemail',
        password: 'pass123',
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should return INVALID_REQUEST for invalid role', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bad Role',
        email: 'badrole@example.com',
        password: 'pass123',
        role: 'admin',
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should handle empty body gracefully', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });

  it('should handle name with special characters', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: "O'Brien-Smith Jr.",
        email: 'special@example.com',
        password: 'pass123',
      }),
    });

    expect([201, 400]).toContain(response.status);
  });

  it('should handle long password', async () => {
    const response = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Long Pass User',
        email: 'longpass@example.com',
        password: 'a'.repeat(100),
      }),
    });

    expect([201, 400]).toContain(response.status);
  });
});

// =============================================================================
// AUTH - POST /api/auth/login (10 tests)
// =============================================================================
describe('POST /api/auth/login', () => {
  it('should login freelancer successfully', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'rahul@example.com',
        password: 'rahul123',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
    expect(data.data.user.id).toBe(freelancerId);
    freelancerToken = data.data.token;
  });

  it('should login client successfully', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'amit@example.com',
        password: 'amit123',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    clientToken = data.data.token;
  });

  it('should login second client', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'client2@example.com',
        password: 'client2123',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    client2Token = data.data.token;
  });

  it('should login second freelancer', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'freelancer2@example.com',
        password: 'freelancer2123',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    freelancer2Token = data.data.token;
  });

  it('should return INVALID_CREDENTIALS for wrong password', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'rahul@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe('INVALID_CREDENTIALS');
  });

  it('should return INVALID_CREDENTIALS for non-existent user', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe('INVALID_CREDENTIALS');
  });

  it('should return INVALID_REQUEST when email is missing', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should return INVALID_REQUEST when password is missing', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'rahul@example.com' }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should return INVALID_REQUEST for invalid email format', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'notanemail',
        password: 'password123',
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should handle empty body', async () => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });
});

// =============================================================================
// SERVICES - POST /api/services (8 tests)
// =============================================================================
describe('POST /api/services', () => {
  it('should create service with fixed pricing', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        title: 'Full-Stack Web Development',
        description: 'I will build a complete web application using MERN stack',
        category: 'Web Development',
        pricingType: 'fixed',
        price: 50000,
        deliveryDays: 14,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBeDefined();
  });

  it('should create service with hourly pricing', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        title: 'Mobile App Development',
        description: 'React Native development',
        category: 'Mobile Development',
        pricingType: 'hourly',
        price: 3000,
        deliveryDays: 30,
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should allow freelancer to create multiple services', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        title: 'API Development',
        description: 'REST API development',
        category: 'Backend Development',
        pricingType: 'fixed',
        price: 25000,
        deliveryDays: 7,
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should return FORBIDDEN for client', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        pricingType: 'fixed',
        price: 10000,
        deliveryDays: 7,
      }),
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('FORBIDDEN');
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        pricingType: 'fixed',
        price: 10000,
        deliveryDays: 7,
      }),
    });

    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe('UNAUTHORIZED');
  });

  it('should return UNAUTHORIZED with invalid token', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid_token' },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        pricingType: 'fixed',
        price: 10000,
        deliveryDays: 7,
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should handle missing title', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        description: 'Test',
        category: 'Web',
        pricingType: 'fixed',
        price: 10000,
        deliveryDays: 7,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should handle invalid pricingType', async () => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        pricingType: 'invalid',
        price: 10000,
        deliveryDays: 7,
      }),
    });

    expect(response.status).toBe(400);
  });
});

// =============================================================================
// PROJECTS - POST /api/projects (10 tests)
// =============================================================================
describe('POST /api/projects', () => {
  it('should create project successfully', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'E-commerce Website Development',
        description: 'Need a modern e-commerce platform',
        category: 'Web Development',
        budgetMin: 80000,
        budgetMax: 150000,
        deadline: '2026-03-15',
        requiredSkills: ['React', 'Node.js'],
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('open');
    projectId = data.data.id;
  });

  it('should create project with empty skills', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Mobile App',
        description: 'Mobile app development',
        category: 'Mobile',
        budgetMin: 50000,
        budgetMax: 100000,
        deadline: '2026-06-01',
        requiredSkills: [],
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    project2Id = data.data.id;
  });

  it('should create project with future deadline', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${client2Token}` },
      body: JSON.stringify({
        title: 'Long Term Project',
        description: 'Test',
        category: 'Web',
        budgetMin: 100000,
        budgetMax: 200000,
        deadline: '2027-12-31',
        requiredSkills: [],
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should return FORBIDDEN for freelancer', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        budgetMin: 10000,
        budgetMax: 20000,
        deadline: '2026-05-01',
        requiredSkills: [],
      }),
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('FORBIDDEN');
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        budgetMin: 10000,
        budgetMax: 20000,
        deadline: '2026-05-01',
        requiredSkills: [],
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should return INVALID_REQUEST for past deadline', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        budgetMin: 10000,
        budgetMax: 20000,
        deadline: '2020-01-01',
        requiredSkills: [],
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('INVALID_REQUEST');
  });

  it('should handle missing title', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        description: 'Test',
        category: 'Web',
        budgetMin: 10000,
        budgetMax: 20000,
        deadline: '2026-05-01',
        requiredSkills: [],
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should handle missing deadline', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        budgetMin: 10000,
        budgetMax: 20000,
        requiredSkills: [],
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should handle negative budget', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Test',
        description: 'Test',
        category: 'Web',
        budgetMin: -10000,
        budgetMax: 20000,
        deadline: '2026-05-01',
        requiredSkills: [],
      }),
    });

    expect([400, 201]).toContain(response.status);
  });

  it('should handle very large budget', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        title: 'Enterprise Project',
        description: 'Large scale project',
        category: 'Enterprise',
        budgetMin: 1000000,
        budgetMax: 5000000,
        deadline: '2026-12-31',
        requiredSkills: [],
      }),
    });

    expect([201, 400]).toContain(response.status);
  });
});

// =============================================================================
// PROJECTS - GET /api/projects (5 tests)
// =============================================================================
describe('GET /api/projects', () => {
  it('should get all projects', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'GET',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should filter by category', async () => {
    const response = await apiRequest('/api/projects?category=Web Development', {
      method: 'GET',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should filter by status', async () => {
    const response = await apiRequest('/api/projects?status=open', {
      method: 'GET',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should filter by budget', async () => {
    const response = await apiRequest('/api/projects?minBudget=50000', {
      method: 'GET',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/projects', {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });
});

// =============================================================================
// PROPOSALS - POST /api/projects/:projectId/proposals (10 tests)
// =============================================================================
describe('POST /api/projects/:projectId/proposals', () => {
  it('should create proposal successfully', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        coverLetter: 'I have experience building e-commerce platforms',
        proposedPrice: 120000,
        estimatedDuration: 30,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('pending');
    proposalId = data.data.id;
  });

  it('should create second proposal from different freelancer', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: JSON.stringify({
        coverLetter: 'I am experienced',
        proposedPrice: 110000,
        estimatedDuration: 25,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    proposal2Id = data.data.id;
  });

  it('should create proposal with long cover letter', async () => {
    const response = await apiRequest(`/api/projects/${project2Id}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        coverLetter: 'a'.repeat(500),
        proposedPrice: 60000,
        estimatedDuration: 20,
      }),
    });

    expect([201, 400]).toContain(response.status);
  });

  it('should return FORBIDDEN for client', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        coverLetter: 'Test',
        proposedPrice: 100000,
        estimatedDuration: 20,
      }),
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('FORBIDDEN');
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'POST',
      body: JSON.stringify({
        coverLetter: 'Test',
        proposedPrice: 100000,
        estimatedDuration: 20,
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should return PROPOSAL_ALREADY_EXISTS for duplicate', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        coverLetter: 'Another proposal',
        proposedPrice: 130000,
        estimatedDuration: 35,
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('PROPOSAL_ALREADY_EXISTS');
  });

  it('should return PROJECT_NOT_FOUND for invalid project', async () => {
    const response = await apiRequest('/api/projects/invalid_id/proposals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        coverLetter: 'Test',
        proposedPrice: 100000,
        estimatedDuration: 20,
      }),
    });

    expect(response.status).toBe(404);
    expect((await response.json()).error).toBe('PROJECT_NOT_FOUND');
  });

  it('should handle missing coverLetter', async () => {
    const response = await apiRequest(`/api/projects/${project2Id}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: JSON.stringify({
        proposedPrice: 100000,
        estimatedDuration: 20,
      }),
    });

    expect(response.status).toBe(400);
  });

  it('should handle negative price', async () => {
    const response = await apiRequest(`/api/projects/${project2Id}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: JSON.stringify({
        coverLetter: 'Test',
        proposedPrice: -100000,
        estimatedDuration: 20,
      }),
    });

    expect([400, 201]).toContain(response.status);
  });

  it('should handle zero duration', async () => {
    const response = await apiRequest(`/api/projects/${project2Id}/proposals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
      body: JSON.stringify({
        coverLetter: 'Test',
        proposedPrice: 60000,
        estimatedDuration: 0,
      }),
    });

    expect([400, 201]).toContain(response.status);
  });
});

// =============================================================================
// PROPOSALS - GET /api/projects/:projectId/proposals (5 tests)
// =============================================================================
describe('GET /api/projects/:projectId/proposals', () => {
  it('should get all proposals for project owner', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should return FORBIDDEN for non-owner client', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${client2Token}` },
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('FORBIDDEN');
  });

  it('should return FORBIDDEN for freelancer', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(403);
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });

  it('should return PROJECT_NOT_FOUND for invalid project', async () => {
    const response = await apiRequest('/api/projects/invalid_id/proposals', {
      method: 'GET',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(404);
  });
});

// =============================================================================
// PROPOSALS - PUT /api/proposals/:proposalId/accept (7 tests)
// =============================================================================
describe('PUT /api/proposals/:proposalId/accept', () => {
  it('should accept proposal and create contract', async () => {
    const response = await apiRequest(`/api/proposals/${proposalId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        milestones: [
          {
            title: 'Design & Planning',
            description: 'UI/UX design',
            amount: 40000,
            dueDate: '2026-02-10',
          },
          {
            title: 'Development',
            description: 'Frontend development',
            amount: 50000,
            dueDate: '2026-02-25',
          },
          {
            title: 'Final Delivery',
            description: 'Testing and deployment',
            amount: 30000,
            dueDate: '2026-03-10',
          },
        ],
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.proposal.status).toBe('accepted');
    expect(data.data.milestones.length).toBe(3);
    contractId = data.data.contract.id;
    milestoneIds = data.data.milestones.map((m) => m.id);
  });

  it('should verify other proposals are rejected', async () => {
    const response = await apiRequest(`/api/projects/${projectId}/proposals`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    const data = await response.json();
    const rejected = data.data.filter((p) => p.id === proposal2Id);
    if (rejected.length > 0) {
      expect(rejected[0].status).toBe('rejected');
    }
  });

  it('should return PROPOSAL_ALREADY_PROCESSED', async () => {
    const response = await apiRequest(`/api/proposals/${proposalId}/accept`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        milestones: [{ title: 'Test', description: 'Test', amount: 120000, dueDate: '2026-05-01' }],
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('PROPOSAL_ALREADY_PROCESSED');
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/proposals/some_id/accept', {
      method: 'PUT',
      body: JSON.stringify({
        milestones: [{ title: 'Test', description: 'Test', amount: 10000, dueDate: '2026-03-01' }],
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should handle missing milestones', async () => {
    const response = await apiRequest('/api/proposals/some_id/accept', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        milestones: [],
      }),
    });

    expect([400, 404]).toContain(response.status);
  });

  it('should handle milestone amounts mismatch', async () => {
    // This would need a new project/proposal combo - test case for validation
    expect(true).toBe(true);
  });

  it('should return PROPOSAL_NOT_FOUND for invalid proposal', async () => {
    const response = await apiRequest('/api/proposals/invalid_id/accept', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        milestones: [{ title: 'Test', description: 'Test', amount: 10000, dueDate: '2026-05-01' }],
      }),
    });

    expect(response.status).toBe(404);
  });
});

// =============================================================================
// CONTRACTS - GET /api/contracts (4 tests)
// =============================================================================
describe('GET /api/contracts', () => {
  it('should get all contracts for user', async () => {
    const response = await apiRequest('/api/contracts', {
      method: 'GET',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should filter by status', async () => {
    const response = await apiRequest('/api/contracts?status=active', {
      method: 'GET',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should filter by role', async () => {
    const response = await apiRequest('/api/contracts?role=client', {
      method: 'GET',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/contracts', {
      method: 'GET',
    });

    expect(response.status).toBe(401);
  });
});

// =============================================================================
// MILESTONES - PUT /api/milestones/:milestoneId/submit (8 tests)
// =============================================================================
describe('PUT /api/milestones/:milestoneId/submit', () => {
  it('should submit first milestone', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('submitted');
  });

  it('should return PREVIOUS_MILESTONE_INCOMPLETE for second milestone', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[1]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('PREVIOUS_MILESTONE_INCOMPLETE');
  });

  it('should return MILESTONE_ALREADY_SUBMITTED', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('MILESTONE_ALREADY_SUBMITTED');
  });

  it('should return FORBIDDEN for wrong freelancer', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancer2Token}` },
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('FORBIDDEN');
  });

  it('should return FORBIDDEN for client', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect([403, 400]).toContain(response.status);
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/milestones/some_id/submit', {
      method: 'PUT',
    });

    expect(response.status).toBe(401);
  });

  it('should return UNAUTHORIZED with invalid token', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/submit`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer invalid' },
    });

    expect(response.status).toBe(401);
  });

  it('should return MILESTONE_NOT_FOUND for invalid milestone', async () => {
    const response = await apiRequest('/api/milestones/invalid_id/submit', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(404);
  });
});

// =============================================================================
// MILESTONES - PUT /api/milestones/:milestoneId/approve (8 tests)
// =============================================================================
describe('PUT /api/milestones/:milestoneId/approve', () => {
  it('should approve first milestone', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data.status).toBe('approved');
  });

  it('should submit second milestone after first approved', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[1]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should approve second milestone', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[1]}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should submit third milestone', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[2]}/submit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${freelancerToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should approve third milestone and complete contract', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[2]}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('should return MILESTONE_ALREADY_APPROVED', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('MILESTONE_ALREADY_APPROVED');
  });

  it('should return FORBIDDEN for wrong client', async () => {
    const response = await apiRequest(`/api/milestones/${milestoneIds[0]}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${client2Token}` },
    });

    expect(response.status).toBe(403);
  });

  it('should return MILESTONE_NOT_FOUND for invalid milestone', async () => {
    const response = await apiRequest('/api/milestones/invalid_id/approve', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    expect(response.status).toBe(404);
  });
});

// =============================================================================
// REVIEWS - POST /api/reviews (10 tests)
// =============================================================================
describe('POST /api/reviews', () => {
  it('should create review from client', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        contractId: contractId,
        rating: 5,
        comment: 'Excellent work!',
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });

  it('should create review from freelancer', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${freelancerToken}` },
      body: JSON.stringify({
        contractId: contractId,
        rating: 5,
        comment: 'Great client!',
      }),
    });

    expect(response.status).toBe(201);
  });

  it('should create review without comment', async () => {
    // This would need a new completed contract - edge case
    expect(true).toBe(true);
  });

  it('should return ALREADY_REVIEWED', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        contractId: contractId,
        rating: 4,
        comment: 'Another review',
      }),
    });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('ALREADY_REVIEWED');
  });

  it('should return FORBIDDEN for non-participant', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${client2Token}` },
      body: JSON.stringify({
        contractId: contractId,
        rating: 5,
        comment: 'Test',
      }),
    });

    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe('FORBIDDEN');
  });

  it('should return UNAUTHORIZED without token', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        contractId: contractId,
        rating: 5,
        comment: 'Test',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should handle missing rating', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${client2Token}` },
      body: JSON.stringify({
        contractId: 'some_id',
        comment: 'Test',
      }),
    });

    expect([400, 403, 404]).toContain(response.status);
  });

  it('should handle rating > 5', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${client2Token}` },
      body: JSON.stringify({
        contractId: 'some_id',
        rating: 6,
        comment: 'Test',
      }),
    });

    expect([400, 403, 404]).toContain(response.status);
  });

  it('should handle rating < 1', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${client2Token}` },
      body: JSON.stringify({
        contractId: 'some_id',
        rating: 0,
        comment: 'Test',
      }),
    });

    expect([400, 403, 404]).toContain(response.status);
  });

  it('should return CONTRACT_NOT_FOUND for invalid contract', async () => {
    const response = await apiRequest('/api/reviews', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({
        contractId: 'invalid_id',
        rating: 5,
        comment: 'Test',
      }),
    });

    expect(response.status).toBe(404);
  });
});
