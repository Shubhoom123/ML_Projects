import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import time

load_dotenv()

class GitHubClient:
    def __init__(self):
        self.token = os.getenv('GITHUB_TOKEN')
        self.repo_owner = os.getenv('REPO_OWNER', 'apple')
        self.repo_name = os.getenv('REPO_NAME', 'ml-stable-diffusion')
        self.base_url = 'https://api.github.com'
        self.headers = {
            'Authorization': f'token {self.token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def _make_request(self, endpoint, params=None):
        """Make API request with rate limiting handling"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = self.session.get(url, params=params)
            
            remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
            if remaining < 10:
                reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
                sleep_time = max(reset_time - time.time(), 0) + 1
                print(f"Rate limit low. Sleeping for {sleep_time:.0f} seconds...")
                time.sleep(sleep_time)
            
            response.raise_for_status()
            return response.json()
        
        except requests.exceptions.HTTPError as e:
            print(f"HTTP Error: {e}")
            return None
        except Exception as e:
            print(f"Request failed: {e}")
            return None
    
    def get_repository_info(self):
        """Get basic repository information"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}"
        return self._make_request(endpoint)
    
    def get_commits(self, per_page=100, page=1):
        """Get recent commits"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}/commits"
        params = {'per_page': per_page, 'page': page}
        return self._make_request(endpoint, params)
    
    def get_commit_details(self, sha):
        """Get detailed commit information"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}/commits/{sha}"
        return self._make_request(endpoint)
    
    def get_pull_requests(self, state='all', per_page=100, page=1):
        """Get pull requests"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}/pulls"
        params = {'state': state, 'per_page': per_page, 'page': page}
        return self._make_request(endpoint, params)
    
    def get_issues(self, state='all', per_page=100, page=1):
        """Get issues"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}/issues"
        params = {'state': state, 'per_page': per_page, 'page': page}
        return self._make_request(endpoint, params)
    
    def get_contributors(self, per_page=100, page=1):
        """Get repository contributors"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}/contributors"
        params = {'per_page': per_page, 'page': page}
        return self._make_request(endpoint, params)
    
    def get_events(self, per_page=100, page=1):
        """Get repository events"""
        endpoint = f"repos/{self.repo_owner}/{self.repo_name}/events"
        params = {'per_page': per_page, 'page': page}
        return self._make_request(endpoint, params)
    
    def get_rate_limit(self):
        """Check current rate limit status"""
        endpoint = "rate_limit"
        return self._make_request(endpoint)

