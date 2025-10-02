# 🧪 SISDAT Forecast - Testing Guide

## 📋 Overview

This document outlines testing procedures for SISDAT Forecast before deploying to staging/production.

---

## ✅ Pre-Deployment Manual Testing Checklist

### 1. Authentication & Authorization

#### Login Flow
- [ ] Login page loads correctly
- [ ] Valid credentials allow login
- [ ] Invalid credentials show error
- [ ] reCAPTCHA validation works
- [ ] Session persists after refresh
- [ ] "Remember me" works (if implemented)
- [ ] Logout clears session

#### Password Reset
- [ ] "Forgot password" link works
- [ ] Email with reset link sent
- [ ] Reset link expires after use
- [ ] Reset link expires after time limit
- [ ] New password meets requirements
- [ ] Can login with new password

#### Protected Routes
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users can access dashboard
- [ ] Role-based access works correctly

### 2. Dashboard Functionality

#### Data Display
- [ ] Dashboard loads without errors
- [ ] All charts render correctly
- [ ] Data tables populate properly
- [ ] Filters work as expected
- [ ] Date pickers function correctly
- [ ] Company selector works

#### Projections
- [ ] Historical data displays correctly
- [ ] Projection charts render
- [ ] Multiple models show correctly
- [ ] Export functionality works
- [ ] Print view is formatted correctly

#### Maps
- [ ] Map loads without errors
- [ ] Markers display correctly
- [ ] Popups show station information
- [ ] Zoom controls work
- [ ] Pan functionality works
- [ ] Layer controls function

### 3. API Endpoints

Test all API endpoints:

```bash
# Health Check
curl https://your-domain.com/api/health

# Dashboard Metrics
curl https://your-domain.com/api/dashboard-metrics

# Residential Data
curl https://your-domain.com/api/residential-data

# Companies
curl https://your-domain.com/api/companies
```

Expected results:
- [ ] All endpoints return 200 status
- [ ] Response times < 500ms
- [ ] Data format is correct
- [ ] Error handling works
- [ ] Rate limiting activates

### 4. Performance

#### Page Load Times
- [ ] Homepage: < 2s
- [ ] Login: < 1.5s
- [ ] Dashboard: < 3s
- [ ] Reports: < 4s

#### Lighthouse Scores (Mobile & Desktop)
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

#### Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### 5. Security

#### Headers
Check security headers at: https://securityheaders.com

- [ ] Content-Security-Policy present
- [ ] Strict-Transport-Security present
- [ ] X-Content-Type-Options present
- [ ] X-Frame-Options present
- [ ] Permissions-Policy present

#### Authentication
- [ ] Passwords hashed (never stored plain)
- [ ] JWT tokens expire correctly
- [ ] Sessions invalidate on logout
- [ ] No sensitive data in localStorage
- [ ] HTTPS enforced

#### XSS Protection
- [ ] User inputs sanitized
- [ ] HTML entities escaped
- [ ] No `dangerouslySetInnerHTML` misuse
- [ ] Content Security Policy blocks inline scripts

### 6. Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 7. Responsive Design

Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (320x568) - iPhone SE

### 8. Data Integrity

#### Database
- [ ] Data saves correctly
- [ ] Updates reflect immediately
- [ ] Deletions work properly
- [ ] Foreign keys enforced
- [ ] Transactions work

#### Caching
- [ ] Cache invalidation works
- [ ] Stale data not served
- [ ] TTL respected
- [ ] Cache misses handled

### 9. Error Handling

#### UI Errors
- [ ] Network errors show friendly message
- [ ] 404 page displays correctly
- [ ] 500 page displays correctly
- [ ] Form validation errors clear
- [ ] Toast notifications work

#### API Errors
- [ ] 400 errors return helpful messages
- [ ] 401 errors redirect to login
- [ ] 403 errors show permission denied
- [ ] 404 errors return proper format
- [ ] 500 errors logged to Sentry

### 10. Monitoring & Logging

#### Sentry
- [ ] Errors captured correctly
- [ ] Source maps working
- [ ] User context included
- [ ] Breadcrumbs helpful
- [ ] Performance issues tracked

