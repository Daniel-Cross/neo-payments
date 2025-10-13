import { Tabs } from "expo-router";
import { useTheme } from "../../src/contexts/ThemeContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { TabName, IconName } from "../../src/constants/enums";

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background.NAVY,
          borderTopColor: theme.background.NAVY,
          height: 80,
        },
        tabBarActiveTintColor: theme.colors.PRIMARY_GREEN_DARK,
        tabBarInactiveTintColor: theme.text.LIGHT_GREY,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name={TabName.HOME} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name={TabName.REQUESTS} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name={TabName.HISTORY} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name={TabName.SETTINGS} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Simple icon component using text symbols
function TabIcon({
  name,
  color,
  size,
}: {
  name: TabName;
  color: string;
  size: number;
}) {
  const { theme } = useTheme();
  const isActive = color === theme.colors.PRIMARY_GREEN_DARK;

  const getIcon = () => {
    switch (name) {
      case TabName.HOME:
        return (
          <MaterialCommunityIcons
            name={
              isActive
                ? IconName.LIGHTNING_BOLT
                : IconName.LIGHTNING_BOLT_OUTLINE
            }
            size={size}
            color={color}
          />
        );
      case TabName.REQUESTS:
        return (
          <MaterialCommunityIcons
            name={
              isActive
                ? IconName.ACCOUNT_ARROW_UP
                : IconName.ACCOUNT_ARROW_UP_OUTLINE
            }
            size={size}
            color={color}
          />
        );
      case TabName.HISTORY:
        return (
          <MaterialCommunityIcons
            name={isActive ? IconName.CLOCK : IconName.CLOCK_OUTLINE}
            size={size}
            color={color}
          />
        );
      case TabName.SETTINGS:
        return (
          <MaterialCommunityIcons
            name={isActive ? IconName.COG : IconName.COG_OUTLINE}
            size={size}
            color={color}
          />
        );
      default:
        return "📱";
    }
  };

  return getIcon();
}
