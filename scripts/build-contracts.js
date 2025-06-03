/**
 * APML v3.1 Build Contract Enforcement
 * 
 * Validates build output against defined contracts
 * Ensures no console statements, proper bundle sizes, and contract compliance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { contextConfiguration, validateContextSize } from '../src/config/contexts.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build contract definitions
const BUILD_CONTRACTS = {
  development: {
    console_statements: 'allowed',
    source_maps: 'inline',
    debug_artifacts: 'included',
    validation: 'warnings_only'
  },
  production: {
    console_statements: 'prohibited',
    source_maps: 'external',
    debug_artifacts: 'stripped',
    validation: 'strict',
    bundle_limits: {
      total_size: 400 * 1024, // 400KB total
      main_chunk: 200 * 1024, // 200KB main
      lazy_chunk: 100 * 1024  // 100KB per lazy chunk
    },
    performance_targets: {
      lighthouse_score: 90,
      fcp: 1500, // First Contentful Paint < 1.5s
      tti: 3000  // Time to Interactive < 3s
    }
  }
};

/**
 * Scan build output for console statements
 */
function checkConsoleStatements(distPath) {
  const jsFiles = getAllJsFiles(distPath);
  const violations = [];

  for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for console.* patterns
      if (/console\.(log|debug|info|warn|error|trace)/.test(line)) {
        violations.push({
          file: path.relative(distPath, file),
          line: index + 1,
          statement: line.trim().substring(0, 100)
        });
      }
    });
  }

  return violations;
}

/**
 * Check bundle sizes against contracts
 */
function checkBundleSizes(distPath) {
  const violations = [];
  const stats = {};
  
  // Get all JS files
  const jsFiles = getAllJsFiles(distPath);
  let totalSize = 0;

  for (const file of jsFiles) {
    const stat = fs.statSync(file);
    const size = stat.size;
    totalSize += size;
    
    const fileName = path.basename(file);
    stats[fileName] = size;

    // Check individual chunk sizes
    if (fileName.includes('index') && size > BUILD_CONTRACTS.production.bundle_limits.main_chunk) {
      violations.push({
        file: fileName,
        actual: Math.round(size / 1024) + 'KB',
        limit: Math.round(BUILD_CONTRACTS.production.bundle_limits.main_chunk / 1024) + 'KB',
        type: 'main_chunk_exceeds_limit'
      });
    }
  }

  // Check total size
  if (totalSize > BUILD_CONTRACTS.production.bundle_limits.total_size) {
    violations.push({
      type: 'total_size_exceeds_limit',
      actual: Math.round(totalSize / 1024) + 'KB',
      limit: Math.round(BUILD_CONTRACTS.production.bundle_limits.total_size / 1024) + 'KB'
    });
  }

  // Check context-specific sizes
  for (const [contextName, config] of Object.entries(contextConfiguration)) {
    const contextFiles = jsFiles.filter(f => 
      path.basename(f).toLowerCase().includes(contextName.toLowerCase())
    );
    
    if (contextFiles.length > 0) {
      const contextSize = contextFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);
      const maxSize = parseInt(config.maxSize) * 1024;
      
      if (contextSize > maxSize) {
        violations.push({
          type: 'context_size_exceeds_limit',
          context: contextName,
          actual: Math.round(contextSize / 1024) + 'KB',
          limit: config.maxSize
        });
      }
    }
  }

  return { violations, stats };
}

/**
 * Check for proper code splitting
 */
function checkCodeSplitting(distPath) {
  const issues = [];
  const jsFiles = getAllJsFiles(distPath);
  
  // Check for expected context chunks
  const expectedContexts = ['learning', 'admin', 'payment', 'analytics', 'settings'];
  const foundContexts = [];

  for (const context of expectedContexts) {
    const contextChunk = jsFiles.find(f => 
      path.basename(f).toLowerCase().includes(context)
    );
    
    if (contextChunk) {
      foundContexts.push(context);
    } else if (contextConfiguration[context].preload === false) {
      issues.push({
        type: 'missing_lazy_chunk',
        context: context,
        message: `Expected lazy-loaded chunk for ${context} context not found`
      });
    }
  }

  return { issues, foundContexts };
}

