/**
 * Script to verify all 52 properties from the design document are implemented
 * as property-based tests using fast-check.
 */

import * as fs from 'fs';
import * as path from 'path';

// All 52 properties from the design document
const ALL_PROPERTIES = [
  { id: 1, name: 'Email Uniqueness Enforcement', file: 'auth.service.property.spec.ts' },
  { id: 2, name: 'Password Hashing Round Trip', file: 'jwt.strategy.property.spec.ts' },
  { id: 3, name: 'Registration Creates Role-Specific Profile', file: 'jwt.strategy.property.spec.ts' },
  { id: 4, name: 'Login Token Generation', file: 'jwt.strategy.property.spec.ts' },
  { id: 5, name: 'Login Timestamp Recording', file: 'jwt.strategy.property.spec.ts' },
  { id: 6, name: 'Token Refresh Generates New Access Token', file: 'jwt.strategy.property.spec.ts' },
  { id: 7, name: 'Expired Token Rejection', file: 'jwt.strategy.property.spec.ts' },
  { id: 8, name: 'Role-Based Access Control Enforcement', file: 'jwt.strategy.property.spec.ts' },
  { id: 9, name: 'Candidate Profile Update Authorization', file: 'candidate.service.property.spec.ts' },
  { id: 10, name: 'Candidate Profile Persistence', file: 'candidate.service.property.spec.ts' },
  { id: 11, name: 'Candidate Skill Association', file: 'candidate.service.property.spec.ts' },
  { id: 12, name: 'CV File Format Validation', file: 'cv.service.property.spec.ts' },
  { id: 13, name: 'CV File Size Validation', file: 'cv.service.property.spec.ts' },
  { id: 14, name: 'CV Default Marking Idempotence', file: 'cv.service.property.spec.ts' },
  { id: 15, name: 'Company Creation Links to Recruiter', file: 'company.service.property.spec.ts' },
  { id: 16, name: 'Company Update Authorization', file: 'recruiter.service.property.spec.ts' },
  { id: 17, name: 'Job Creation Sets Active Status', file: 'job.service.property.spec.ts' },
  { id: 18, name: 'Job Skill Association', file: 'job.service.property.spec.ts' },
  { id: 19, name: 'Job Tag Association', file: 'job.service.property.spec.ts' },
  { id: 20, name: 'Closed Job Prevents Applications', file: 'application.service.property.spec.ts' },
  { id: 21, name: 'Duplicate Application Prevention', file: 'application.service.property.spec.ts' },
  { id: 22, name: 'Application Creation with APPLIED Status', file: 'application.service.property.spec.ts' },
  { id: 23, name: 'Application Timestamp Recording', file: 'application.service.property.spec.ts' },
  { id: 24, name: 'Job Filtering by City', file: 'job.service.property.spec.ts' },
  { id: 25, name: 'Job Filtering by Skill', file: 'job.service.property.spec.ts' },
  { id: 26, name: 'Job Filtering by Tag', file: 'job.service.property.spec.ts' },
  { id: 27, name: 'Combined Job Filters Use AND Logic', file: 'job.service.property.spec.ts' },
  { id: 28, name: 'Job Keyword Search Case-Insensitive', file: 'job.service.property.spec.ts' },
  { id: 29, name: 'Pagination Default Page Size', file: 'job.service.property.spec.ts' },
  { id: 30, name: 'Pagination Metadata Completeness', file: 'job.service.property.spec.ts' },
  { id: 31, name: 'Application Status Transition Validation', file: 'application.service.property.spec.ts' },
  { id: 32, name: 'Application Status Update Authorization', file: 'application.service.property.spec.ts' },
  { id: 33, name: 'Application History Sorting', file: 'application.service.property.spec.ts' },
  { id: 34, name: 'Application History Filtering by Status', file: 'application.service.property.spec.ts' },
  { id: 35, name: 'Recruiter Dashboard Scope', file: 'application.service.property.spec.ts' },
  { id: 36, name: 'User Profile Retrieval Includes Role-Specific Data', file: 'user.service.property.spec.ts' },
  { id: 37, name: 'Email Update Uniqueness Check', file: 'user.service.property.spec.ts' },
  { id: 38, name: 'Password Update Hashing', file: 'user.service.property.spec.ts' },
  { id: 39, name: 'Error Response Format Consistency', file: 'validators.property.spec.ts' },
  { id: 40, name: 'Input Validation for Email Format', file: 'validators.property.spec.ts' },
  { id: 41, name: 'Input Validation for Password Length', file: 'validators.property.spec.ts' },
  { id: 42, name: 'Input Validation for Phone Number', file: 'validators.property.spec.ts' },
  { id: 43, name: 'Input Validation for Salary Range', file: 'validators.property.spec.ts' },
  { id: 44, name: 'Admin User Listing Access Control', file: 'admin.service.property.spec.ts' },
  { id: 45, name: 'Admin User Filtering by Role', file: 'admin.service.property.spec.ts' },
  { id: 46, name: 'Admin Analytics Data Aggregation', file: 'admin.service.property.spec.ts' },
  { id: 47, name: 'Soft Delete Application Exclusion', file: 'application.service.property.spec.ts' },
  { id: 48, name: 'Skill Match Percentage Calculation', file: 'job.service.property.spec.ts' },
  { id: 49, name: 'Application Indicator in Job Details', file: 'job.service.property.spec.ts' },
  { id: 50, name: 'Rate Limiting Failed Attempt Tracking', file: 'auth.service.property.spec.ts' },
  { id: 51, name: 'Rate Limiting Account Lockout', file: 'auth.service.property.spec.ts' },
  { id: 52, name: 'Rate Limiting Counter Reset on Success', file: 'auth.service.property.spec.ts' },
];

