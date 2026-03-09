import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.conn = None
        self.connect()
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST'),
                port=os.getenv('DB_PORT'),
                database=os.getenv('DB_NAME'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD', '')
            )
            print("Database connected successfully")
        except Exception as e:
            print(f"Database connection failed: {e}")
            raise
    
    def execute_query(self, query, params=None):
        """Execute a query and return results"""
        try:
            cursor = self.conn.cursor()
            cursor.execute(query, params)
            self.conn.commit()
            return cursor
        except Exception as e:
            self.conn.rollback()
            print(f"Query execution failed: {e}")
            raise
    
    def fetch_one(self, query, params=None):
        """Fetch single row"""
        cursor = self.execute_query(query, params)
        return cursor.fetchone()
    
    def fetch_all(self, query, params=None):
        """Fetch all rows"""
        cursor = self.execute_query(query, params)
        return cursor.fetchall()
    
    def insert_repository(self, repo_data):
        """Insert or update repository data"""
        query = """
            INSERT INTO repositories 
            (repo_id, name, full_name, description, stars, forks, watchers, 
             open_issues, language, created_at, updated_at, last_synced)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (repo_id) 
            DO UPDATE SET
                stars = EXCLUDED.stars,
                forks = EXCLUDED.forks,
                watchers = EXCLUDED.watchers,
                open_issues = EXCLUDED.open_issues,
                updated_at = EXCLUDED.updated_at,
                last_synced = EXCLUDED.last_synced
            RETURNING id;
        """
        return self.fetch_one(query, repo_data)[0]
    
    def insert_contributor(self, user_data):
        """Insert or update contributor data"""
        query = """
            INSERT INTO contributors 
            (user_id, username, avatar_url, profile_url, contributions, last_seen)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (user_id)
            DO UPDATE SET
                contributions = contributors.contributions + EXCLUDED.contributions,
                last_seen = EXCLUDED.last_seen
            RETURNING id;
        """
        return self.fetch_one(query, user_data)[0]
    
    def insert_commit(self, commit_data):
        """Insert commit data"""
        query = """
            INSERT INTO commits 
            (sha, message, author_id, commit_date, additions, deletions, total_changes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (sha) DO NOTHING
            RETURNING id;
        """
        result = self.fetch_one(query, commit_data)
        return result[0] if result else None
    
    def insert_pull_request(self, pr_data):
        """Insert or update pull request data"""
        query = """
            INSERT INTO pull_requests 
            (pr_number, title, state, author_id, created_at, updated_at, 
             closed_at, merged_at, additions, deletions, changed_files)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (pr_number)
            DO UPDATE SET
                state = EXCLUDED.state,
                updated_at = EXCLUDED.updated_at,
                closed_at = EXCLUDED.closed_at,
                merged_at = EXCLUDED.merged_at
            RETURNING id;
        """
        return self.fetch_one(query, pr_data)[0]
    
    def insert_issue(self, issue_data):
        """Insert or update issue data"""
        query = """
            INSERT INTO issues 
            (issue_number, title, state, author_id, labels, created_at, 
             updated_at, closed_at, comments_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (issue_number)
            DO UPDATE SET
                state = EXCLUDED.state,
                updated_at = EXCLUDED.updated_at,
                closed_at = EXCLUDED.closed_at,
                comments_count = EXCLUDED.comments_count
            RETURNING id;
        """
        return self.fetch_one(query, issue_data)[0]
    
    def insert_event(self, event_data):
        """Insert event data"""
        query = """
            INSERT INTO events 
            (event_id, event_type, actor_id, created_at, payload)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (event_id) DO NOTHING;
        """
        self.execute_query(query, event_data)
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("Database connection closed")

