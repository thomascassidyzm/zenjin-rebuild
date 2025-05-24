/**
 * APMLValidationSuiteInterface.ts
 * 
 * APML Framework v1.3.3 Interface Definition
 * Interface-First Development Protocol Compliance
 * 
 * Defines the interface for comprehensive APML validation testing
 * across all project modules with evidence-based status advancement.
 */

/**
 * Validation test result for individual components
 */
export interface ValidationTestResult {
  /** Unique test identifier */
  testId: string;
  /** Human-readable test name */
  testName: string;
  /** APML validation criterion being tested */
  apmlCriterion: string;
  /** Test execution status */
  status: 'passed' | 'failed' | 'skipped' | 'running';
  /** Test execution time in milliseconds */
  duration?: number;
  /** Detailed test results */
  details: {
    /** Number of assertions passed */
    assertionsPassed: number;
    /** Total number of assertions */
    totalAssertions: number;
    /** Specific evidence of functionality */
    evidence: string[];
    /** Any error messages or warnings */
    errors: string[];
  };
  /** Timestamp of test execution */
  timestamp: string;
}

/**
 * Component validation results
 */
export interface ComponentValidationResult {
  /** Component name */
  componentName: string;
  /** Interface compliance status */
  interfaceCompliance: boolean;
  /** Current APML status level */
  currentStatus: 'not-started' | 'scaffolded' | 'functional' | 'integrated' | 'tested' | 'optimized';
  /** Recommended next status based on test results */
  recommendedStatus: 'not-started' | 'scaffolded' | 'functional' | 'integrated' | 'tested' | 'optimized';
  /** Individual test results */
  testResults: ValidationTestResult[];
  /** Overall component score (0-100) */
  overallScore: number;
  /** Evidence for status advancement */
  advancementEvidence: string[];
}

/**
 * Module validation results
 */
export interface ModuleValidationResult {
  /** Module name */
  moduleName: string;
  /** Current completion percentage */
  currentCompletion: number;
  /** Projected completion after validation */
  projectedCompletion: number;
  /** Component validation results */
  components: ComponentValidationResult[];
  /** Module-level validation summary */
  summary: {
    /** Total components tested */
    totalComponents: number;
    /** Components passing all tests */
    passingComponents: number;
    /** Components ready for advancement */
    advanceable: number;
    /** Critical issues found */
    criticalIssues: string[];
  };
  /** APML compliance assessment */
  apmlCompliance: {
    /** Interface-first development followed */
    interfaceFirst: boolean;
    /** Evidence-based validation */
    evidenceBased: boolean;
    /** Validation through distinction */
    validationThroughDistinction: boolean;
    /** Context boundaries respected */
    contextBoundaries: boolean;
  };
}

/**
 * Full project validation results
 */
export interface ProjectValidationResult {
  /** Project validation timestamp */
  timestamp: string;
  /** APML Framework version used */
  frameworkVersion: string;
  /** Overall project health score */
  overallScore: number;
  /** Module validation results */
  modules: ModuleValidationResult[];
  /** Project-wide recommendations */
  recommendations: {
    /** Next highest-impact development priorities */
    nextPriorities: string[];
    /** Critical gaps to address */
    criticalGaps: string[];
    /** Ready for advancement */
    readyForAdvancement: string[];
  };
  /** APML protocol compliance summary */
  protocolCompliance: {
    /** All axioms satisfied */
    allAxiomsSatisfied: boolean;
    /** Specific axiom compliance */
    axiomCompliance: {
      contextBoundaries: boolean;
      interfaceFirst: boolean;
      singleSessionCompletability: boolean;
      explicitKnowledgeCapture: boolean;
      validationThroughDistinction: boolean;
    };
  };
}

/**
 * Validation test configuration
 */
export interface ValidationTestConfig {
  /** Test identifier */
  testId: string;
  /** Test name */
  name: string;
  /** APML criterion being validated */
  criterion: string;
  /** Test function */
  testFunction: () => Promise<ValidationTestResult>;
  /** Test timeout in milliseconds */
  timeout?: number;
  /** Test dependencies (other tests that must pass first) */
  dependencies?: string[];
  /** Test category for organization */
  category: 'interface' | 'functional' | 'integration' | 'performance' | 'error-handling';
}

/**
 * Main APML Validation Suite Interface
 */
