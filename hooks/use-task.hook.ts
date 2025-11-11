import { ITask, taskService, TaskStatus } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

interface UseTasksOptions {
  status?: TaskStatus;
  page?: number;
  limit?: number;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const { status = "pending", page = 1, limit = 10 } = options;

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await taskService.getTasks({ status, page, limit });

      setTasks(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err?.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [status, page, limit]);

  const completeTask = useCallback(async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      // Remove completed task from list
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return true;
    } catch (err: any) {
      console.error("Error completing task:", err);
      throw new Error(
        err?.response?.data?.message || "Failed to complete task"
      );
    }
  }, []);

  const cancelTask = useCallback(async (taskId: string) => {
    try {
      await taskService.cancelTask(taskId);
      // Remove cancelled task from list
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return true;
    } catch (err: any) {
      console.error("Error cancelling task:", err);
      throw new Error(err?.response?.data?.message || "Failed to cancel task");
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    pagination,
    refetch: fetchTasks,
    completeTask,
    cancelTask,
  };
};
