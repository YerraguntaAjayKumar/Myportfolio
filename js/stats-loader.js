// GitHub & LeetCode API Integration
class PortfolioStats {
  constructor() {
    this.github = {
      username: 'YerraguntaAjayKumar',
      repos: [],
      stats: {}
    };
    this.leetcode = {
      username: 'I_ajay',
      stats: {}
    };
  }

  // Fetch GitHub User Stats
  async fetchGitHubStats() {
    try {
      const response = await fetch(`https://api.github.com/users/${this.github.username}`);
      if (!response.ok) throw new Error('GitHub API Error');
      
      const data = await response.json();
      this.github.stats = {
        name: data.name,
        bio: data.bio,
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
        profileUrl: data.html_url,
        avatar: data.avatar_url,
        location: data.location,
        blog: data.blog,
        twitterUsername: data.twitter_username,
        publicGists: data.public_gists,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      return this.github.stats;
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      return null;
    }
  }

  // Fetch GitHub Repositories
  async fetchGitHubRepos() {
    try {
      const response = await fetch(
        `https://api.github.com/users/${this.github.username}/repos?sort=stars&order=desc&per_page=100`
      );
      if (!response.ok) throw new Error('GitHub Repos API Error');
      
      const data = await response.json();
      this.github.repos = data.map(repo => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        updatedAt: repo.updated_at,
        topics: repo.topics
      }));
      
      return this.github.repos;
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      return [];
    }
  }

  // Fetch GitHub Commit Stats (using GraphQL for better data)
  async fetchGitHubContributions() {
    try {
      const query = `
        query {
          user(login: "${this.github.username}") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) return { totalContributions: 0 };
      
      const result = await response.json();
      if (result.data && result.data.user) {
        return {
          totalContributions: result.data.user.contributionsCollection.contributionCalendar.totalContributions
        };
      }
      return { totalContributions: 0 };
    } catch (error) {
      console.error('Error fetching GitHub contributions:', error);
      return { totalContributions: 0 };
    }
  }

  // Fetch LeetCode Stats
  async fetchLeetCodeStats() {
    try {
      const response = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${this.leetcode.username}`
      );
      if (!response.ok) throw new Error('LeetCode API Error');
      
      const data = await response.json();
      this.leetcode.stats = {
        username: data.username,
        totalSolved: data.totalSolved,
        totalQuestions: data.totalQuestions,
        easySolved: data.easySolved,
        easyTotal: data.easyTotal,
        mediumSolved: data.mediumSolved,
        mediumTotal: data.mediumTotal,
        hardSolved: data.hardSolved,
        hardTotal: data.hardTotal,
        acceptanceRate: ((data.totalSolved / data.totalQuestions) * 100).toFixed(1),
        ranking: data.ranking || 0,
        reputation: data.reputation || 0
      };
      
      return this.leetcode.stats;
    } catch (error) {
      console.error('Error fetching LeetCode stats:', error);
      return null;
    }
  }

  // Get Language Stats from Repos
  getLanguageStats() {
    const languages = {};
    
    this.github.repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    return Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }));
  }

  // Get Top Repositories
  getTopRepos(limit = 5) {
    return this.github.repos.slice(0, limit);
  }

  // Calculate stats
  async loadAllStats() {
    await Promise.all([
      this.fetchGitHubStats(),
      this.fetchGitHubRepos(),
      this.fetchGitHubContributions(),
      this.fetchLeetCodeStats()
    ]);
  }
}

// Render Functions
function renderGitHubStats(stats) {
  if (!stats) return;

  const statsHTML = `
    <div class="stat-item">
      <i class="fas fa-code-branch"></i>
      <span class="stat-value">${stats.publicRepos}</span>
      <span class="stat-label">Repositories</span>
    </div>
    <div class="stat-item">
      <i class="fas fa-star"></i>
      <span class="stat-value">${stats.followers}</span>
      <span class="stat-label">Followers</span>
    </div>
    <div class="stat-item">
      <i class="fas fa-users"></i>
      <span class="stat-value">${stats.following}</span>
      <span class="stat-label">Following</span>
    </div>
  `;

  const container = document.getElementById('github-stats-container');
  if (container) {
    container.innerHTML = statsHTML;
  }
}

