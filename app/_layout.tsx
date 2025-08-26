import { ReduxProvider } from "@/redux/redux-provider";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ReduxProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: '#fff',
      }} >
    <Stack.Screen name="index" />
    <Stack.Screen name="+not-found" />
  </Stack>
    </ReduxProvider>
  );
}