interface PropertyTestInfo {
  propertyId: number;
  propertyName: string;
  expectedFile: string;
  found: boolean;
  filePath?: string;
  hasMinIterations?: boolean;
  hasShrinking?: boolean;
  testName?: string;
}

function findPropertyTests(srcDir: string): PropertyTestInfo[] {
  const results: PropertyTestInfo[] = ALL_PROPERTIES.map(prop => ({
    propertyId: prop.id,
    propertyName: prop.name,
    expectedFile: prop.file,
    found: false,
  }));

  // Find all property test files
  const propertyTestFiles = findFiles(srcDir, /\.property\.spec\.ts$/);

  for (const filePath of propertyTestFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Look for property references
    const propertyRegex = /Property (\d+):/g;
    let match;
    
    while ((match = propertyRegex.exec(content)) !== null) {
      const propertyId = parseInt(match[1], 10);
      const propertyInfo = results.find(r => r.propertyId === propertyId);
      
      if (propertyInfo) {
        propertyInfo.found = true;
        propertyInfo.filePath = filePath;
        
        // Check for minimum iterations (should be >= 100)
        const iterationMatch = content.match(/numRuns:\s*(\d+)/);
        propertyInfo.hasMinIterations = iterationMatch ? parseInt(iterationMatch[1]) >= 100 : false;
        
        // Check for fast-check usage (shrinking is automatic in fast-check)
        propertyInfo.hasShrinking = content.includes('fc.assert') || content.includes('fc.asyncProperty');
        
        // Extract test name
        const testNameMatch = content.match(new RegExp(`Property ${propertyId}:([^\\n]+)`));
        if (testNameMatch) {
          propertyInfo.testName = testNameMatch[1].trim();
        }
      }
    }
  }

  return results;
}

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
        walk(fullPath);
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return results;
}

function generateReport(results: PropertyTestInfo[]): string {
  const implemented = results.filter(r => r.found);
  const missing = results.filter(r => !r.found);
  const withoutMinIterations = implemented.filter(r => !r.hasMinIterations);
  const withoutShrinking = implemented.filter(r => !r.hasShrinking);

  let report = '# Property-Based Test Coverage Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Properties:** ${ALL_PROPERTIES.length}\n`;
  report += `- **Implemented:** ${implemented.length} (${Math.round(implemented.length / ALL_PROPERTIES.length * 100)}%)\n`;
  report += `- **Missing:** ${missing.length}\n`;
  report += `- **Without Min Iterations (100):** ${withoutMinIterations.length}\n`;
  report += `- **Without Shrinking:** ${withoutShrinking.length}\n\n`;

  if (missing.length > 0) {
    report += `## Missing Properties\n\n`;
    for (const prop of missing) {
      report += `- **Property ${prop.propertyId}:** ${prop.propertyName}\n`;
      report += `  - Expected file: \`${prop.expectedFile}\`\n\n`;
    }
  }

  if (withoutMinIterations.length > 0) {
    report += `## Properties Without Minimum Iterations\n\n`;
    for (const prop of withoutMinIterations) {
      report += `- **Property ${prop.propertyId}:** ${prop.propertyName}\n`;
      report += `  - File: \`${path.basename(prop.filePath || '')}\`\n\n`;
    }
  }

  report += `## Implemented Properties\n\n`;
  for (const prop of implemented) {
    const status = prop.hasMinIterations && prop.hasShrinking ? '✅' : '⚠️';
    report += `${status} **Property ${prop.propertyId}:** ${prop.propertyName}\n`;
    report += `   - File: \`${path.basename(prop.filePath || '')}\`\n`;
    if (!prop.hasMinIterations) {
      report += `   - ⚠️ Missing minimum 100 iterations\n`;
    }
    if (!prop.hasShrinking) {
      report += `   - ⚠️ Missing shrinking (fast-check)\n`;
    }
    report += `\n`;
  }

  return report;
}

// Main execution
const srcDir = path.join(__dirname, '..', 'src');
const results = findPropertyTests(srcDir);
const report = generateReport(results);

console.log(report);

// Write report to file
const reportPath = path.join(__dirname, '..', 'property-test-coverage.md');
fs.writeFileSync(reportPath, report);
console.log(`\nReport written to: ${reportPath}`);

// Exit with error if any properties are missing
const missing = results.filter(r => !r.found);
if (missing.length > 0) {
  console.error(`\n❌ ${missing.length} properties are missing tests!`);
  process.exit(1);
} else {
  console.log('\n✅ All 52 properties are implemented!');
  process.exit(0);
}
