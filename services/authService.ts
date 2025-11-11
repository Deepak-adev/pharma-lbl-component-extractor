interface User {
  username: string;
  loginTime: Date;
}

class AuthService {
  private currentUser: User | null = null;
  private readonly STORAGE_KEY = 'pharma_lbl_user';

  login(username: string): void {
    this.currentUser = {
      username,
      loginTime: new Date()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();