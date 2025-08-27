// ResetOTPScreen.tsx
import { usePasswordResetFlow } from "@/redux/hooks/hooks";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 TextInput,
 Alert,
 NativeSyntheticEvent,
 TextInputKeyPressEventData,
} from 'react-native';

export default function ValidateOtp() {
 const {mobile, setOtp: setResetOtp} = usePasswordResetFlow();
 const [otp, setOtp] = useState(['', '', '', '']);
 const [timer, setTimer] = useState(60);
 const [isExpired, setIsExpired] = useState(false);
 const [error, setError] = useState('');
 const inputRefs = useRef<React.Ref<TextInput>[]>([]);

 useEffect(() => {
	if(!mobile){
	 router.back();
	}
 }, []);

 useEffect(() => {
	const interval = setInterval(() => {
	 setTimer((prev) => {
		if (prev <= 1) {
		 setIsExpired(true);
		 return 0;
		}
		return prev - 1;
	 });
	}, 1000);
	return () => clearInterval(interval);
 }, []);

 const handleOtpChange = (value: string, index: number) => {
	setError(''); // Clear any previous errors
	const newOtp = [...otp];
	newOtp[index] = value;
	setOtp(newOtp);

	if (value && index < 3) {
	 (inputRefs.current[index + 1] as any).focus();
	}

	// Auto-verify when all digits are entered
	if (newOtp.every(digit => digit !== '')) {
	 setTimeout(() => {
		verifyOTP(newOtp.join(''));
	 }, 500);
	}
 };

 const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
	if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
	 (inputRefs.current[index - 1] as any).focus();
	}
 };

 const verifyOTP = (otpCode: string) => {
	if (isExpired) {
	 setError('Code has expired. Please request a new one.');
	 return;
	}

	// Simulate OTP verification
	const correctOTP = '1234'; // In real app, this would be validated against backend

	if (otpCode === correctOTP) {
	 setResetOtp(otpCode);
	 router.push('/auth/reset_password/new-password-screen')
	} else {
	 setError('Invalid code. Please try again.');
	 setOtp(['', '', '', '']); // Clear OTP inputs
	 (inputRefs.current[0] as any).focus();
	}
 };

 const handleResendCode = () => {
	if (timer > 0) return;

	setTimer(60);
	setIsExpired(false);
	setError('');
	setOtp(['', '', '', '']);
	Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
 };

 const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
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
			<Text style={styles.title}>Enter verification code</Text>
			<Text style={styles.subtitle}>
			 We sent a 4-digit code to {mobile}
			</Text>
		 </View>

		 <View style={styles.otpContainer}>
			{otp.map((digit, index) => (
				<TextInput
					key={index}
					ref={(ref) => (inputRefs.current[index] = ref as any)}
					style={[
					 styles.otpInput,
					 digit && styles.otpInputFilled,
					 error && styles.otpInputError,
					 isExpired && styles.otpInputExpired
					]}
					value={digit}
					onChangeText={(value) => handleOtpChange(value, index)}
					onKeyPress={(e) => handleKeyPress(e, index)}
					keyboardType="numeric"
					maxLength={1}
					textAlign="center"
					editable={!isExpired}
				/>
			))}
		 </View>

		 {/* Error Message */}
		 {error ? (
			 <Text style={styles.errorText}>{error}</Text>
		 ) : null}

		 {/* Expired Message */}
		 {isExpired && (
			 <Text style={styles.expiredText}>
				Code has expired. Please request a new one.
			 </Text>
		 )}

		 {/* Timer and Resend */}
		 <View style={styles.resendContainer}>
			{timer > 0 ? (
				<Text style={styles.timerText}>
				 Resend code in {formatTime(timer)}
				</Text>
			) : (
				<TouchableOpacity onPress={handleResendCode}>
				 <Text style={styles.resendText}>Resend code</Text>
				</TouchableOpacity>
			)}
		 </View>

		 <TouchableOpacity
			 style={styles.changeEmailButton}
			 onPress={() => router.back()}
		 >
			<Text style={styles.changeEmailText}>
			 Wrong phone number? Change it
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
 otpContainer: {
	flexDirection: 'row',
	justifyContent: 'flex-start',
	marginBottom: 20,
	gap: 12,
 },
 otpInput: {
	width: 60,
	height: 60,
	borderWidth: 2,
	borderColor: '#e0e0e0',
	borderRadius: 12,
	fontSize: 24,
	fontWeight: 'bold',
	textAlign: 'center',
	backgroundColor: '#fff',
 },
 otpInputFilled: {
	borderColor: '#008B8B',
	backgroundColor: '#f0fffe',
 },
 otpInputError: {
	borderColor: '#ff4444',
	backgroundColor: '#fff5f5',
 },
 otpInputExpired: {
	borderColor: '#ccc',
	backgroundColor: '#f5f5f5',
	color: '#999',
 },
 errorText: {
	fontSize: 14,
	color: '#ff4444',
	textAlign: 'center',
	marginBottom: 20,
 },
 expiredText: {
	fontSize: 14,
	color: '#ff6600',
	textAlign: 'center',
	marginBottom: 20,
 },
 resendContainer: {
	alignItems: 'center',
	marginBottom: 30,
 },
 timerText: {
	fontSize: 16,
	color: '#666',
 },
 resendText: {
	fontSize: 16,
	color: '#008B8B',
	fontWeight: '600',
 },
 changeEmailButton: {
	alignItems: 'center',
	paddingVertical: 12,
 },
 changeEmailText: {
	fontSize: 16,
	color: '#008B8B',
	fontWeight: '500',
 },
});