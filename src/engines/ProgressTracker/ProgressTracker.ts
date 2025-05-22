/**
 * ProgressTracker.ts
 * 
 * Main implementation of the ProgressTracker component for the
 * Zenjin Maths App rebuild project.
 */

import {
  UserProgress,
  ContentMastery,
  SessionResults,
  PathProgressDetails,
  ProgressTrackingInterface,
  ProgressTrackerError,
  LearningPath,
  ContentExpectedTime
} from './ProgressTrackingInterface';

import {
  calculateMasteryLevel,
  calculateNextReviewDate,
  daysBetweenDates,
  calculateOverallCompletion,
  validateSessionResults,
  isContentMastered
} from './ProgressTrackerUtils';

/**
 * Implementation of the ProgressTracker component
 */
export class ProgressTracker implements ProgressTrackingInterface {
  // In-memory cache of user progress data
  private userProgressCache: Map<string, UserProgress> = new Map();
  
  // In-memory cache of content mastery data
  private contentMasteryCache: Map<string, Map<string, ContentMastery>> = new Map();
  
  // In-memory cache of path progress details
  private pathProgressCache: Map<string, Map<string, PathProgressDetails>> = new Map();
  
  // Learning paths data
  private learningPaths: Map<string, LearningPath> = new Map();
  
  // Expected completion times for content items
  private expectedTimes: Map<string, number> = new Map();
  
  // Database service (mocked for this implementation)
  private database: {
    getUserProgressData: (userId: string) => UserProgress | null;
    getContentMasteryData: (userId: string, contentId: string) => ContentMastery | null;
    getPathProgressData: (userId: string, pathId: string) => PathProgressDetails | null;
    saveUserProgressData: (data: UserProgress) => boolean;
    saveContentMasteryData: (userId: string, data: ContentMastery) => boolean;
    savePathProgressData: (userId: string, pathId: string, data: PathProgressDetails) => boolean;
    userExists: (userId: string) => boolean;
    contentExists: (contentId: string) => boolean;
    learningPathExists: (pathId: string) => boolean;
    userProgressExists: (userId: string) => boolean;
    getAllContentIdsForPath: (pathId: string) => string[];
    getTotalContentCount: () => number;
  };
  
  /**
   * Creates a new instance of the ProgressTracker
   * 
   * @param learningPaths - Learning paths configuration
   * @param expectedTimes - Expected completion times for content items
   * @param databaseService - Database service for persistence
   */
  constructor(
    learningPaths: LearningPath[] = [],
    expectedTimes: ContentExpectedTime[] = [],
    databaseService?: any
  ) {
    // Initialize learning paths
    learningPaths.forEach(path => {
      this.learningPaths.set(path.id, path);
    });
    
    // Initialize expected times
    expectedTimes.forEach(item => {
      this.expectedTimes.set(item.contentId, item.expectedTime);
    });
    
    // Initialize database service (mock implementation for this example)
    this.database = databaseService || this.createMockDatabaseService();
  }

  /**
   * Gets overall progress data for a user
   * 
   * @param userId - User identifier
   * @returns User progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this user
   */
  public getUserProgress(userId: string): UserProgress {
    // Check if user exists
    if (!this.database.userExists(userId)) {
      throw new Error(ProgressTrackerError.USER_NOT_FOUND);
    }
    
    // Check cache first
    const cachedProgress = this.userProgressCache.get(userId);
    if (cachedProgress) {
      return { ...cachedProgress }; // Return a copy to prevent accidental modifications
    }
    
    // Get from database
    const progress = this.database.getUserProgressData(userId);
    if (!progress) {
      throw new Error(ProgressTrackerError.NO_PROGRESS_DATA);
    }
    
    // Update cache
    this.userProgressCache.set(userId, progress);
    
    return { ...progress }; // Return a copy to prevent accidental modifications
  }