#### Analytics
- [ ] Pageviews tracked
- [ ] Events tracked
- [ ] User flows tracked
- [ ] Conversions tracked
- [ ] Custom dimensions work

---

## 🤖 Automated Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Coverage Requirements:**
- [ ] Overall coverage > 80%
- [ ] Critical paths > 90%
- [ ] Utilities > 95%

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test
npx playwright test login.spec.ts

# Generate report
npm run test:e2e:report
```

**Critical Flows to Test:**
- [ ] Login → Dashboard → Logout
- [ ] Dashboard → Projections → Export
- [ ] Dashboard → Map → Station Details
- [ ] Password Reset Flow
- [ ] Form Submissions

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

**API Endpoints to Test:**
- [ ] Authentication endpoints
- [ ] Data retrieval endpoints
- [ ] Data mutation endpoints
- [ ] Error scenarios

---

## 🔍 Testing Procedures by Environment

### Development

```bash
# 1. Start dev server
npm run dev

# 2. Run tests in watch mode
npm run test:watch

# 3. Manual testing in browser
open http://localhost:3000
```

### Staging

```bash
# 1. Deploy to staging
vercel --env staging

# 2. Run E2E tests against staging
STAGING_URL=https://staging.sisdat-forecast.com npm run test:e2e

# 3. Manual smoke testing
# - Test critical paths
# - Verify data integrity
# - Check integrations
```

### Production

```bash
# 1. Run full test suite
npm run test:ci

# 2. Run production E2E tests (read-only)
PROD_URL=https://sisdat-forecast.com npm run test:e2e:prod

# 3. Monitor after deployment
# - Check Sentry for errors
# - Monitor performance metrics
# - Review user feedback
```

---

## 📊 Performance Testing

### Load Testing (k6)

```bash
# Install k6
# macOS: brew install k6
# Linux: apt-get install k6

# Run load test
k6 run scripts/load-test.js
```

**Targets:**
- [ ] Concurrent users: 100
- [ ] Response time p95: < 500ms
- [ ] Error rate: < 1%
- [ ] Throughput: > 100 req/s

### Stress Testing

```bash
# Gradually increase load until failure
k6 run --vus 1 --duration 60s --stage 100:1m --stage 200:2m scripts/stress-test.js
```

### Database Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

---

## 🐛 Bug Reporting Template

When issues are found:

```markdown
**Environment:** [Development/Staging/Production]
**Browser:** [Chrome 120.0.0]
**User Role:** [Admin/Operator/Viewer]

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Enter...
4. Submit...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach screenshots]

**Console Errors:**
[Paste console errors]

**Additional Context:**
[Any other relevant information]
```

---

## ✅ Smoke Testing Script

Quick verification after deployment:

```bash
#!/bin/bash
# smoke-test.sh

DOMAIN="https://sisdat-forecast.com"

echo "🔥 Running smoke tests..."

# 1. Health check
echo "Testing health endpoint..."
curl -f $DOMAIN/api/health || exit 1

# 2. Homepage
echo "Testing homepage..."
curl -f $DOMAIN || exit 1

# 3. Login page
echo "Testing login page..."
curl -f $DOMAIN/login || exit 1

# 4. API endpoints
echo "Testing API..."
curl -f $DOMAIN/api/companies || exit 1

# 5. Static assets
echo "Testing static assets..."
curl -f $DOMAIN/manifest.json || exit 1

echo "✅ All smoke tests passed!"
```

---

## 📈 Testing Metrics

Track these metrics over time:

- **Code Coverage:** Target > 80%
- **Test Execution Time:** Keep < 5 minutes
- **Flaky Tests:** Keep < 2%
- **Bug Escape Rate:** Target < 5%
- **Mean Time to Detection:** Target < 24 hours
- **Mean Time to Resolution:** Target < 48 hours

---

## 🔄 Continuous Testing

### Pre-commit Hooks

```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm test
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run test:e2e
```

---

## 📞 Testing Support

Questions about testing procedures?

- **Email:** testing@sisdat-forecast.com
- **Slack:** #sisdat-testing
- **Documentation:** See individual test files

---

**Last Updated:** 2025-09-30
**Version:** 2.1.0
