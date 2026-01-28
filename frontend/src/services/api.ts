export const api = {
  async get(path: string) {
    const res = await fetch(`http://localhost:8000${path}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async post(path: string, body: any) {
    const res = await fetch(`http://localhost:8000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async upload(path: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`http://localhost:8000${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
