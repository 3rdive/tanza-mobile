// ForgotPasswordScreen.tsx
import { usePasswordResetFlow } from "@/redux/hooks/hooks";
import { router } from "expo-router";
import React, { useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 TextInput,
 Alert,
} from 'react-native';

export default function ForgotPasswordScreen() {
 const [mobile, setMobile] = useState('');
 const {setMobile: setResetMobile} = usePasswordResetFlow()

 const validateEmail = (email: string) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
 };

 const handleSendCode = () => {
	if (mobile.length != 10) {
	 Alert.alert('Invalid Mobile', 'Please enter a valid mobile number');
	 return;
	}

	setResetMobile(mobile)
	// Navigate to OTP screen with email
	router.push('/auth/reset_password/validate-otp')
 };

 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.content}>
		 <TouchableOpacity
			 style={styles.backButton}
			 onPress={() => router.back()}
		 >
			<Text style={styles.backArrow}>←</Text>
		 </TouchableOpacity>

		 <View style={styles.header}>
			<Text style={styles.title}>Reset your password</Text>
			<Text style={styles.subtitle}>
			 Enter your Mobile and we&#39;ll send you a code to reset your password
			</Text>
		 </View>

		 <View style={styles.phoneContainer}>
			<TouchableOpacity style={styles.countrySelector}>
			 <Text style={styles.flag}>🇳🇬</Text>
			 <Text style={styles.countryCode}>{}</Text>
			 <Text style={styles.dropdown}>▼</Text>
			</TouchableOpacity>

			<TextInput
				style={styles.phoneInput}
				placeholder="9153065907"
				value={mobile}
				onChangeText={setMobile}
				keyboardType="phone-pad"
				maxLength={10}
			/>
		 </View>


		 <TouchableOpacity
			 style={[
				styles.sendButton,
				mobile.length != 10 && styles.disabledButton
			 ]}
			 onPress={handleSendCode}
			 disabled={mobile.length != 10}
		 >
			<Text style={[
			 styles.sendText,
			 mobile.length != 10 && styles.disabledText
			]}>
			 Send Reset Code
			</Text>
		 </TouchableOpacity>

		 <TouchableOpacity
			 style={styles.backToSignInButton}
			 onPress={() => router.back()}
		 >
			<Text style={styles.backToSignInText}>
			 Remember your password? Sign in
			</Text>
		 </TouchableOpacity>
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
	fontSize: 28,
	fontWeight: 'bold',
	color: '#000',
	marginBottom: 12,
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
 phoneContainer: {
	flexDirection: 'row',
	marginBottom: 30,
 },
 countrySelector: {
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: '#f5f5f5',
	paddingHorizontal: 16,
	paddingVertical: 16,
	borderRadius: 12,
	marginRight: 12,
 },
 flag: {
	fontSize: 20,
	marginRight: 8,
 },
 countryCode: {
	fontSize: 16,
	color: '#000',
	marginRight: 8,
 },
 dropdown: {
	fontSize: 12,
	color: '#666',
 },
 phoneInput: {
	flex: 1,
	backgroundColor: '#f5f5f5',
	paddingHorizontal: 16,
	paddingVertical: 16,
	borderRadius: 12,
	fontSize: 16,
 },
 sendButton: {
	backgroundColor: '#008B8B',
	paddingVertical: 16,
	borderRadius: 12,
	alignItems: 'center',
	marginBottom: 24,
 },
 disabledButton: {
	backgroundColor: '#ccc',
 },
 sendText: {
	color: '#fff',
	fontSize: 18,
	fontWeight: '600',
 },
 disabledText: {
	color: '#999',
 },
 backToSignInButton: {
	alignItems: 'center',
	paddingVertical: 12,
	marginBottom: 40,
 },
 backToSignInText: {
	fontSize: 16,
	color: '#008B8B',
	fontWeight: '500',
 },
});