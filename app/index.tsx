import { Ubuntu_700Bold } from "@expo-google-fonts/ubuntu";
import { router } from "expo-router";
import React, { useEffect, useRef } from 'react';
import {
 View,
 StyleSheet,
 SafeAreaView,
 StatusBar,
 Animated,
 Dimensions,
} from 'react-native';
import {
 useFonts,
 Manrope_400Regular,
 Manrope_500Medium,
 Manrope_600SemiBold,
 Manrope_700Bold,
} from "@expo-google-fonts/manrope";

const { width } = Dimensions.get('window');

export default function AnimatedSplashScreen() {
 const progressAnim = useRef(new Animated.Value(0)).current;
 const fadeAnim = useRef(new Animated.Value(0)).current;
 const scaleAnim = useRef(new Animated.Value(0.8)).current;

 const [fontsLoaded] = useFonts({
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Ubuntu_700Bold
 });


 useEffect(() => {
  // Start animations
  Animated.parallel([
   // Progress bar animation
   Animated.timing(progressAnim, {
    toValue: 1,
    duration: 3000,
    useNativeDriver: false,
   }),
   // Fade in brand text
   Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1500,
    useNativeDriver: true,
   }),
   // Scale up brand text
   Animated.spring(scaleAnim, {
    toValue: 1,
    tension: 50,
    friction: 8,
    useNativeDriver: true,
   }),
  ]).start();

 }, []);

 useEffect(() => {
  // Navigate after animation
  const timer = setTimeout(() => {
    if(fontsLoaded){
     router.replace('/auth');
    }
   // navigation.replace('Onboarding');
   //TODO
   //else check if user is loggedIn -> Redirect To Home
   // check if user is a first timer -> Redirect to signup
   // else check if user token is expired  -> Redirect To signin
   // else   -> Redirect To signin
  }, 3500);

  return () => clearTimeout(timer);
 }, [fontsLoaded]);



 const progressWidth = progressAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, width],
 });

 return (
   <SafeAreaView style={styles.container}>
    <StatusBar hidden={true} />

    {/* Progress bar */}
    <View style={styles.progressContainer}>
     <Animated.View
       style={[
        styles.progressBar,
        { width: progressWidth }
       ]}
     />
    </View>

    {/* Main content */}
    <View style={styles.content}>
     <Animated.Text
       style={[
        styles.brandText,
        {
         opacity: fadeAnim,
         transform: [{ scale: scaleAnim }],
         fontFamily: "Manrope_600SemiBold"
        }
       ]}
     >
      Tanza
     </Animated.Text>
     <Animated.Text
       style={[
        styles.tagline,
        { opacity: fadeAnim, fontFamily: "Ubuntu_700Bold" }
       ]}
     >
      Logistics Made Simple
     </Animated.Text>
    </View>

   </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#008B8B',
 },
 progressContainer: {
  height: 3,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  width: '100%',
 },
 progressBar: {
  height: '100%',
  backgroundColor: '#ffffff',
  borderRadius: 1.5,
 },
 content: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
 brandText: {
  fontSize: 80,
  fontWeight: 'bold',
  color: '#000000',
  letterSpacing: -2,
  marginBottom: 2,
 },
 tagline: {
  fontSize: 16,
  color: '#ffffff',
  fontWeight: '500',
  letterSpacing: 0.5,
 }
});