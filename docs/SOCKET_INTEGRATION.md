# Socket.IO Integration for Real-Time Tasks

## Overview

This implementation adds real-time task notifications using Socket.IO, allowing the app to instantly receive new task assignments without relying solely on polling.

## Architecture

### 1. Socket Manager (`lib/socket.ts`)

- **Singleton service** managing WebSocket connections
- Handles authentication via JWT token
- Auto-reconnection with exponential backoff
- Channel-based event subscription

### 2. React Hook (`hooks/use-socket-tasks.hook.ts`)

- **React lifecycle integration** for socket connections
- Automatic connection/disconnection on mount/unmount
- Callback-based task event handling
- Configurable auto-connect and enable/disable options

### 3. HomeScreen Integration (`app/(tabs)/index.tsx`)

- Uses `useSocketTasks` hook alongside existing `useTasks` hook
- Maintains polling as fallback (30-second intervals)
- Real-time updates trigger task list refresh

## Backend Protocol

The backend Socket.IO gateway expects:

### Connection

```typescript
// Auth via token in handshake
socket.connect({
  auth: { token: "your-jwt-token" },
});
```

### Joining Channels

```typescript
// Client emits 'join' with channel name
socket.emit("join", "user.{userId}.pending.task");

// Server responds with 'joined' confirmation
socket.on("joined", ({ channel }) => {
  console.log("Joined:", channel);
});
```

### Receiving Tasks

```typescript
// Listen on user-specific task channel
socket.on("user.{userId}.pending.task", (task) => {
  console.log("New task:", task);
});
```

## Usage Examples

### Basic Usage (Already Implemented in HomeScreen)

```tsx
import { useSocketTasks } from "@/hooks/use-socket-tasks.hook";

export default function HomeScreen() {
  useSocketTasks({
    onNewTask: (task) => {
      console.log("New task received:", task);
      // Refresh task list
      refetchTasks();
    },
  });
}
```

### Manual Control

```tsx
const { isConnected, connect, disconnect } = useSocketTasks({
  autoConnect: false,
  onNewTask: handleNewTask,
});

// Later...
useEffect(() => {
  if (someCondition) {
    connect();
  }
  return () => disconnect();
}, [someCondition]);
```

### Conditional Enabling

```tsx
useSocketTasks({
  enabled: user?.isPremium === true,
  onNewTask: handleNewTask,
});
```

## Configuration

### Socket URL

The socket URL is automatically derived from `BASE_URL` in `lib/api.ts`:

- Extracts hostname from BASE_URL
- Uses port **3006** (as per backend gateway)
- Example: `http://localhost:3030` → `http://localhost:3006`

### Reconnection Settings

```typescript
reconnectionAttempts: 5,
reconnectionDelay: 1000,      // Initial delay (ms)
reconnectionDelayMax: 5000,   // Max delay (ms)
```

## Benefits

1. **Instant Updates**: No waiting for polling interval
2. **Reduced Server Load**: Less frequent polling needed
3. **Better UX**: Immediate task notifications
4. **Graceful Fallback**: Polling continues as backup
5. **Auto-Reconnection**: Handles network disruptions

## Error Handling

- **Connection failures**: Automatically retries up to 5 times
- **Auth errors**: Disconnects immediately if token invalid
- **Network issues**: Exponential backoff reconnection
- **Missing dependencies**: Logs warnings, doesn't crash

## Debugging

Enable console logs to monitor socket activity:

- `✅ Socket connected` - Successful connection
- `👥 Joined channel` - Successfully subscribed
- `📦 Received new task` - Task event received
- `❌ Connection error` - Auth or network issue
- `🔌 Disconnected` - Connection closed

## Future Enhancements

- [ ] Add TypeScript types for task events
- [ ] Implement task updates (not just new tasks)
- [ ] Add connection status UI indicator
- [ ] Implement offline queue for failed events
- [ ] Add metrics/analytics for socket performance
