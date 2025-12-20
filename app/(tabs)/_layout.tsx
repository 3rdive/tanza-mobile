import { usePushNotification } from "@/hooks/notifications.hook";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const { expoPushToken } = usePushNotification();

  console.log("expo-token: ", expoPushToken);
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#00B624", headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="home"
              size={22}
              color={focused ? "#00B624" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="book-order"
        options={{
          title: "Place Order",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="location-arrow"
              size={22}
              color={focused ? "#00B624" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="book-outline"
              size={22}
              color={focused ? "#00B624" : "black"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="user-alt"
              size={22}
              color={focused ? "#00B624" : "black"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
