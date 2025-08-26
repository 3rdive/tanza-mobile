// SignInScreen.tsx
import { router } from "expo-router";
import React, { useState, useRef } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 TextInput,
 ActivityIndicator,
 Animated,
 Alert,
} from 'react-native';

export default function SignInScreen() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const fadeAnim = useRef(new Animated.Value(0)).current;

 const validateEmail = (email: string) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
 };

 const handleContinue = async () => {
	if (!showPassword) {
	 // First step - validate email and show loading
	 if (!validateEmail(email)) {
		Alert.alert('Invalid Email', 'Please enter a valid email address');
		return;
	 }

	 setIsLoading(true);

	 // Simulate API call to check if email exists
	 setTimeout(() => {
		setIsLoading(false);
		setShowPassword(true);

		// <CHANGE> Start animation immediately after showing password field
		setTimeout(() => {
		 Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 300,
			useNativeDriver: true,
		 }).start();
		}, 50);
	 }, 4000);
	} else {
	 // Second step - handle sign in
	 if (!password) {
		Alert.alert('Missing Password', 'Please enter your password');
		return;
	 }

	 setIsLoading(true);

	 // Simulate sign in process
	 setTimeout(() => {
		setIsLoading(false);
		Alert.alert('Success', 'Signed in successfully!', [
		 { text: 'OK', onPress: () => {/**/} }
		]);
	 }, 2000);
	}
 };

 const handleBack = () => {
	if (showPassword) {
	 // <CHANGE> Reset animation value when going back
	 fadeAnim.setValue(0);
	 setShowPassword(false);
	 setPassword('');
	} else {
	 router.canGoBack() && router.back();
	}
 };

 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.content}>
		 {showPassword &&
				 <TouchableOpacity
			 style={ styles.backButton }
			 onPress={ handleBack }
		 >
			<Text style={ styles.backArrow }>←</Text>
		 </TouchableOpacity> }

		 <View style={styles.header}>
			<Text style={styles.title}>Welcome back</Text>
			<Text style={styles.subtitle}>
			 {!showPassword
				 ? 'Enter your email to continue'
				 : 'Enter your password to sign in'
			 }
			</Text>
		 </View>

		 <View style={styles.formContainer}>
			{/* Email Field */}
			<View style={styles.inputContainer}>
			 <Text style={styles.label}>Email</Text>
			 <TextInput
				 style={[
					styles.input,
					showPassword && styles.inputDisabled
				 ]}
				 placeholder="name@example.com"
				 value={email}
				 onChangeText={setEmail}
				 keyboardType="email-address"
				 autoCapitalize="none"
				 autoCorrect={false}
				 editable={!showPassword && !isLoading}
			 />
			</View>

			{/* Password Field - Fixed Animation */}
			{showPassword && (
				<Animated.View
					style={[
					 styles.inputContainer,
					 {
						opacity: fadeAnim,
						transform: [{
						 translateY: fadeAnim.interpolate({
							inputRange: [0, 1],
							outputRange: [20, 0]
						 })
						}]
					 }
					]}
				>
				 <Text style={styles.label}>Password</Text>
				 <TextInput
					 style={styles.input}
					 placeholder="Enter your password"
					 value={password}
					 onChangeText={setPassword}
					 secureTextEntry
					 autoCapitalize="none"
					 editable={!isLoading}
					 autoFocus={true}
				 />
				</Animated.View>
			)}

			{/* Loading State */}
			{isLoading && (
				<View style={styles.loadingContainer}>
				 <ActivityIndicator size="large" color="#000" />
				 <Text style={styles.loadingText}>
					{!showPassword ? 'Checking your account...' : 'Signing you in...'}
				 </Text>
				</View>
			)}
		 </View>

		 {/* Continue Button */}
		 <TouchableOpacity
			 style={[
				styles.continueButton,
				((!validateEmail(email) && !showPassword) || (showPassword && !password) || isLoading) && styles.disabledButton
			 ]}
			 onPress={handleContinue}
			 disabled={(!validateEmail(email) && !showPassword) || (showPassword && !password) || isLoading}
		 >
			<Text style={[
			 styles.continueText,
			 ((!validateEmail(email) && !showPassword) || (showPassword && !password) || isLoading) && styles.disabledText
			]}>
			 {!showPassword ? 'Continue' : 'Sign In'}
			</Text>
		 </TouchableOpacity>

		 {/* Alternative Options */}
		 {!showPassword && !isLoading && (
			 <View style={styles.alternativeContainer}>
				<View style={styles.divider}>
				 <View style={styles.line} />
				 <Text style={styles.orText}>or</Text>
				 <View style={styles.line} />
				</View>

				<TouchableOpacity
					style={styles.createAccountButton}
					onPress={() => router.replace('/auth/mobile-entry')}
				>
				 <Text style={styles.createAccountText}>
					Don&#39;t have an account? Create one
				 </Text>
				</TouchableOpacity>
			 </View>
		 )}

		 {/* Forgot Password */}
		 {showPassword && !isLoading && (
			 <TouchableOpacity style={styles.forgotPasswordButton}>
				<Text style={styles.forgotPasswordText}>Forgot password?</Text>
			 </TouchableOpacity>
		 )}
		</View>
	 </SafeAreaView>
 );
}
const styles = StyleSheet.create({
 container: {
	flex: 1,
	backgroundColor: '#fff',
 },
 content: {
	flex: 1,
	paddingHorizontal: 24,
	paddingTop: 20,
 },
 backButton: {
	width: 40,
	height: 40,
	justifyContent: 'center',
	marginBottom: 20,
 },
 backArrow: {
	fontSize: 24,
	color: '#000',
 },
 header: {
	marginBottom: 40,
 },
 title: {
	fontSize: 32,
	fontWeight: 'bold',
	color: '#000',
	marginBottom: 8,
 },
 subtitle: {
	fontSize: 16,
	color: '#666',
	lineHeight: 22,
 },
 formContainer: {
	flex: 1,
 },
 inputContainer: {
	marginBottom: 24,
 },
 label: {
	fontSize: 16,
	color: '#000',
	marginBottom: 8,
	fontWeight: '500',
 },
 input: {
	borderWidth: 2,
	borderColor: '#e0e0e0',
	borderRadius: 12,
	paddingHorizontal: 16,
	paddingVertical: 16,
	fontSize: 16,
	backgroundColor: '#fff',
 },
 inputDisabled: {
	backgroundColor: '#f5f5f5',
	borderColor: '#d0d0d0',
	color: '#666',
 },
 loadingContainer: {
	alignItems: 'center',
	paddingVertical: 40,
 },
 loadingText: {
	fontSize: 16,
	color: '#666',
	marginTop: 16,
 },
 continueButton: {
	backgroundColor: '#000',
	paddingVertical: 16,
	borderRadius: 12,
	alignItems: 'center',
	marginBottom: 30,
 },
 disabledButton: {
	backgroundColor: '#ccc',
 },
 continueText: {
	color: '#fff',
	fontSize: 18,
	fontWeight: '600',
 },
 disabledText: {
	color: '#999',
 },
 alternativeContainer: {
	marginBottom: 40,
 },
 divider: {
	flexDirection: 'row',
	alignItems: 'center',
	marginBottom: 24,
 },
 line: {
	flex: 1,
	height: 1,
	backgroundColor: '#e0e0e0',
 },
 orText: {
	marginHorizontal: 16,
	color: '#666',
	fontSize: 16,
 },
 createAccountButton: {
	alignItems: 'center',
	paddingVertical: 12,
 },
 createAccountText: {
	fontSize: 16,
	color: '#000',
	fontWeight: '500',
 },
 forgotPasswordButton: {
	alignItems: 'center',
	paddingVertical: 12,
	marginBottom: 40,
 },
 forgotPasswordText: {
	fontSize: 16,
	color: '#000',
	fontWeight: '500',
 },
});