  /**
   * Updates progress based on session results
   * 
   * @param userId - User identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated user progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws INVALID_SESSION_RESULTS if the session results are invalid
   * @throws UPDATE_FAILED if failed to update progress
   */
  public updateProgress(userId: string, sessionResults: SessionResults): UserProgress {
    // Check if user exists
    if (!this.database.userExists(userId)) {
      throw new Error(ProgressTrackerError.USER_NOT_FOUND);
    }
    
    // Validate session results
    if (!validateSessionResults(sessionResults)) {
      throw new Error(ProgressTrackerError.INVALID_SESSION_RESULTS);
    }
    
    // Add timestamp if not provided
    if (!sessionResults.timestamp) {
      sessionResults.timestamp = new Date().toISOString();
    }
    
    try {
      // Update content mastery
      const contentMastery = this.updateContentMastery(userId, sessionResults);
      
      // Update path progress
      const pathProgress = this.updatePathProgress(userId, sessionResults.learningPathId, contentMastery);
      
      // Update overall progress
      const userProgress = this.updateOverallProgress(userId, sessionResults.learningPathId, pathProgress);
      
      return userProgress;
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw new Error(ProgressTrackerError.UPDATE_FAILED);
    }
  }

  /**
   * Gets mastery data for specific content
   * 
   * @param userId - User identifier
   * @param contentId - Content identifier
   * @returns Content mastery data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws CONTENT_NOT_FOUND if the specified content was not found
   * @throws NO_MASTERY_DATA if no mastery data exists for this content
   */
  public getContentMastery(userId: string, contentId: string): ContentMastery {
    // Check if user exists
    if (!this.database.userExists(userId)) {
      throw new Error(ProgressTrackerError.USER_NOT_FOUND);
    }
    
    // Check if content exists
    if (!this.database.contentExists(contentId)) {
      throw new Error(ProgressTrackerError.CONTENT_NOT_FOUND);
    }
    
    // Check cache first
    const userContentCache = this.contentMasteryCache.get(userId);
    if (userContentCache && userContentCache.has(contentId)) {
      return { ...userContentCache.get(contentId)! }; // Return a copy to prevent accidental modifications
    }
    
    // Get from database
    const mastery = this.database.getContentMasteryData(userId, contentId);
    if (!mastery) {
      throw new Error(ProgressTrackerError.NO_MASTERY_DATA);
    }
    
    // Update cache
    if (!this.contentMasteryCache.has(userId)) {
      this.contentMasteryCache.set(userId, new Map());
    }
    this.contentMasteryCache.get(userId)!.set(contentId, mastery);
    
    return { ...mastery }; // Return a copy to prevent accidental modifications
  }

  /**
   * Gets detailed progress data for a specific learning path
   * 
   * @param userId - User identifier
   * @param learningPathId - Learning path identifier
   * @returns Detailed path progress data
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws LEARNING_PATH_NOT_FOUND if the specified learning path was not found
   * @throws NO_PROGRESS_DATA if no progress data exists for this path
   */
  public getPathProgress(userId: string, learningPathId: string): PathProgressDetails {
    // Check if user exists
    if (!this.database.userExists(userId)) {
      throw new Error(ProgressTrackerError.USER_NOT_FOUND);
    }
    
    // Check if learning path exists
    if (!this.database.learningPathExists(learningPathId)) {
      throw new Error(ProgressTrackerError.LEARNING_PATH_NOT_FOUND);
    }
    
    // Check cache first
    const userPathCache = this.pathProgressCache.get(userId);
    if (userPathCache && userPathCache.has(learningPathId)) {
      return { ...userPathCache.get(learningPathId)! }; // Return a copy to prevent accidental modifications
    }
    
    // Get from database
    const pathProgress = this.database.getPathProgressData(userId, learningPathId);
    if (!pathProgress) {
      throw new Error(ProgressTrackerError.NO_PROGRESS_DATA);
    }
    
    // Update cache
    if (!this.pathProgressCache.has(userId)) {
      this.pathProgressCache.set(userId, new Map());
    }
    this.pathProgressCache.get(userId)!.set(learningPathId, pathProgress);
    
    return { ...pathProgress }; // Return a copy to prevent accidental modifications
  }

