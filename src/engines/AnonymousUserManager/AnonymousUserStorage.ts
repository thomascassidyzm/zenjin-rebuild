import { AnonymousUserData, RegisteredUserData } from './AnonymousUserTypes';

// Local storage keys
const ANONYMOUS_USERS_KEY = 'zenjin-maths-anonymous-users';
const REGISTERED_USERS_KEY = 'zenjin-maths-registered-users';

/**
 * Storage class for anonymous and registered user data
 * Handles data persistence in local storage with encryption
 */
export class AnonymousUserStorage {
  /**
   * Checks if an anonymous user exists in storage
   * @param anonymousId - Anonymous user identifier
   * @returns Whether the anonymous user exists
   */
  public anonymousUserExists(anonymousId: string): boolean {
    const users = this.loadAnonymousUsers();
    return anonymousId in users;
  }

  /**
   * Gets anonymous user data from storage
   * @param anonymousId - Anonymous user identifier
   * @returns Anonymous user data
   * @throws Error if the anonymous user is not found
   */
  public getAnonymousUser(anonymousId: string): AnonymousUserData {
    const users = this.loadAnonymousUsers();
    
    if (!(anonymousId in users)) {
      throw new Error(`Anonymous user with ID ${anonymousId} not found`);
    }
    
    return users[anonymousId];
  }

  /**
   * Saves anonymous user data to storage
   * @param userData - Anonymous user data to save
   */
  public saveAnonymousUser(userData: AnonymousUserData): void {
    const users = this.loadAnonymousUsers();
    users[userData.anonymousId] = userData;
    this.saveAnonymousUsers(users);
  }

  /**
   * Deletes an anonymous user from storage
   * @param anonymousId - Anonymous user identifier
   * @returns Whether the user was successfully deleted
   */
  public deleteAnonymousUser(anonymousId: string): boolean {
    const users = this.loadAnonymousUsers();
    
    if (!(anonymousId in users)) {
      return false;
    }
    
    delete users[anonymousId];
    this.saveAnonymousUsers(users);
    
    return true;
  }

  /**
   * Gets all anonymous user IDs from storage
   * @returns Array of anonymous user IDs
   */
  public getAllAnonymousUserIds(): string[] {
    const users = this.loadAnonymousUsers();
    return Object.keys(users);
  }

  /**
   * Saves registered user data to storage
   * @param userData - Registered user data to save
   */
  public saveRegisteredUser(userData: RegisteredUserData): void {
    const users = this.loadRegisteredUsers();
    users[userData.userId] = userData;
    this.saveRegisteredUsers(users);
  }

  /**
   * Checks if a username is already taken
   * @param username - Username to check
   * @returns Whether the username is already taken
   */
  public isUsernameTaken(username: string): boolean {
    const users = this.loadRegisteredUsers();
    
    return Object.values(users).some((user) => 
      user.username.toLowerCase() === username.toLowerCase()
    );
  }

  /**
   * Checks if an email is already taken
   * @param email - Email to check
   * @returns Whether the email is already taken
   */
  public isEmailTaken(email: string): boolean {
    const users = this.loadRegisteredUsers();
    
    return Object.values(users).some((user) => 
      user.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Loads anonymous users from local storage
   * @returns Map of anonymous user IDs to anonymous user data
   */
  private loadAnonymousUsers(): Record<string, AnonymousUserData> {
    try {
      const storedData = localStorage.getItem(ANONYMOUS_USERS_KEY);
      
      if (!storedData) {
        return {};
      }
      
      // Decrypt the data (using a simple implementation for now)
      const decryptedData = this.decrypt(storedData);
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error loading anonymous users:', error);
      return {};
    }
  }

  /**
   * Saves anonymous users to local storage
   * @param users - Map of anonymous user IDs to anonymous user data
   */
  private saveAnonymousUsers(users: Record<string, AnonymousUserData>): void {
    try {
      const data = JSON.stringify(users);
      
      // Encrypt the data (using a simple implementation for now)
      const encryptedData = this.encrypt(data);
      
      localStorage.setItem(ANONYMOUS_USERS_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving anonymous users:', error);
      throw error;
    }
  }

  /**
   * Loads registered users from local storage
   * @returns Map of registered user IDs to registered user data
   */
  private loadRegisteredUsers(): Record<string, RegisteredUserData> {
    try {
      const storedData = localStorage.getItem(REGISTERED_USERS_KEY);
      
      if (!storedData) {
        return {};
      }
      
      // Decrypt the data (using a simple implementation for now)
      const decryptedData = this.decrypt(storedData);
      
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error loading registered users:', error);
      return {};
    }
  }

  /**
   * Saves registered users to local storage
   * @param users - Map of registered user IDs to registered user data
   */
  private saveRegisteredUsers(users: Record<string, RegisteredUserData>): void {
    try {
      const data = JSON.stringify(users);
      
      // Encrypt the data (using a simple implementation for now)
      const encryptedData = this.encrypt(data);
      
      localStorage.setItem(REGISTERED_USERS_KEY, encryptedData);
    } catch (error) {
      console.error('Error saving registered users:', error);
      throw error;
    }
  }

  /**
   * Encrypts data for storage
   * This is a simple implementation that should be replaced with a more secure solution
   * @param data - Data to encrypt
   * @returns Encrypted data
   */
  private encrypt(data: string): string {
    // In a production environment, use a proper encryption library
    // This is a placeholder for demonstration purposes
    // For example, you could use the Web Crypto API for proper encryption
    
    // Simple Base64 encoding for now (NOT secure)
    return btoa(data);
  }

  /**
   * Decrypts data from storage
   * This is a simple implementation that should be replaced with a more secure solution
   * @param encryptedData - Encrypted data to decrypt
   * @returns Decrypted data
   */
  private decrypt(encryptedData: string): string {
    // In a production environment, use a proper encryption library
    // This is a placeholder for demonstration purposes
    // For example, you could use the Web Crypto API for proper decryption
    
    // Simple Base64 decoding for now (NOT secure)
    return atob(encryptedData);
  }
}