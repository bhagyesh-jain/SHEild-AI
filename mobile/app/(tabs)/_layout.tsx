import { Tabs } from "expo-router";
import { View, Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0B0F19",
          borderTopColor: "#1F2937",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: "#42D6BD",
        tabBarInactiveTintColor: "#6B7280"
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "SOS Alert",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🚨</Text>
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: "Safe Journey",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📍</Text>
        }}
      />
      <Tabs.Screen
        name="guardians"
        options={{
          title: "Guardians",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>🛡️</Text>
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18 }}>📜</Text>
        }}
      />
    </Tabs>
  );
}
