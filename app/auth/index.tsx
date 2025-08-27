// OnboardingScreen.tsx
import { manropeFonts } from "@/theme/fonts";
import { router } from "expo-router";
import React from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 Image,
 Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.content}>
		 <View style={styles.imageContainer}>
			<Image
				source={require('@/assets/images/auth/onboarding.jpg')}
				style={styles.heroImage}
				resizeMode="cover"
			/>
		 </View>

		 <View style={styles.textContainer}>
			<Text style={styles.title}>Get started with Tanza</Text>
			<Text style={styles.subtitle}>
			 Fast, reliable logistics solutions at your fingertips
			</Text>
		 </View>

		 <TouchableOpacity
			 style={styles.continueButton}
			 onPress={() => { router.replace('/auth/mobile-entry')}}
		 >
			<Text style={styles.continueText}>Continue</Text>
			<Text style={styles.arrow}>→</Text>
		 </TouchableOpacity>
		</View>
	 </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
	flex: 1,
	backgroundColor: '#fff',
	fontFamily: manropeFonts.medium,
 },
 content: {
	flex: 1,
	paddingHorizontal: 24,
 },
 skipContainer: {
	alignItems: 'flex-end',
	paddingTop: 16,
 },
 skipButton: {
	paddingHorizontal: 16,
	paddingVertical: 8,
	backgroundColor: '#f5f5f5',
	borderRadius: 20,
 },
 skipText: {
	fontSize: 16,
	color: '#666',
 },
 imageContainer: {
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	paddingVertical: 40,
 },
 heroImage: {
	width: width * 0.8,
	height: height * 0.6,
	borderRadius: 20,
 },
 textContainer: {
	paddingBottom: 40,
 },
 title: {
	fontSize: 32,
	fontWeight: 'bold',
	color: '#000',
	marginBottom: 12,
 },
 subtitle: {
	fontSize: 16,
	color: '#666',
	lineHeight: 24,
 },
 continueButton: {
	backgroundColor: '#008B8B',
	paddingVertical: 16,
	borderRadius: 12,
	flexDirection: 'row',
	justifyContent: 'center',
	alignItems: 'center',
	marginBottom: 40,
	cursor: 'pointer',
 },
 continueText: {
	color: '#fff',
	fontSize: 18,
	fontWeight: '600',
	marginRight: 8,
 },
 arrow: {
	color: '#fff',
	fontSize: 18,
	fontWeight: 'bold',
 },
});