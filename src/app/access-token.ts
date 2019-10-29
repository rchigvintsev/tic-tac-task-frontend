export function getAccessToken() {
  return localStorage.getItem('access-token');
}

export function setAccessToken(accessToken: string) {
  if (accessToken) {
    localStorage.setItem('access-token', accessToken);
  } else {
    localStorage.removeItem('access-token');
  }
}
