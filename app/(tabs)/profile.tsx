"use client";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useUser, useAppDispatch, useAppSelector } from "../../redux/hooks/hooks";
import { useIsFocused } from "@react-navigation/native";
import { clearSelectedLocation } from "@/redux/slices/locationSearchSlice";
import { userService } from "@/lib/api";

const UI_SCALE = 0.82; // downscale globally
const rs = (n: number) => RFValue(n * UI_SCALE);

export default function ProfileScreen() {
  const { logOut, user, access_token, setUser } = useUser();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const selected = useAppSelector((s) => (s as any).locationSearch?.selected || null);

  const firstName = (user as any)?.firstName || "John";
  const lastName = (user as any)?.lastName || "Doe";
  const email = (user as any)?.email || "john.doe@example.com";
  const mobile = (user as any)?.mobile || "";
  const countryCode = (user as any)?.countryCode || "+234";
  const profileImage = (user as any)?.profilePic || null;
  const phoneNumber = mobile ? `${countryCode}${mobile}` : "";
  const usersAddress = (user as any)?.usersAddress || null;
  const addressName = usersAddress?.name || "Not set";

  const handleEditProfile = () => {
    router.push("/profile/edit-profile");
  };

  const handleChangePassword = () => {
    router.push("/profile/change-password");
  };

  // Apply selected address from full-screen search and update profile
  useEffect(() => {
    const applySelection = async () => {
      if (!isFocused) return;
      if (!selected || (selected as any).context !== "profileAddress") return;
      try {
        const title = (selected as any).title || (selected as any).subtitle || "";
        const lat = (selected as any).lat;
        const lon = (selected as any).lon;
        if (typeof lat === "number" && typeof lon === "number") {
          const resp = await userService.updateProfile({ usersAddress: { name: title, lat, lon } });
          if (resp?.success && resp.data) {
            await setUser({ access_token: access_token || null, user: resp.data as any });
          }
        }
      } catch (_e) {
        // ignore; non-blocking UI update
      } finally {
        dispatch(clearSelectedLocation());
      }
    };
    applySelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, selected]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logOut() },
    ]);
  };

  type ProfileItemProps = {
    label: string;
    value: string;
    onPress: () => void;
    showArrow?: boolean;
  };

  const ProfileItem = ({
    label,
    value,
    onPress,
    showArrow = true,
  }: ProfileItemProps) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemContent}>
        <Text style={styles.profileItemLabel}>{label}</Text>
        <Text style={styles.profileItemValue}>{value}</Text>
      </View>
      {showArrow && <Text style={styles.arrow}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          {/*<Text style={styles.backArrow}>←</Text>*/}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {firstName[0]}
                  {lastName[0]}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {firstName} {lastName}
          </Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <ProfileItem
              label="First Name"
              value={firstName}
              onPress={handleEditProfile}
            />
            <ProfileItem
              label="Last Name"
              value={lastName}
              onPress={handleEditProfile}
            />
            <ProfileItem
              label="Email Address"
              value={email}
              onPress={handleEditProfile}
            />
            <ProfileItem
              label="Phone Number"
              value={phoneNumber}
              onPress={handleEditProfile}
            />
            <ProfileItem
              label="Address"
              value={addressName}
              onPress={() => router.push({ pathname: "/location-search", params: { context: "profileAddress" } })}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <ProfileItem
              label="Password"
              value="••••••••"
              onPress={handleChangePassword}
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.profileItem} onPress={() => router.push("/privacy-policy")}>
              <Text style={styles.accountActionText}>Privacy Policy</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileItem} onPress={() => router.push("/help-support")}>
              <Text style={styles.accountActionText}>Help & Support</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(20),
    paddingVertical: rs(16),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: rs(40),
    height: rs(40),
    justifyContent: "center",
  },
  backArrow: {
    fontSize: rs(22),
    color: "#000",
  },
  headerTitle: {
    fontSize: rs(18),
    fontWeight: "bold",
    color: "#000",
  },
  editButton: {
    fontSize: rs(14),
    color: "#00B624",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: rs(20),
    paddingTop: rs(24),
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: rs(32),
  },
  avatarContainer: {
    marginBottom: rs(16),
  },
  avatar: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
  },
  avatarFallback: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    backgroundColor: "#00B624",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: rs(22),
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: rs(22),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(4),
  },
  userEmail: {
    fontSize: rs(14),
    color: "#666",
  },
  section: {
    marginBottom: rs(24),
  },
  sectionTitle: {
    fontSize: rs(16),
    fontWeight: "bold",
    color: "#000",
    marginBottom: rs(12),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: rs(12),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(16),
    paddingVertical: rs(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: rs(12),
    color: "#666",
    marginBottom: rs(4),
  },
  profileItemValue: {
    fontSize: rs(14),
    color: "#000",
    fontWeight: "500",
  },
  arrow: {
    fontSize: rs(16),
    color: "#ccc",
  },
  accountActionText: {
    fontSize: rs(14),
    color: "#000",
    flex: 1,
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ff4444",
    borderRadius: rs(12),
    paddingVertical: rs(16),
    alignItems: "center",
    marginBottom: rs(40),
  },
  logoutText: {
    fontSize: rs(14),
    color: "#ff4444",
    fontWeight: "600",
  },
});
