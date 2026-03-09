from github_client import GitHubClient
from db_manager import DatabaseManager
from datetime import datetime
import json

class DataCollector:
    def __init__(self):
        self.github = GitHubClient()
        self.db = DatabaseManager()
    
    def parse_datetime(self, date_string):
        """Parse GitHub datetime string"""
        if not date_string:
            return None
        return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%SZ')
    
    def collect_repository_info(self):
        """Collect and store repository information"""
        print("\nFetching repository information...")
        repo = self.github.get_repository_info()
        
        if not repo:
            print("Failed to fetch repository info")
            return
        
        repo_data = (
            repo['id'],
            repo['name'],
            repo['full_name'],
            repo.get('description', ''),
            repo['stargazers_count'],
            repo['forks_count'],
            repo['watchers_count'],
            repo['open_issues_count'],
            repo.get('language', 'Unknown'),
            self.parse_datetime(repo['created_at']),
            self.parse_datetime(repo['updated_at']),
            datetime.now()
        )
        
        repo_id = self.db.insert_repository(repo_data)
        print(f"Repository info updated (ID: {repo_id})")
        print(f"  Stars: {repo['stargazers_count']}")
        print(f"  Forks: {repo['forks_count']}")
        print(f"  Watchers: {repo['watchers_count']}")
        print(f"  Open Issues: {repo['open_issues_count']}")
    
    def collect_contributors(self):
        """Collect and store contributors"""
        print("\nFetching contributors...")
        contributors = self.github.get_contributors()
        
        if not contributors:
            print("Failed to fetch contributors")
            return
        
        count = 0
        for contributor in contributors:
            user_data = (
                contributor['id'],
                contributor['login'],
                contributor.get('avatar_url', ''),
                contributor.get('html_url', ''),
                contributor['contributions'],
                datetime.now()
            )
            
            self.db.insert_contributor(user_data)
            count += 1
        
        print(f"Stored {count} contributors")
    
    def collect_commits(self, limit=100):
        """Collect and store recent commits"""
        print(f"\nFetching last {limit} commits...")
        commits = self.github.get_commits(per_page=limit)
        
        if not commits:
            print("Failed to fetch commits")
            return
        
        count = 0
        for commit in commits:
            sha = commit['sha']
            details = self.github.get_commit_details(sha)
            
            if not details:
                continue
            
            author = commit.get('author')
            author_id = None
            
            if author:
                user_data = (
                    author['id'],
                    author['login'],
                    author.get('avatar_url', ''),
                    author.get('html_url', ''),
                    1,
                    datetime.now()
                )
                self.db.insert_contributor(user_data)
                author_id = author['id']
            
            commit_data = (
                sha,
                commit['commit']['message'],
                author_id,
                self.parse_datetime(commit['commit']['author']['date']),
                details['stats'].get('additions', 0),
                details['stats'].get('deletions', 0),
                details['stats'].get('total', 0)
            )
            
            if self.db.insert_commit(commit_data):
                count += 1
        
        print(f"Stored {count} new commits")
    
    def collect_pull_requests(self, limit=50):
        """Collect and store pull requests"""
        print(f"\nFetching pull requests...")
        prs = self.github.get_pull_requests(state='all', per_page=limit)
        
        if not prs:
            print("Failed to fetch pull requests")
            return
        
        count = 0
        for pr in prs:
            author = pr.get('user')
            author_id = None
            
            if author:
                user_data = (
                    author['id'],
                    author['login'],
                    author.get('avatar_url', ''),
                    author.get('html_url', ''),
                    1,
                    datetime.now()
                )
                self.db.insert_contributor(user_data)
                author_id = author['id']
            
            pr_data = (
                pr['number'],
                pr['title'],
                pr['state'],
                author_id,
                self.parse_datetime(pr['created_at']),
                self.parse_datetime(pr['updated_at']),
                self.parse_datetime(pr.get('closed_at')),
                self.parse_datetime(pr.get('merged_at')),
                pr.get('additions', 0),
                pr.get('deletions', 0),
                pr.get('changed_files', 0)
            )
            
            self.db.insert_pull_request(pr_data)
            count += 1
        
        print(f"Stored {count} pull requests")
    
    def collect_issues(self, limit=50):
        """Collect and store issues"""
        print(f"\nFetching issues...")
        issues = self.github.get_issues(state='all', per_page=limit)
        
        if not issues:
            print("Failed to fetch issues")
            return
        
        count = 0
        for issue in issues:
            if 'pull_request' in issue:
                continue
            
            author = issue.get('user')
            author_id = None
            
            if author:
                user_data = (
                    author['id'],
                    author['login'],
                    author.get('avatar_url', ''),
                    author.get('html_url', ''),
                    1,
                    datetime.now()
                )
                self.db.insert_contributor(user_data)
                author_id = author['id']
            
            labels = [label['name'] for label in issue.get('labels', [])]
            
            issue_data = (
                issue['number'],
                issue['title'],
                issue['state'],
                author_id,
                labels,
                self.parse_datetime(issue['created_at']),
                self.parse_datetime(issue['updated_at']),
                self.parse_datetime(issue.get('closed_at')),
                issue.get('comments', 0)
            )
            
            self.db.insert_issue(issue_data)
            count += 1
        
        print(f"Stored {count} issues")
    
    def collect_all(self):
        """Run all collection tasks"""
        print("\nStarting data collection for ml-stable-diffusion\n")
        
        start_time = datetime.now()
        
        try:
            self.collect_repository_info()
            self.collect_contributors()
            self.collect_commits(limit=100)
            self.collect_pull_requests(limit=50)
            self.collect_issues(limit=50)
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            print(f"\nCollection completed in {duration:.2f} seconds\n")
            
        except Exception as e:
            print(f"\nCollection failed: {e}")
        
        finally:
            self.db.close()

if __name__ == "__main__":
    collector = DataCollector()
    collector.collect_all()

