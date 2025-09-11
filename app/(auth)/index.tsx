// OnboardingScreen.tsx
import { poppinsFonts } from "@/theme/fonts";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue(n * UI_SCALE);

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/auth/onboarding.jpg")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} allowFontScaling={false}>
            Get started with Tanza
          </Text>
          <Text style={styles.subtitle} allowFontScaling={false}>
            Fast, reliable logistics solutions at your fingertips
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            router.replace("/(auth)/mobile-entry");
          }}
        >
          <Text style={styles.continueText} allowFontScaling={false}>
            Continue
          </Text>
          <Text style={styles.arrow} allowFontScaling={false}>
            →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    fontFamily: poppinsFonts.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipContainer: {
    alignItems: "flex-end",
    paddingTop: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  skipText: {
    fontSize: rs(16),
    color: "#666",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  heroImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 3 / 4,
    resizeMode: "contain",
    borderRadius: 20,
  },
  textContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: rs(30),
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: rs(16),
    color: "#666",
    lineHeight: rs(24),
  },
  continueButton: {
    backgroundColor: "#00B624",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    cursor: "pointer",
  },
  continueText: {
    color: "#fff",
    fontSize: rs(18),
    fontWeight: "600",
    marginRight: 8,
  },
  arrow: {
    color: "#fff",
    fontSize: rs(18),
    fontWeight: "bold",
  },
});
