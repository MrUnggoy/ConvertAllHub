import asyncio
import time
from typing import Dict, Any, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class ProgressTracker:
    """Service for tracking progress of heavy processing tasks"""
    
    def __init__(self):
        self._tasks: Dict[str, Dict[str, Any]] = {}
        self._cleanup_interval = 3600  # 1 hour
        self._cleanup_task = None
        self._start_cleanup_task()
    
    def _start_cleanup_task(self):
        """Start background task to clean up old completed tasks"""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_old_tasks())
    
    async def _cleanup_old_tasks(self):
        """Remove old completed tasks to prevent memory leaks"""
        while True:
            try:
                current_time = time.time()
                tasks_to_remove = []
                
                for task_id, task_data in self._tasks.items():
                    # Remove tasks older than 1 hour that are completed/failed
                    if (task_data['status'] in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED] and
                        current_time - task_data['updated_at'] > self._cleanup_interval):
                        tasks_to_remove.append(task_id)
                
                for task_id in tasks_to_remove:
                    del self._tasks[task_id]
                    logger.info(f"Cleaned up old task: {task_id}")
                
                await asyncio.sleep(300)  # Check every 5 minutes
                
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    def create_task(
        self,
        task_id: str,
        task_type: str,
        filename: str,
        total_steps: int = 100,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new progress tracking task"""
        
        task_data = {
            'task_id': task_id,
            'task_type': task_type,
            'filename': filename,
            'status': TaskStatus.QUEUED,
            'progress': 0,
            'total_steps': total_steps,
            'current_step': 0,
            'message': 'Task queued',
            'created_at': time.time(),
            'updated_at': time.time(),
            'started_at': None,
            'completed_at': None,
            'metadata': metadata or {},
            'error_message': None
        }
        
        self._tasks[task_id] = task_data
        logger.info(f"Created progress task: {task_id} ({task_type})")
        return task_data.copy()
    
    def update_progress(
        self,
        task_id: str,
        current_step: int,
        message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update task progress"""
        
        if task_id not in self._tasks:
            logger.warning(f"Task not found for progress update: {task_id}")
            return False
        
        task_data = self._tasks[task_id]
        
        # Don't update if task is already completed/failed
        if task_data['status'] in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
            return False
        
        # Start task if it's queued
        if task_data['status'] == TaskStatus.QUEUED:
            task_data['status'] = TaskStatus.PROCESSING
            task_data['started_at'] = time.time()
        
        # Update progress
        task_data['current_step'] = min(current_step, task_data['total_steps'])
        task_data['progress'] = int((task_data['current_step'] / task_data['total_steps']) * 100)
        task_data['updated_at'] = time.time()
        
        if message:
            task_data['message'] = message
        
        if metadata:
            task_data['metadata'].update(metadata)
        
        logger.debug(f"Updated progress for {task_id}: {task_data['progress']}%")
        return True
    
    def complete_task(
        self,
        task_id: str,
        result_url: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Mark task as completed"""
        
        if task_id not in self._tasks:
            logger.warning(f"Task not found for completion: {task_id}")
            return False
        
        task_data = self._tasks[task_id]
        task_data['status'] = TaskStatus.COMPLETED
        task_data['progress'] = 100
        task_data['current_step'] = task_data['total_steps']
        task_data['message'] = 'Task completed successfully'
        task_data['completed_at'] = time.time()
        task_data['updated_at'] = time.time()
        
        if result_url:
            task_data['result_url'] = result_url
        
        if metadata:
            task_data['metadata'].update(metadata)
        
        logger.info(f"Completed task: {task_id}")
        return True
    
    def fail_task(
        self,
        task_id: str,
        error_message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Mark task as failed"""
        
        if task_id not in self._tasks:
            logger.warning(f"Task not found for failure: {task_id}")
            return False
        
        task_data = self._tasks[task_id]
        task_data['status'] = TaskStatus.FAILED
        task_data['message'] = 'Task failed'
        task_data['error_message'] = error_message
        task_data['completed_at'] = time.time()
        task_data['updated_at'] = time.time()
        
        if metadata:
            task_data['metadata'].update(metadata)
        
        logger.error(f"Failed task {task_id}: {error_message}")
        return True
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a task"""
        
        if task_id not in self._tasks:
            logger.warning(f"Task not found for cancellation: {task_id}")
            return False
        
        task_data = self._tasks[task_id]
        
        # Only cancel if not already completed/failed
        if task_data['status'] not in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
            task_data['status'] = TaskStatus.CANCELLED
            task_data['message'] = 'Task cancelled'
            task_data['completed_at'] = time.time()
            task_data['updated_at'] = time.time()
            
            logger.info(f"Cancelled task: {task_id}")
            return True
        
        return False
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get current task status and progress"""
        
        if task_id not in self._tasks:
            return None
        
        return self._tasks[task_id].copy()
    
    def get_all_tasks(self, limit: int = 100) -> Dict[str, Dict[str, Any]]:
        """Get all tasks (for debugging/monitoring)"""
        
        # Sort by updated_at descending and limit results
        sorted_tasks = sorted(
            self._tasks.items(),
            key=lambda x: x[1]['updated_at'],
            reverse=True
        )
        
        return dict(sorted_tasks[:limit])
    
    def get_active_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Get all active (queued/processing) tasks"""
        
        active_tasks = {
            task_id: task_data
            for task_id, task_data in self._tasks.items()
            if task_data['status'] in [TaskStatus.QUEUED, TaskStatus.PROCESSING]
        }
        
        return active_tasks
    
    def get_task_count_by_status(self) -> Dict[str, int]:
        """Get count of tasks by status"""
        
        counts = {status.value: 0 for status in TaskStatus}
        
        for task_data in self._tasks.values():
            status = task_data['status'].value if isinstance(task_data['status'], TaskStatus) else task_data['status']
            counts[status] = counts.get(status, 0) + 1
        
        return counts

# Global progress tracker instance
progress_tracker = ProgressTracker()