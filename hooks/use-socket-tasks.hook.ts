import { socketManager } from "@/lib/socket";
import { useUser } from "@/redux/hooks/hooks";
import { useCallback, useEffect, useRef } from "react";

interface UseSocketTasksOptions {
  /**
   * Callback fired when a new task is received via socket
   */
  onNewTask?: (task: any) => void;

  /**
   * Whether to automatically connect on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Whether to enable socket connection
   * @default true
   */
  enabled?: boolean;
}

/**
 * Custom hook to manage socket connection and listen for real-time task updates
 *
 * @example
 * ```tsx
 * const { isConnected, connect, disconnect } = useSocketTasks({
 *   onNewTask: (task) => {
 *     console.log('New task received:', task);
 *     // Refresh tasks or update state
 *   }
 * });
 * ```
 */
export function useSocketTasks(options: UseSocketTasksOptions = {}) {
  const { onNewTask, autoConnect = true, enabled = true } = options;

  const { access_token, user } = useUser();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isConnectedRef = useRef(false);

  const userId = user ? (user as any).id : null;

  /**
   * Connect to socket and subscribe to task updates
   */
  const connect = useCallback(() => {
    if (!access_token || !userId) {
      console.log("Cannot connect socket: missing token or userId");
      return;
    }

    if (isConnectedRef.current) {
      console.log("Socket already connected");
      return;
    }

    console.log("Connecting to socket...");
    socketManager.connect(access_token, userId);
    isConnectedRef.current = true;

    // Subscribe to new tasks if callback provided
    if (onNewTask) {
      unsubscribeRef.current = socketManager.onNewTask(onNewTask);
    }
  }, [access_token, userId, onNewTask]);

  /**
   * Disconnect from socket
   */
  const disconnect = useCallback(() => {
    console.log("Disconnecting from socket...");

    // Clean up task subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    socketManager.disconnect();
    isConnectedRef.current = false;
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (!enabled || !autoConnect) return;

    connect();

    return () => {
      disconnect();
    };
  }, [enabled, autoConnect, connect, disconnect]);

  return {
    /**
     * Whether the socket is currently connected
     */
    isConnected: isConnectedRef.current,

    /**
     * Manually connect to socket
     */
    connect,

    /**
     * Manually disconnect from socket
     */
    disconnect,

    /**
     * Get the raw socket instance
     */
    getSocket: () => socketManager.getSocket(),
  };
}