  /**
   * Initializes progress tracking for a new user
   * 
   * @param userId - User identifier
   * @returns Whether the initialization was successful
   * @throws USER_NOT_FOUND if the specified user was not found
   * @throws ALREADY_INITIALIZED if progress tracking already initialized for this user
   * @throws INITIALIZATION_FAILED if failed to initialize progress tracking
   */
  public initializeUserProgress(userId: string): boolean {
    // Check if user exists
    if (!this.database.userExists(userId)) {
      throw new Error(ProgressTrackerError.USER_NOT_FOUND);
    }
    
    // Check if already initialized
    if (this.database.userProgressExists(userId)) {
      throw new Error(ProgressTrackerError.ALREADY_INITIALIZED);
    }
    
    try {
      // Initialize user progress
      const currentDate = new Date().toISOString();
      const userProgress: UserProgress = {
        userId,
        overallCompletion: 0,
        pathProgress: {},
        masteredContent: 0,
        totalContent: this.database.getTotalContentCount(),
        lastUpdateDate: currentDate
      };
      
      // Initialize path progress for all learning paths
      for (const [pathId, path] of this.learningPaths.entries()) {
        userProgress.pathProgress[pathId] = 0;
        
        const pathProgressDetails: PathProgressDetails = {
          completion: 0,
          stitchProgress: {},
          lastUpdateDate: currentDate
        };
        
        // Initialize stitch progress
        path.stitches.forEach(stitch => {
          pathProgressDetails.stitchProgress[stitch.id] = {
            masteryLevel: 0,
            attemptsCount: 0,
            position: stitch.position
          };
          
          // Initialize content mastery
          const contentMastery: ContentMastery = {
            contentId: stitch.id,
            masteryLevel: 0,
            attemptsCount: 0,
            lastAttemptDate: currentDate
          };
          
          // Save content mastery
          this.database.saveContentMasteryData(userId, contentMastery);
        });
        
        // Save path progress
        this.database.savePathProgressData(userId, pathId, pathProgressDetails);
      }
      
      // Save user progress
      const success = this.database.saveUserProgressData(userProgress);
      if (!success) {
        throw new Error(ProgressTrackerError.INITIALIZATION_FAILED);
      }
      
      // Update caches
      this.userProgressCache.set(userId, userProgress);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize user progress:', error);
      throw new Error(ProgressTrackerError.INITIALIZATION_FAILED);
    }
  }

  /**
   * Updates content mastery based on session results
   * 
   * @param userId - User identifier
   * @param sessionResults - Results from the learning session
   * @returns Updated content mastery data
   * @private
   */
  private updateContentMastery(userId: string, sessionResults: SessionResults): ContentMastery {
    let contentMastery: ContentMastery;
    
    try {
      // Get existing mastery data if available
      contentMastery = this.getContentMastery(userId, sessionResults.stitchId);
    } catch (error) {
      // Initialize new mastery data if not available
      contentMastery = {
        contentId: sessionResults.stitchId,
        masteryLevel: 0,
        attemptsCount: 0,
        lastAttemptDate: sessionResults.timestamp || new Date().toISOString()
      };
    }
    
    // Calculate days since last attempt
    const lastAttemptDate = new Date(contentMastery.lastAttemptDate);
    const currentAttemptDate = new Date(sessionResults.timestamp || new Date().toISOString());
    const daysSinceLastAttempt = daysBetweenDates(lastAttemptDate, currentAttemptDate);
    
    // Get expected time for this content
    const expectedTime = this.expectedTimes.get(sessionResults.stitchId) || 
                         sessionResults.completionTime; // Fallback to actual time if not configured
    
    // Calculate new mastery level
    const correctRatio = sessionResults.correctCount / sessionResults.totalCount;
    const newMasteryLevel = calculateMasteryLevel(
      correctRatio,
      sessionResults.completionTime,
      expectedTime,
      contentMastery.masteryLevel,
      daysSinceLastAttempt
    );
    
    // Calculate next review date
    const nextReviewDate = calculateNextReviewDate(newMasteryLevel, currentAttemptDate);
    
    // Update mastery data
    const updatedMastery: ContentMastery = {
      contentId: sessionResults.stitchId,
      masteryLevel: newMasteryLevel,
      attemptsCount: contentMastery.attemptsCount + 1,
      lastAttemptDate: currentAttemptDate.toISOString(),
      nextReviewDate: nextReviewDate.toISOString()
    };
    
    // Save to database
    this.database.saveContentMasteryData(userId, updatedMastery);
    
    // Update cache
    if (!this.contentMasteryCache.has(userId)) {
      this.contentMasteryCache.set(userId, new Map());
    }
    this.contentMasteryCache.get(userId)!.set(sessionResults.stitchId, updatedMastery);
    
    return updatedMastery;
  }