export interface APMLValidationSuiteInterface {
  /**
   * Initialize the validation suite
   */
  initialize(): Promise<void>;

  /**
   * Run validation tests for a specific module
   * @param moduleName Name of the module to validate
   * @param options Validation options
   */
  validateModule(
    moduleName: string, 
    options?: {
      /** Skip slow integration tests */
      skipIntegration?: boolean;
      /** Only run specific test categories */
      categories?: ('interface' | 'functional' | 'integration' | 'performance' | 'error-handling')[];
      /** Timeout for entire module validation */
      timeout?: number;
    }
  ): Promise<ModuleValidationResult>;

  /**
   * Run validation tests for a specific component
   * @param moduleName Module containing the component
   * @param componentName Name of the component to validate
   * @param options Validation options
   */
  validateComponent(
    moduleName: string,
    componentName: string,
    options?: {
      /** Specific tests to run */
      testIds?: string[];
      /** Timeout for component validation */
      timeout?: number;
    }
  ): Promise<ComponentValidationResult>;

  /**
   * Run comprehensive validation across entire project
   * @param options Project validation options
   */
  validateProject(options?: {
    /** Modules to include (default: all) */
    modules?: string[];
    /** Skip long-running tests */
    skipLongRunning?: boolean;
    /** Generate advancement recommendations */
    generateRecommendations?: boolean;
  }): Promise<ProjectValidationResult>;

  /**
   * Get available validation tests for a module
   * @param moduleName Module name
   */
  getAvailableTests(moduleName: string): ValidationTestConfig[];

  /**
   * Register custom validation tests
   * @param moduleName Module name
   * @param tests Test configurations to register
   */
  registerTests(moduleName: string, tests: ValidationTestConfig[]): void;

  /**
   * Get current validation status from registry
   * @param moduleName Module name
   * @param componentName Component name (optional)
   */
  getCurrentStatus(moduleName: string, componentName?: string): Promise<{
    currentStatus: string;
    lastValidated?: string;
    validationCriteria: Array<{
      id: string;
      status: 'passed' | 'failed' | 'pending';
    }>;
  }>;

  /**
   * Update registry.apml with validation results
   * @param results Validation results to apply
   * @param options Update options
   */
  updateRegistry(
    results: ModuleValidationResult | ComponentValidationResult[],
    options?: {
      /** Only update if all tests pass */
      requireAllPassing?: boolean;
      /** Generate backup before update */
      createBackup?: boolean;
    }
  ): Promise<boolean>;

  /**
   * Generate human-readable validation report
   * @param results Validation results
   * @param format Report format
   */
  generateReport(
    results: ProjectValidationResult | ModuleValidationResult,
    format: 'html' | 'markdown' | 'json'
  ): string;

  /**
   * Get APML compliance assessment
   * @param results Validation results
   */
  assessAPMLCompliance(
    results: ModuleValidationResult | ProjectValidationResult
  ): {
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  };

  /**
   * Clean up validation resources
   */
  cleanup(): Promise<void>;
}

/**
 * Event handlers for validation progress
 */
export interface ValidationEventHandlers {
  /** Called when validation starts */
  onValidationStart?: (target: string) => void;
  /** Called when a test completes */
  onTestComplete?: (result: ValidationTestResult) => void;
  /** Called when validation completes */
  onValidationComplete?: (result: ModuleValidationResult | ProjectValidationResult) => void;
  /** Called when validation fails */
  onValidationError?: (error: Error, context: string) => void;
  /** Called for progress updates */
  onProgress?: (progress: { completed: number; total: number; current?: string }) => void;
}

/**
 * Validation suite configuration
 */
export interface ValidationSuiteConfig {
  /** Base URL for API testing */
  apiBaseUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Default timeout for tests */
  defaultTimeout?: number;
  /** Event handlers */
  eventHandlers?: ValidationEventHandlers;
  /** Test environment settings */
  environment?: {
    /** Enable network-dependent tests */
    allowNetworkTests?: boolean;
    /** Enable slow integration tests */
    allowSlowTests?: boolean;
    /** Mock external dependencies */
    useMocks?: boolean;
  };
}

/**
 * Factory function interface for creating validation suites
 */
export interface CreateValidationSuiteFunction {
  (config?: ValidationSuiteConfig): APMLValidationSuiteInterface;
}