/**
 * Validate touch target sizes in CSS
 */
function checkTouchTargets(distPath) {
  const cssFiles = getAllCssFiles(distPath);
  const violations = [];

  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Look for button/interactive element styles
    const buttonPattern = /\.(btn|button|link|tab|nav-item)[^{]*{([^}]*)}/g;
    let match;
    
    while ((match = buttonPattern.exec(content)) !== null) {
      const className = match[1];
      const styles = match[2];
      
      // Check for min-height or height
      const heightMatch = styles.match(/(?:min-)?height:\s*(\d+)px/);
      if (heightMatch && parseInt(heightMatch[1]) < 44) {
        violations.push({
          file: path.basename(file),
          class: className,
          height: heightMatch[1] + 'px',
          minimum: '44px'
        });
      }
    }
  }

  return violations;
}

/**
 * Get all JS files in directory
 */
function getAllJsFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllJsFiles(fullPath, files);
    } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.map')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get all CSS files in directory
 */
function getAllCssFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllCssFiles(fullPath, files);
    } else if (entry.name.endsWith('.css')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main validation function
 */
function validateBuildContracts(environment = 'production') {
  console.log(`\n🔍 Validating ${environment} build contracts...\n`);
  
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build output not found. Run build first.');
    process.exit(1);
  }

  const results = {
    passed: true,
    violations: []
  };

  // 1. Check console statements
  if (BUILD_CONTRACTS[environment].console_statements === 'prohibited') {
    console.log('Checking for console statements...');
    const consoleViolations = checkConsoleStatements(distPath);
    
    if (consoleViolations.length > 0) {
      results.passed = false;
      results.violations.push({
        type: 'console_statements',
        count: consoleViolations.length,
        details: consoleViolations.slice(0, 5) // Show first 5
      });
      console.log(`❌ Found ${consoleViolations.length} console statements`);
    } else {
      console.log('✅ No console statements found');
    }
  }

  // 2. Check bundle sizes
  console.log('\nChecking bundle sizes...');
  const { violations: sizeViolations, stats } = checkBundleSizes(distPath);
  
  if (sizeViolations.length > 0) {
    results.passed = false;
    results.violations.push({
      type: 'bundle_size',
      violations: sizeViolations
    });
    sizeViolations.forEach(v => {
      console.log(`❌ ${v.type}: ${v.actual} (limit: ${v.limit || v.context})`);
    });
  } else {
    console.log('✅ All bundle sizes within limits');
  }

  // 3. Check code splitting
  console.log('\nChecking code splitting...');
  const { issues: splitIssues, foundContexts } = checkCodeSplitting(distPath);
  
  if (splitIssues.length > 0) {
    results.passed = false;
    results.violations.push({
      type: 'code_splitting',
      issues: splitIssues
    });
    splitIssues.forEach(issue => {
      console.log(`❌ ${issue.message}`);
    });
  } else {
    console.log(`✅ Code splitting working (${foundContexts.length} contexts found)`);
  }

  // 4. Check touch targets
  console.log('\nChecking touch target sizes...');
  const touchViolations = checkTouchTargets(distPath);
  
  if (touchViolations.length > 0) {
    results.passed = false;
    results.violations.push({
      type: 'touch_targets',
      violations: touchViolations
    });
    console.log(`❌ Found ${touchViolations.length} touch target violations`);
  } else {
    console.log('✅ All touch targets meet minimum size');
  }

  // Final report
  console.log('\n' + '='.repeat(50));
  if (results.passed) {
    console.log('✅ All build contracts validated successfully!');
    process.exit(0);
  } else {
    console.log('❌ Build contract violations found:');
    console.log(JSON.stringify(results.violations, null, 2));
    
    // Write detailed report
    const reportPath = path.join(__dirname, '..', 'build-contract-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report written to: ${reportPath}`);
    
    process.exit(1);
  }
}

// Run validation
const environment = process.argv[2] || 'production';
validateBuildContracts(environment);