  /**
   * Updates path progress based on content mastery
   * 
   * @param userId - User identifier
   * @param pathId - Learning path identifier
   * @param contentMastery - Updated content mastery data
   * @returns Updated path progress details
   * @private
   */
  private updatePathProgress(
    userId: string,
    pathId: string,
    contentMastery: ContentMastery
  ): PathProgressDetails {
    let pathProgress: PathProgressDetails;
    
    try {
      // Get existing path progress if available
      pathProgress = this.getPathProgress(userId, pathId);
    } catch (error) {
      // Initialize new path progress if not available
      pathProgress = {
        completion: 0,
        stitchProgress: {},
        lastUpdateDate: new Date().toISOString()
      };
    }
    
    // Update stitch progress
    pathProgress.stitchProgress[contentMastery.contentId] = {
      masteryLevel: contentMastery.masteryLevel,
      attemptsCount: contentMastery.attemptsCount,
      position: pathProgress.stitchProgress[contentMastery.contentId]?.position || 0
    };
    
    // Calculate new completion percentage
    const allContentIds = this.database.getAllContentIdsForPath(pathId);
    let masteredCount = 0;
    
    for (const contentId of allContentIds) {
      // Check if we have progress data for this content
      if (pathProgress.stitchProgress[contentId]) {
        const stitchMasteryLevel = pathProgress.stitchProgress[contentId].masteryLevel;
        if (isContentMastered(stitchMasteryLevel)) {
          masteredCount++;
        }
      }
    }
    
    // Calculate completion as percentage of mastered content
    const newCompletion = allContentIds.length > 0 ? masteredCount / allContentIds.length : 0;
    
    // Update path progress
    const currentDate = new Date().toISOString();
    const updatedPathProgress: PathProgressDetails = {
      ...pathProgress,
      completion: newCompletion,
      lastUpdateDate: currentDate
    };
    
    // Save to database
    this.database.savePathProgressData(userId, pathId, updatedPathProgress);
    
    // Update cache
    if (!this.pathProgressCache.has(userId)) {
      this.pathProgressCache.set(userId, new Map());
    }
    this.pathProgressCache.get(userId)!.set(pathId, updatedPathProgress);
    
    return updatedPathProgress;
  }

