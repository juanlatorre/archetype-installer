import JSZip from 'jszip';
import { ThemeShape, LoginVariant, CounterStyle } from '../types';

const DEFAULT_REPO_URL = 'https://github.com/ssjshields/archetype';
const GITHUB_API_BASE = 'https://api.github.com';

export interface LatestArchetypeInfo {
  branch: string;
  commit: string;
  commitDate: string;
}

function parseGithubRepo(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  if (!match) {
    throw new Error(`Unsupported GitHub repository URL: ${repoUrl}`);
  }

  return {
    owner: match[1],
    repo: match[2]
  };
}

function buildCodeloadBranchArchiveUrl(repoUrl: string, branch: string): string {
  const { owner, repo } = parseGithubRepo(repoUrl);
  const encodedBranch = branch.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `https://codeload.github.com/${owner}/${repo}/zip/refs/heads/${encodedBranch}`;
}

async function fetchGithubBranchArchive(repoUrl: string, branch: string): Promise<JSZip> {
  const archiveUrl = buildCodeloadBranchArchiveUrl(repoUrl, branch);
  const response = await fetch(archiveUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch live archetype archive: ${response.status} ${response.statusText}`);
  }

  const archiveBuffer = await response.arrayBuffer();
  const sourceZip = await JSZip.loadAsync(archiveBuffer);
  const normalizedZip = new JSZip();

  const firstFilePath = Object.keys(sourceZip.files).find(path => !sourceZip.files[path].dir && path.includes('/'));
  const archiveRoot = firstFilePath ? `${firstFilePath.split('/')[0]}/` : '';

  if (!archiveRoot) {
    throw new Error('Unexpected archetype archive format');
  }

  const fileEntries = Object.values(sourceZip.files).filter(file => !file.dir);

  for (const file of fileEntries) {
    if (!file.name.startsWith(archiveRoot)) {
      continue;
    }

    const relativePath = file.name.slice(archiveRoot.length);
    if (!relativePath) {
      continue;
    }

    const content = await file.async('uint8array');
    normalizedZip.file(`archetype/${relativePath}`, content);
  }

  return normalizedZip;
}

export async function fetchLatestArchetypeInfo(repoUrl: string = DEFAULT_REPO_URL): Promise<LatestArchetypeInfo> {
  const { owner, repo } = parseGithubRepo(repoUrl);

  const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  if (!repoResponse.ok) {
    throw new Error(`Failed to fetch repository info: ${repoResponse.status} ${repoResponse.statusText}`);
  }

  const repoData = await repoResponse.json();
  const branch = repoData.default_branch;
  if (!branch) {
    throw new Error('Repository default branch not found');
  }

  const commitsResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=1`
  );

  if (!commitsResponse.ok) {
    throw new Error(`Failed to fetch latest commit: ${commitsResponse.status} ${commitsResponse.statusText}`);
  }

  const commitsData = await commitsResponse.json();
  const latestCommit = commitsData[0];
  if (!latestCommit?.sha) {
    throw new Error('Latest commit not found');
  }

  const commitDate = latestCommit?.commit?.committer?.date || latestCommit?.commit?.author?.date;
  if (!commitDate) {
    throw new Error('Latest commit date not found');
  }

  return {
    branch,
    commit: latestCommit.sha,
    commitDate
  };
}

export const COLORS_FILENAME_MAP: Record<string, string> = {
  default: 'CHOOSE_YOUR_COLORS.xml',
  'original-red': 'CHOOSE_YOUR_COLORS_ORIGINAL_RED.xml',
  'original-green': 'CHOOSE_YOUR_COLORS_ORIGINAL_GREEN.xml',
  'original-yellow': 'CHOOSE_YOUR_COLORS_ORIGINAL_YELLOW.xml',
  'original-purple': 'CHOOSE_YOUR_COLORS_ORIGINAL_PURPLE.xml',
  'original-pink': 'CHOOSE_YOUR_COLORS_ORIGINAL_PINK.xml',
  frostbite: 'CHOOSE_YOUR_COLORS_FROSTBITE.xml',
  industrial: 'CHOOSE_YOUR_COLORS_INDUSTRIAL.xml',
  rose: 'CHOOSE_YOUR_COLORS_ROSÉ.xml',
  sunrise: 'CHOOSE_YOUR_COLORS_SUNRISE.xml',
  twilight: 'CHOOSE_YOUR_COLORS_TWILIGHT.xml',
  green420: 'CHOOSE_YOUR_COLORS_420GREEN.xml',
  ember: 'CHOOSE_YOUR_COLORS_EMBER.xml',
  arcticwhite: 'CHOOSE_YOUR_COLORS_ARCTICWHITE.xml'
};

export function getColorsFilename(themeId: string): string {
  return COLORS_FILENAME_MAP[themeId] || 'CHOOSE_YOUR_COLORS.xml';
}

export function getShapeInclude(shape: ThemeShape): string {
  return shape === 'Round' ? 'Round' : 'Sharp';
}

export function getShapeAtlas(shape: ThemeShape): string {
  return shape === 'Round' ? 'icons/round/main.atlas' : 'icons/sharp/main.atlas';
}

export function getLoginInclude(loginVariant: LoginVariant): string {
  return loginVariant;
}

export function getCursorInclude(cursorId: string): string {
  const cursorMap: Record<string, string> = {
    'classic-white': 'Cursors-White',
    'classic-black': 'Cursors-Black',
    'modern-white': 'Cursors-White-Alt',
    'modern-black': 'Cursors-Black-Alt'
  };
  return cursorMap[cursorId] || 'Cursors-White';
}

export function getBubbleInclude(bubbleId: string): string {
  const bubbleMap: Record<string, string> = {
    'archetype': 'Archetype',
    'default-white': 'Default-White',
    'default-black': 'Default-Black'
  };
  return bubbleMap[bubbleId] || 'Archetype';
}

export function getCounterInclude(counterStyle: CounterStyle): string {
  if (counterStyle === 'None') return 'Counter-Right';
  return counterStyle;
}

interface FetchBaseThemeOptions {
  repoUrl?: string;
  branch?: string;
  commitHash?: string;
}

export async function fetchBaseTheme(options: FetchBaseThemeOptions = {}): Promise<JSZip> {
  const repoUrl = options.repoUrl || DEFAULT_REPO_URL;
  let branch = options.branch;

  try {
    if (!branch) {
      const latestInfo = await fetchLatestArchetypeInfo(repoUrl);
      branch = latestInfo.branch;
    }

    return await fetchGithubBranchArchive(repoUrl, branch);
  } catch (error) {
    console.warn('Falling back to bundled base-theme.zip:', error);
  }

  const fallbackUrl = options.commitHash ? `/base-theme.zip?v=${options.commitHash}` : '/base-theme.zip';
  const response = await fetch(fallbackUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch bundled base theme: ${response.statusText}`);
  }

  const blob = await response.blob();
  return JSZip.loadAsync(blob);
}
