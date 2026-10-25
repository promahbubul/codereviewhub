/**
 * Canonicalizes a repository URL so that cosmetic variants map to the same value:
 *   https://www.GitHub.com/User/Repo.git/?tab=readme#top  ->  https://github.com/user/repo
 * Storing the canonical form lets the (studentId, repoUrl) unique index catch every duplicate.
 */
export const normalizeRepoUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl.trim());

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = url.pathname
    .replace(/\/+$/, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '')
    .toLowerCase();

  return `${url.protocol}//${host}${url.port ? `:${url.port}` : ''}${path}`;
};