  /**
   * Updates overall progress based on path progress
   * 
   * @param userId - User identifier
   * @param pathId - Learning path identifier that was updated
   * @param pathProgressDetails - Updated path progress details
   * @returns Updated user progress data
   * @private
   */
  private updateOverallProgress(
    userId: string,
    pathId: string,
    pathProgressDetails: PathProgressDetails
  ): UserProgress {
    let userProgress: UserProgress;
    
    try {
      // Get existing user progress if available
      userProgress = this.getUserProgress(userId);
    } catch (error) {
      // Initialize new user progress if not available
      userProgress = {
        userId,
        overallCompletion: 0,
        pathProgress: {},
        masteredContent: 0,
        totalContent: this.database.getTotalContentCount(),
        lastUpdateDate: new Date().toISOString()
      };
    }
    
    // Update path progress
    userProgress.pathProgress[pathId] = pathProgressDetails.completion;
    
    // Calculate path weights for overall completion
    const pathWeights: { [pathId: string]: number } = {};
    for (const [id, path] of this.learningPaths.entries()) {
      pathWeights[id] = path.weight;
    }
    
    // Calculate new overall completion
    const newOverallCompletion = calculateOverallCompletion(userProgress.pathProgress, pathWeights);
    
    // Count mastered content across all paths
    let masteredContent = 0;
    for (const [pathId, _] of this.learningPaths.entries()) {
      try {
        const pathProgress = this.getPathProgress(userId, pathId);
        for (const stitchId in pathProgress.stitchProgress) {
          if (isContentMastered(pathProgress.stitchProgress[stitchId].masteryLevel)) {
            masteredContent++;
          }
        }
      } catch (error) {
        // Skip paths without progress data
      }
    }
    
    // Update user progress
    const currentDate = new Date().toISOString();
    const updatedUserProgress: UserProgress = {
      ...userProgress,
      overallCompletion: newOverallCompletion,
      masteredContent,
      lastUpdateDate: currentDate
    };
    
    // Save to database
    this.database.saveUserProgressData(updatedUserProgress);
    
    // Update cache
    this.userProgressCache.set(userId, updatedUserProgress);
    
    return updatedUserProgress;
  }

  /**
   * Creates a mock database service for testing
   * 
   * @returns Mock database service
   * @private
   */
  private createMockDatabaseService() {
    // In-memory storage for mock database
    const userProgressStore: Map<string, UserProgress> = new Map();
    const contentMasteryStore: Map<string, Map<string, ContentMastery>> = new Map();
    const pathProgressStore: Map<string, Map<string, PathProgressDetails>> = new Map();
    const users: Set<string> = new Set(['user123', 'user456']); // Mock users
    const contents: Set<string> = new Set(['stitch123', 'stitch124', 'stitch125']); // Mock content
    const learningPaths: Set<string> = new Set(['path1', 'path2', 'path3']); // Mock paths
    
    // Mock database service implementation
    return {
      getUserProgressData: (userId: string): UserProgress | null => {
        return userProgressStore.get(userId) || null;
      },
      
      getContentMasteryData: (userId: string, contentId: string): ContentMastery | null => {
        const userStore = contentMasteryStore.get(userId);
        return userStore ? userStore.get(contentId) || null : null;
      },
      
      getPathProgressData: (userId: string, pathId: string): PathProgressDetails | null => {
        const userStore = pathProgressStore.get(userId);
        return userStore ? userStore.get(pathId) || null : null;
      },
      
      saveUserProgressData: (data: UserProgress): boolean => {
        userProgressStore.set(data.userId, { ...data });
        return true;
      },
      
      saveContentMasteryData: (userId: string, data: ContentMastery): boolean => {
        if (!contentMasteryStore.has(userId)) {
          contentMasteryStore.set(userId, new Map());
        }
        contentMasteryStore.get(userId)!.set(data.contentId, { ...data });
        return true;
      },
      
      savePathProgressData: (userId: string, pathId: string, data: PathProgressDetails): boolean => {
        if (!pathProgressStore.has(userId)) {
          pathProgressStore.set(userId, new Map());
        }
        pathProgressStore.get(userId)!.set(pathId, { ...data });
        return true;
      },
      
      userExists: (userId: string): boolean => {
        return users.has(userId);
      },
      
      contentExists: (contentId: string): boolean => {
        return contents.has(contentId);
      },
      
      learningPathExists: (pathId: string): boolean => {
        return learningPaths.has(pathId);
      },
      
      userProgressExists: (userId: string): boolean => {
        return userProgressStore.has(userId);
      },
      
      getAllContentIdsForPath: (pathId: string): string[] => {
        // Mock content IDs for paths
        const contentMap: { [key: string]: string[] } = {
          'path1': ['stitch123', 'stitch124', 'stitch125'],
          'path2': ['stitch126', 'stitch127'],
          'path3': ['stitch128', 'stitch129', 'stitch130', 'stitch131']
        };
        return contentMap[pathId] || [];
      },
      
      getTotalContentCount: (): number => {
        // Mock total content count
        return 80;
      }
    };
  }
}