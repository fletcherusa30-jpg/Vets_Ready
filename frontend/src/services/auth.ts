export const auth = {
  async login(email: string, password: string) {
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getToken() {
    return localStorage.getItem('token');
  },
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};
