from datetime import datetime
from threading import Lock

class StatsManager:
    def __init__(self):
        self._lock = Lock()
        self.stats = {
            "total_explanations": 0,
            "total_bugs_fixed": 0,
            "total_testcases_generated": 0,
            "total_optimizations": 0,
            "total_complexity_checks": 0,
            "streak_days": 1, # Default 1 for now
            "xp_points": 0,
            "last_activity": [] # List of dicts { action: string, timestamp: string }
        }
        self.xp_rewards = {
            "explanation": 10,
            "bug_fix": 20,
            "optimization": 25,
            "complexity": 15,
            "test_case": 15
        }

    def _add_activity(self, action: str):
        now_str = datetime.now().isoformat()
        self.stats["last_activity"].insert(0, {"action": action, "timestamp": now_str})
        # Keep only the last 10 activities
        if len(self.stats["last_activity"]) > 10:
            self.stats["last_activity"] = self.stats["last_activity"][:10]

    def record_explanation(self):
        with self._lock:
            self.stats["total_explanations"] += 1
            self.stats["xp_points"] += self.xp_rewards["explanation"]
            self._add_activity("Code explained")

    def record_bug_fix(self):
        with self._lock:
            self.stats["total_bugs_fixed"] += 1
            self.stats["xp_points"] += self.xp_rewards["bug_fix"]
            self._add_activity("Bug fixed")

    def record_optimization(self):
        with self._lock:
            self.stats["total_optimizations"] += 1
            self.stats["xp_points"] += self.xp_rewards["optimization"]
            self._add_activity("Code optimized")

    def record_testcase(self):
        with self._lock:
            self.stats["total_testcases_generated"] += 1
            self.stats["xp_points"] += self.xp_rewards["test_case"]
            self._add_activity("Test case generated")

    def record_complexity(self):
        with self._lock:
            self.stats["total_complexity_checks"] += 1
            self.stats["xp_points"] += self.xp_rewards["complexity"]
            self._add_activity("Complexity checked")

    def get_stats(self):
        with self._lock:
            return self.stats.copy()

# Singleton instance
stats_manager = StatsManager()