function renderLeetCodeStats(stats) {
  if (!stats) return;

  const easyPercentage = ((stats.easySolved / stats.easyTotal) * 100).toFixed(0);
  const mediumPercentage = ((stats.mediumSolved / stats.mediumTotal) * 100).toFixed(0);
  const hardPercentage = ((stats.hardSolved / stats.hardTotal) * 100).toFixed(0);

  const statsHTML = `
    <div class="leetcode-stat">
      <h4>Solved Problems</h4>
      <p class="leetcode-total">${stats.totalSolved} / ${stats.totalQuestions}</p>
      <p class="leetcode-percentage">Success Rate: ${stats.acceptanceRate}%</p>
    </div>

    <div class="leetcode-difficulty">
      <div class="difficulty-item">
        <span class="difficulty-label">Easy</span>
        <div class="difficulty-bar">
          <div class="difficulty-fill easy" style="width: ${easyPercentage}%"></div>
        </div>
        <span class="difficulty-count">${stats.easySolved}/${stats.easyTotal}</span>
      </div>

      <div class="difficulty-item">
        <span class="difficulty-label">Medium</span>
        <div class="difficulty-bar">
          <div class="difficulty-fill medium" style="width: ${mediumPercentage}%"></div>
        </div>
        <span class="difficulty-count">${stats.mediumSolved}/${stats.mediumTotal}</span>
      </div>

      <div class="difficulty-item">
        <span class="difficulty-label">Hard</span>
        <div class="difficulty-bar">
          <div class="difficulty-fill hard" style="width: ${hardPercentage}%"></div>
        </div>
        <span class="difficulty-count">${stats.hardSolved}/${stats.hardTotal}</span>
      </div>
    </div>
  `;

  const container = document.getElementById('leetcode-stats-container');
  if (container) {
    container.innerHTML = statsHTML;
  }
}

function renderLanguageStats(languages) {
  const statsHTML = languages.map(lang => `
    <div class="language-item">
      <span class="language-name">${lang.language}</span>
      <span class="language-count">${lang.count} repos</span>
    </div>
  `).join('');

  const container = document.getElementById('languages-container');
  if (container) {
    container.innerHTML = `<div class="languages-grid">${statsHTML}</div>`;
  }
}

function renderTopRepos(repos) {
  const reposHTML = repos.map(repo => `
    <div class="top-repo-item">
      <h5 class="repo-name">
        <a href="${repo.url}" target="_blank">
          <i class="fas fa-external-link-alt" style="margin-right: 8px;"></i>${repo.name}
        </a>
      </h5>
      <p class="repo-description">${repo.description || 'No description provided'}</p>
      <div class="repo-meta">
        <span class="repo-stat">
          <i class="fas fa-star"></i> ${repo.stars}
        </span>
        <span class="repo-stat">
          <i class="fas fa-code-branch"></i> ${repo.forks}
        </span>
        ${repo.language ? `<span class="repo-language">${repo.language}</span>` : ''}
      </div>
    </div>
  `).join('');

  const container = document.getElementById('top-repos-container');
  if (container) {
    container.innerHTML = reposHTML;
  }
}

// Initialize and render all stats
async function initializeStats() {
  const stats = new PortfolioStats();
  
  // Show loading state
  const containers = [
    'github-stats-container',
    'leetcode-stats-container',
    'languages-container',
    'top-repos-container'
  ];
  
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading stats...</div>';
  });

  // Load all data
  await stats.loadAllStats();

  // Render all components
  renderGitHubStats(stats.github.stats);
  renderLeetCodeStats(stats.leetcode.stats);
  renderLanguageStats(stats.getLanguageStats());
  renderTopRepos(stats.getTopRepos(5));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeStats);
} else {
  initializeStats();
}
