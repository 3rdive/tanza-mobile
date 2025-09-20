"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
 View,
 Text,
 ScrollView,
 TouchableOpacity,
 Image,
 Alert,
 Animated,
 Modal,
 Dimensions,
 PanResponder,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

const { height: screenHeight } = Dimensions.get("window")

interface RiderProfile {
 id: string
 name: string
 email: string
 phone: string
 profilePicture?: string
 deliveryMode: "bike" | "car" | "bicycle"
 rating: number
 totalDeliveries: number
}

interface Document {
 id: string
 type: "license" | "insurance" | "registration"
 name: string
 status: "pending" | "approved" | "rejected"
 uploadDate: string
 expiryDate?: string
}

const RiderProfileScreen: React.FC = () => {
 const [profile, setProfile] = useState<RiderProfile>({
	id: "1",
	name: "John Doe",
	email: "john.doe@example.com",
	phone: "+1234567890",
	deliveryMode: "bike",
	rating: 4.8,
	totalDeliveries: 156,
 })

 const [documents, setDocuments] = useState<Document[]>([
	{
	 id: "1",
	 type: "license",
	 name: "Driver's License",
	 status: "approved",
	 uploadDate: "2024-01-15",
	 expiryDate: "2026-01-15",
	},
	{
	 id: "2",
	 type: "insurance",
	 name: "Vehicle Insurance",
	 status: "pending",
	 uploadDate: "2024-01-20",
	 expiryDate: "2025-01-20",
	},
	{
	 id: "3",
	 type: "registration",
	 name: "Vehicle Registration",
	 status: "rejected",
	 uploadDate: "2024-01-10",
	 expiryDate: "2025-12-31",
	},
 ])

 const [showNotificationsModal, setShowNotificationsModal] = useState(false)
 const slideAnim = useRef(new Animated.Value(screenHeight)).current
 const backdropOpacity = useRef(new Animated.Value(0)).current

 const panResponder = PanResponder.create({
	onMoveShouldSetPanResponder: (_, gestureState) => {
	 return Math.abs(gestureState.dy) > 10
	},
	onPanResponderMove: (_, gestureState) => {
	 if (gestureState.dy > 0) {
		slideAnim.setValue(gestureState.dy)
	 }
	},
	onPanResponderRelease: (_, gestureState) => {
	 if (gestureState.dy > 100) {
		closeNotificationsModal()
	 } else {
		Animated.spring(slideAnim, {
		 toValue: 0,
		 useNativeDriver: true,
		}).start()
	 }
	},
 })

 const openNotificationsModal = () => {
	setShowNotificationsModal(true)
	Animated.parallel([
	 Animated.timing(slideAnim, {
		toValue: 0,
		duration: 300,
		useNativeDriver: true,
	 }),
	 Animated.timing(backdropOpacity, {
		toValue: 0.5,
		duration: 300,
		useNativeDriver: true,
	 }),
	]).start()
 }

 const closeNotificationsModal = () => {
	Animated.parallel([
	 Animated.timing(slideAnim, {
		toValue: screenHeight,
		duration: 300,
		useNativeDriver: true,
	 }),
	 Animated.timing(backdropOpacity, {
		toValue: 0,
		duration: 300,
		useNativeDriver: true,
	 }),
	]).start(() => {
	 setShowNotificationsModal(false)
	 slideAnim.setValue(screenHeight)
	})
 }

 const getStatusColor = (status: Document["status"]) => {
	switch (status) {
	 case "approved":
		return "#00B624"
	 case "pending":
		return "#FFA500"
	 case "rejected":
		return "#FF4444"
	 default:
		return "#666"
	}
 }

 const getStatusIcon = (status: Document["status"]) => {
	switch (status) {
	 case "approved":
		return "checkmark-circle"
	 case "pending":
		return "time"
	 case "rejected":
		return "close-circle"
	 default:
		return "document"
	}
 }

 const handleDeliveryModeChange = (mode: "bike" | "car" | "bicycle") => {
	setProfile((prev) => ({ ...prev, deliveryMode: mode }))
 }

 const handleDocumentUpload = (documentType: Document["type"]) => {
	Alert.alert("Upload Document", `Select ${documentType} document to upload`, [
	 { text: "Camera", onPress: () => console.log("Camera selected") },
	 { text: "Gallery", onPress: () => console.log("Gallery selected") },
	 { text: "Cancel", style: "cancel" },
	])
 }

 const handleLogout = () => {
	Alert.alert("Logout", "Are you sure you want to logout?", [
	 { text: "Cancel", style: "cancel" },
	 { text: "Logout", style: "destructive", onPress: () => router.replace("/") },
	])
 }

 return (
	 <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
		{/* Header */}
		<View
			style={{
			 backgroundColor: "#00B624",
			 paddingTop: 50,
			 paddingBottom: 20,
			 paddingHorizontal: 20,
			}}
		>
		 <View
			 style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
			 }}
		 >
			<TouchableOpacity onPress={() => router.back()}>
			 <Ionicons name="arrow-back" size={24} color="white" />
			</TouchableOpacity>
			<Text
				style={{
				 fontSize: 20,
				 fontWeight: "bold",
				 color: "white",
				}}
			>
			 Profile
			</Text>
			<TouchableOpacity>
			 <Ionicons name="settings-outline" size={24} color="white" />
			</TouchableOpacity>
		 </View>
		</View>

		<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
		 {/* Profile Header */}
		 <View
			 style={{
				backgroundColor: "white",
				padding: 20,
				alignItems: "center",
				borderBottomWidth: 1,
				borderBottomColor: "#f0f0f0",
			 }}
		 >
			<View
				style={{
				 width: 100,
				 height: 100,
				 borderRadius: 50,
				 backgroundColor: "#00B624",
				 alignItems: "center",
				 justifyContent: "center",
				 marginBottom: 15,
				}}
			>
			 {profile.profilePicture ? (
				 <Image source={{ uri: profile.profilePicture }} style={{ width: 100, height: 100, borderRadius: 50 }} />
			 ) : (
				 <Text style={{ fontSize: 36, fontWeight: "bold", color: "white" }}>
					{profile.name
						.split(" ")
						.map((n) => n[0])
						.join("")}
				 </Text>
			 )}
			</View>
			<Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>{profile.name}</Text>
			<Text style={{ fontSize: 16, color: "#666", marginBottom: 10 }}>{profile.email}</Text>
			<View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
			 <View style={{ alignItems: "center" }}>
				<Text style={{ fontSize: 20, fontWeight: "bold", color: "#00B624" }}>{profile.rating}</Text>
				<Text style={{ fontSize: 12, color: "#666" }}>Rating</Text>
			 </View>
			 <View style={{ alignItems: "center" }}>
				<Text style={{ fontSize: 20, fontWeight: "bold", color: "#00B624" }}>{profile.totalDeliveries}</Text>
				<Text style={{ fontSize: 12, color: "#666" }}>Deliveries</Text>
			 </View>
			</View>
		 </View>

		 {/* Personal Information */}
		 <View
			 style={{
				backgroundColor: "white",
				marginTop: 10,
				paddingHorizontal: 20,
				paddingVertical: 15,
			 }}
		 >
			<Text
				style={{
				 fontSize: 18,
				 fontWeight: "bold",
				 color: "#333",
				 marginBottom: 15,
				}}
			>
			 Personal Information
			</Text>

			<TouchableOpacity
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				 borderBottomWidth: 1,
				 borderBottomColor: "#f0f0f0",
				}}
			>
			 <View>
				<Text style={{ fontSize: 16, color: "#333" }}>Name</Text>
				<Text style={{ fontSize: 14, color: "#666" }}>{profile.name}</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#666" />
			</TouchableOpacity>

			<TouchableOpacity
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				 borderBottomWidth: 1,
				 borderBottomColor: "#f0f0f0",
				}}
			>
			 <View>
				<Text style={{ fontSize: 16, color: "#333" }}>Phone</Text>
				<Text style={{ fontSize: 14, color: "#666" }}>{profile.phone}</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#666" />
			</TouchableOpacity>

			<TouchableOpacity
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				}}
			>
			 <View>
				<Text style={{ fontSize: 16, color: "#333" }}>Email</Text>
				<Text style={{ fontSize: 14, color: "#666" }}>{profile.email}</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#666" />
			</TouchableOpacity>
		 </View>

		 {/* Delivery Mode */}
		 <View
			 style={{
				backgroundColor: "white",
				marginTop: 10,
				paddingHorizontal: 20,
				paddingVertical: 15,
			 }}
		 >
			<Text
				style={{
				 fontSize: 18,
				 fontWeight: "bold",
				 color: "#333",
				 marginBottom: 15,
				}}
			>
			 Delivery Mode
			</Text>

			<View style={{ flexDirection: "row", gap: 10 }}>
			 {(["bike", "car", "bicycle"] as const).map((mode) => (
				 <TouchableOpacity
					 key={mode}
					 onPress={() => handleDeliveryModeChange(mode)}
					 style={{
						flex: 1,
						padding: 15,
						borderRadius: 10,
						borderWidth: 2,
						borderColor: profile.deliveryMode === mode ? "#00B624" : "#e0e0e0",
						backgroundColor: profile.deliveryMode === mode ? "#f0fff4" : "white",
						alignItems: "center",
					 }}
				 >
					<Ionicons
						name={mode === "bike" ? "bicycle" : mode === "car" ? "car" : "bicycle"}
						size={24}
						color={profile.deliveryMode === mode ? "#00B624" : "#666"}
					/>
					<Text
						style={{
						 fontSize: 14,
						 fontWeight: profile.deliveryMode === mode ? "bold" : "normal",
						 color: profile.deliveryMode === mode ? "#00B624" : "#666",
						 marginTop: 5,
						 textTransform: "capitalize",
						}}
					>
					 {mode}
					</Text>
				 </TouchableOpacity>
			 ))}
			</View>
		 </View>

		 {/* Documents */}
		 <View
			 style={{
				backgroundColor: "white",
				marginTop: 10,
				paddingHorizontal: 20,
				paddingVertical: 15,
			 }}
		 >
			<Text
				style={{
				 fontSize: 18,
				 fontWeight: "bold",
				 color: "#333",
				 marginBottom: 15,
				}}
			>
			 Documents
			</Text>

			{documents.map((doc) => (
				<TouchableOpacity
					key={doc.id}
					onPress={() => handleDocumentUpload(doc.type)}
					style={{
					 flexDirection: "row",
					 alignItems: "center",
					 justifyContent: "space-between",
					 paddingVertical: 12,
					 borderBottomWidth: 1,
					 borderBottomColor: "#f0f0f0",
					}}
				>
				 <View style={{ flex: 1 }}>
					<Text style={{ fontSize: 16, color: "#333" }}>{doc.name}</Text>
					<Text style={{ fontSize: 12, color: "#666" }}>
					 Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
					</Text>
					{doc.expiryDate && (
						<Text style={{ fontSize: 12, color: "#666" }}>
						 Expires: {new Date(doc.expiryDate).toLocaleDateString()}
						</Text>
					)}
				 </View>
				 <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
					<View
						style={{
						 flexDirection: "row",
						 alignItems: "center",
						 backgroundColor: getStatusColor(doc.status) + "20",
						 paddingHorizontal: 8,
						 paddingVertical: 4,
						 borderRadius: 12,
						}}
					>
					 <Ionicons name={getStatusIcon(doc.status)} size={12} color={getStatusColor(doc.status)} />
					 <Text
						 style={{
							fontSize: 12,
							color: getStatusColor(doc.status),
							marginLeft: 4,
							textTransform: "capitalize",
						 }}
					 >
						{doc.status}
					 </Text>
					</View>
					<Ionicons name="chevron-forward" size={20} color="#666" />
				 </View>
				</TouchableOpacity>
			))}
		 </View>

		 {/* Settings */}
		 <View
			 style={{
				backgroundColor: "white",
				marginTop: 10,
				paddingHorizontal: 20,
				paddingVertical: 15,
			 }}
		 >
			<Text
				style={{
				 fontSize: 18,
				 fontWeight: "bold",
				 color: "#333",
				 marginBottom: 15,
				}}
			>
			 Settings
			</Text>

			<TouchableOpacity
				onPress={openNotificationsModal}
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				 borderBottomWidth: 1,
				 borderBottomColor: "#f0f0f0",
				}}
			>
			 <View style={{ flexDirection: "row", alignItems: "center" }}>
				<Ionicons name="notifications-outline" size={20} color="#666" />
				<Text style={{ fontSize: 16, color: "#333", marginLeft: 10 }}>Notifications</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#666" />
			</TouchableOpacity>

			<TouchableOpacity
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				 borderBottomWidth: 1,
				 borderBottomColor: "#f0f0f0",
				}}
			>
			 <View style={{ flexDirection: "row", alignItems: "center" }}>
				<Ionicons name="help-circle-outline" size={20} color="#666" />
				<Text style={{ fontSize: 16, color: "#333", marginLeft: 10 }}>Help & Support</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#666" />
			</TouchableOpacity>

			<TouchableOpacity
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				 borderBottomWidth: 1,
				 borderBottomColor: "#f0f0f0",
				}}
			>
			 <View style={{ flexDirection: "row", alignItems: "center" }}>
				<Ionicons name="shield-outline" size={20} color="#666" />
				<Text style={{ fontSize: 16, color: "#333", marginLeft: 10 }}>Privacy & Policy</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#666" />
			</TouchableOpacity>

			<TouchableOpacity
				onPress={handleLogout}
				style={{
				 flexDirection: "row",
				 alignItems: "center",
				 justifyContent: "space-between",
				 paddingVertical: 12,
				}}
			>
			 <View style={{ flexDirection: "row", alignItems: "center" }}>
				<Ionicons name="log-out-outline" size={20} color="#FF4444" />
				<Text style={{ fontSize: 16, color: "#FF4444", marginLeft: 10 }}>Logout</Text>
			 </View>
			 <Ionicons name="chevron-forward" size={20} color="#FF4444" />
			</TouchableOpacity>
		 </View>

		 <View style={{ height: 20 }} />
		</ScrollView>

		{/* Notifications Bottom Sheet Modal */}
		<Modal visible={showNotificationsModal} transparent animationType="none" onRequestClose={closeNotificationsModal}>
		 <View style={{ flex: 1 }}>
			<Animated.View
				style={{
				 position: "absolute",
				 top: 0,
				 left: 0,
				 right: 0,
				 bottom: 0,
				 backgroundColor: "black",
				 opacity: backdropOpacity,
				}}
			>
			 <TouchableOpacity style={{ flex: 1 }} onPress={closeNotificationsModal} />
			</Animated.View>

			<Animated.View
				style={{
				 position: "absolute",
				 bottom: 0,
				 left: 0,
				 right: 0,
				 height: screenHeight * 0.8,
				 backgroundColor: "white",
				 borderTopLeftRadius: 20,
				 borderTopRightRadius: 20,
				 transform: [{ translateY: slideAnim }],
				}}
				{...panResponder.panHandlers}
			>
			 {/* Handle */}
			 <View
				 style={{
					width: 40,
					height: 4,
					backgroundColor: "#ccc",
					borderRadius: 2,
					alignSelf: "center",
					marginTop: 10,
					marginBottom: 20,
				 }}
			 />

			 {/* Header */}
			 <View
				 style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					paddingHorizontal: 20,
					paddingBottom: 20,
					borderBottomWidth: 1,
					borderBottomColor: "#f0f0f0",
				 }}
			 >
				<Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>Notification Settings</Text>
				<TouchableOpacity onPress={closeNotificationsModal}>
				 <Ionicons name="close" size={24} color="#666" />
				</TouchableOpacity>
			 </View>

			 {/* Notification Options */}
			 <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
				<View style={{ paddingVertical: 20 }}>
				 <View
					 style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingVertical: 15,
						borderBottomWidth: 1,
						borderBottomColor: "#f0f0f0",
					 }}
				 >
					<View>
					 <Text style={{ fontSize: 16, color: "#333" }}>Push Notifications</Text>
					 <Text style={{ fontSize: 14, color: "#666" }}>Receive notifications for new orders</Text>
					</View>
					<View
						style={{
						 width: 50,
						 height: 30,
						 borderRadius: 15,
						 backgroundColor: "#00B624",
						 justifyContent: "center",
						 paddingHorizontal: 2,
						}}
					>
					 <View
						 style={{
							width: 26,
							height: 26,
							borderRadius: 13,
							backgroundColor: "white",
							alignSelf: "flex-end",
						 }}
					 />
					</View>
				 </View>

				 <View
					 style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingVertical: 15,
						borderBottomWidth: 1,
						borderBottomColor: "#f0f0f0",
					 }}
				 >
					<View>
					 <Text style={{ fontSize: 16, color: "#333" }}>Sound</Text>
					 <Text style={{ fontSize: 14, color: "#666" }}>Play sound for notifications</Text>
					</View>
					<View
						style={{
						 width: 50,
						 height: 30,
						 borderRadius: 15,
						 backgroundColor: "#e0e0e0",
						 justifyContent: "center",
						 paddingHorizontal: 2,
						}}
					>
					 <View
						 style={{
							width: 26,
							height: 26,
							borderRadius: 13,
							backgroundColor: "white",
							alignSelf: "flex-start",
						 }}
					 />
					</View>
				 </View>

				 <View
					 style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingVertical: 15,
						borderBottomWidth: 1,
						borderBottomColor: "#f0f0f0",
					 }}
				 >
					<View>
					 <Text style={{ fontSize: 16, color: "#333" }}>Vibration</Text>
					 <Text style={{ fontSize: 14, color: "#666" }}>Vibrate for notifications</Text>
					</View>
					<View
						style={{
						 width: 50,
						 height: 30,
						 borderRadius: 15,
						 backgroundColor: "#00B624",
						 justifyContent: "center",
						 paddingHorizontal: 2,
						}}
					>
					 <View
						 style={{
							width: 26,
							height: 26,
							borderRadius: 13,
							backgroundColor: "white",
							alignSelf: "flex-end",
						 }}
					 />
					</View>
				 </View>

				 <View
					 style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingVertical: 15,
					 }}
				 >
					<View>
					 <Text style={{ fontSize: 16, color: "#333" }}>Email Notifications</Text>
					 <Text style={{ fontSize: 14, color: "#666" }}>Receive email updates</Text>
					</View>
					<View
						style={{
						 width: 50,
						 height: 30,
						 borderRadius: 15,
						 backgroundColor: "#e0e0e0",
						 justifyContent: "center",
						 paddingHorizontal: 2,
						}}
					>
					 <View
						 style={{
							width: 26,
							height: 26,
							borderRadius: 13,
							backgroundColor: "white",
							alignSelf: "flex-start",
						 }}
					 />
					</View>
				 </View>
				</View>
			 </ScrollView>
			</Animated.View>
		 </View>
		</Modal>
	 </View>
 )
}

export default RiderProfileScreen
