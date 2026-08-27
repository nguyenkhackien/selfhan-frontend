export interface User {
  id: string;
  email: string;
  role: "learner" | "admin";
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
