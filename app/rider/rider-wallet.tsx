"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
 View,
 Text,
 StyleSheet,
 ScrollView,
 TouchableOpacity,
 SafeAreaView,
 Animated,
 Modal,
 TextInput,
 Alert,
 Dimensions,
 Platform,
} from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// TypeScript interfaces
interface Transaction {
 id: string
 type: "delivery" | "withdrawal" | "earning"
 amount: number
 description: string
 date: string
 status: "completed" | "pending" | "failed"
 orderId?: string
}

interface EarningsSummary {
 weekly: number
 monthly: number
 totalEarnings: number
 totalWithdrawals: number
}

interface WithdrawalMethod {
 id: string
 name: string
 type: "bank"
 details: string
 accountNumber?: string
}


//TODO: fix the addPayment modal method & change the payment screen

const RiderWalletScreen: React.FC = () => {
 const [currentBalance] = useState<number>(45750)
 const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false)
 const [showAddMethodModal, setShowAddMethodModal] = useState<boolean>(false)
 const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethod[]>([
	{
	 id: "2",
	 name: "Abiodun Samuel",
	 type: "bank",
	 details: "UBA",
	 accountNumber: "9152384990",
	},
 ])
 const [selectedMethodId, setSelectedMethodId] = useState<string>("")
 const [withdrawAmount, setWithdrawAmount] = useState<string>("")
 const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly">("weekly")
 const [newMethodName, setNewMethodName] = useState<string>("")
 const [newMethodType, setNewMethodType] = useState<"bank">("bank")
 const [newMethodDetails, setNewMethodDetails] = useState<string>("")
 const [newMethodAccount, setNewMethodAccount] = useState<string>("")

 const fadeAnim = useRef(new Animated.Value(0)).current
 const slideAnim = useRef(new Animated.Value(300)).current
 const addMethodFadeAnim = useRef(new Animated.Value(0)).current
 const addMethodSlideAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current

 // Mock data
 const earningsSummary: EarningsSummary = {
	weekly: 12500,
	monthly: 45750,
	totalEarnings: 125000,
	totalWithdrawals: 79250,
 }

 const transactions: Transaction[] = [
	{
	 id: "1",
	 type: "delivery",
	 amount: 2500,
	 description: "Package delivery - Order #TZ001",
	 date: "2024-01-15T10:30:00Z",
	 status: "completed",
	 orderId: "TZ001",
	},
	{
	 id: "2",
	 type: "earning",
	 amount: 1800,
	 description: "Delivery bonus - Peak hours",
	 date: "2024-01-15T08:15:00Z",
	 status: "completed",
	},
	{
	 id: "3",
	 type: "withdrawal",
	 amount: -15000,
	 description: "Bank withdrawal - GTBank",
	 date: "2024-01-14T16:45:00Z",
	 status: "completed",
	},
	{
	 id: "4",
	 type: "delivery",
	 amount: 3200,
	 description: "Package delivery - Order #TZ002",
	 date: "2024-01-14T14:20:00Z",
	 status: "completed",
	 orderId: "TZ002",
	},
	{
	 id: "5",
	 type: "withdrawal",
	 amount: -8000,
	 description: "Bank withdrawal - UBA",
	 date: "2024-01-13T11:30:00Z",
	 status: "pending",
	},
 ]

 const openWithdrawModal = (): void => {
	setShowWithdrawModal(true)
	Animated.parallel([
	 Animated.timing(fadeAnim, {
		toValue: 1,
		duration: 300,
		useNativeDriver: true,
	 }),
	 Animated.timing(slideAnim, {
		toValue: 0,
		duration: 300,
		useNativeDriver: true,
	 }),
	]).start()
 }

 const closeWithdrawModal = (): void => {
	Animated.parallel([
	 Animated.timing(fadeAnim, {
		toValue: 0,
		duration: 300,
		useNativeDriver: true,
	 }),
	 Animated.timing(slideAnim, {
		toValue: 300,
		duration: 300,
		useNativeDriver: true,
	 }),
	]).start(() => {
	 setShowWithdrawModal(false)
	 setWithdrawAmount("")
	 setSelectedMethodId("")
	})
 }

 const openAddMethodModal = (): void => {
	setShowAddMethodModal(true)
	addMethodFadeAnim.setValue(0)
	addMethodSlideAnim.setValue(Dimensions.get("window").height)

	Animated.parallel([
	 Animated.timing(addMethodFadeAnim, {
		toValue: 1,
		duration: 300,
		useNativeDriver: true,
	 }),
	 Animated.timing(addMethodSlideAnim, {
		toValue: 0,
		duration: 300,
		useNativeDriver: true,
	 }),
	]).start()
 }

 const closeAddMethodModal = (): void => {
	Animated.parallel([
	 Animated.timing(addMethodFadeAnim, {
		toValue: 0,
		duration: 300,
		useNativeDriver: true,
	 }),
	 Animated.timing(addMethodSlideAnim, {
		toValue: Dimensions.get("window").height,
		duration: 300,
		useNativeDriver: true,
	 }),
	]).start(() => {
	 setShowAddMethodModal(false)
	 setNewMethodName("")
	 setNewMethodType("bank")
	 setNewMethodDetails("")
	 setNewMethodAccount("")
	})
 }

 const addWithdrawalMethod = (): void => {
	if (!newMethodName || !newMethodDetails || !newMethodAccount) {
	 Alert.alert("Error", "Please fill in all fields")
	 return
	}

	const newMethod: WithdrawalMethod = {
	 id: Date.now().toString(),
	 name: newMethodName,
	 type: newMethodType,
	 details: newMethodDetails,
	 accountNumber: newMethodAccount,
	}

	setWithdrawalMethods((prev) => [...prev, newMethod])
	closeAddMethodModal()
	Alert.alert("Success", "Withdrawal method added successfully")
 }

 const removeWithdrawalMethod = (methodId: string): void => {
	Alert.alert("Remove Method", "Are you sure you want to remove this withdrawal method?", [
	 { text: "Cancel", style: "cancel" },
	 {
		text: "Remove",
		style: "destructive",
		onPress: () => {
		 setWithdrawalMethods((prev) => prev.filter((method) => method.id !== methodId))
		},
	 },
	])
 }

 const handleWithdraw = (): void => {
	const amount = Number.parseFloat(withdrawAmount)
	if (!amount || amount <= 0) {
	 Alert.alert("Error", "Please enter a valid amount")
	 return
	}
	if (amount > currentBalance) {
	 Alert.alert("Error", "Insufficient balance")
	 return
	}
	if (!selectedMethodId) {
	 Alert.alert("Error", "Please select a withdrawal method")
	 return
	}

	const selectedMethod = withdrawalMethods.find((method) => method.id === selectedMethodId)
	if (!selectedMethod) return

	Alert.alert(
		"Withdraw Funds",
		`Withdraw ₦${amount.toLocaleString()} to ${selectedMethod.name} - ${selectedMethod.details} (${selectedMethod.accountNumber})?`,
		[
		 { text: "Cancel", style: "cancel" },
		 {
			text: "Confirm",
			onPress: () => {
			 closeWithdrawModal()
			 Alert.alert("Success", "Withdrawal request submitted successfully")
			},
		 },
		],
	)
 }

 const getTransactionIcon = (type: Transaction["type"]): string => {
	switch (type) {
	 case "delivery":
		return "bicycle"
	 case "earning":
		return "trending-up"
	 case "withdrawal":
		return "arrow-down"
	 default:
		return "wallet"
	}
 }

 const getTransactionColor = (type: Transaction["type"], amount: number): string => {
	if (amount < 0) return "#ef4444"
	return type === "delivery" || type === "earning" ? "#00B624" : "#6b7280"
 }

 const formatDate = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toLocaleDateString("en-US", {
	 month: "short",
	 day: "numeric",
	 hour: "2-digit",
	 minute: "2-digit",
	})
 }

 return (
	 <SafeAreaView style={styles.container}>
		<ScrollView showsVerticalScrollIndicator={false}>
		 {/* Header */}
		 <View style={styles.header}>
			<TouchableOpacity onPress={() => router.back()}>
			 <Ionicons name="arrow-back" size={24} color="#000" />
			</TouchableOpacity>
			<Text style={styles.headerTitle}>Wallet</Text>
			<TouchableOpacity>
			 <Ionicons name="notifications-outline" size={24} color="#000" />
			</TouchableOpacity>
		 </View>

		 {/* Balance Card */}
		 <View style={styles.balanceCard}>
			<Text style={styles.balanceLabel}>Current Balance</Text>
			<Text style={styles.balanceAmount}>₦{currentBalance.toLocaleString()}</Text>
			<View style={styles.balanceActions}>
			 <TouchableOpacity style={styles.withdrawButton} onPress={openWithdrawModal}>
				<Ionicons name="arrow-down" size={20} color="#fff" />
				<Text style={styles.withdrawButtonText}>Withdraw</Text>
			 </TouchableOpacity>
			</View>
		 </View>

		 {/* Earnings Summary */}
		 <View style={styles.summaryCard}>
			<View style={styles.summaryHeader}>
			 <Text style={styles.summaryTitle}>Earnings Summary</Text>
			 <View style={styles.periodToggle}>
				<TouchableOpacity
					style={[styles.periodButton, selectedPeriod === "weekly" && styles.periodButtonActive]}
					onPress={() => setSelectedPeriod("weekly")}
				>
				 <Text style={[styles.periodButtonText, selectedPeriod === "weekly" && styles.periodButtonTextActive]}>
					Weekly
				 </Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.periodButton, selectedPeriod === "monthly" && styles.periodButtonActive]}
					onPress={() => setSelectedPeriod("monthly")}
				>
				 <Text style={[styles.periodButtonText, selectedPeriod === "monthly" && styles.periodButtonTextActive]}>
					Monthly
				 </Text>
				</TouchableOpacity>
			 </View>
			</View>

			<View style={styles.summaryStats}>
			 <View style={styles.statItem}>
				<Text style={styles.statValue}>
				 ₦{(selectedPeriod === "weekly" ? earningsSummary.weekly : earningsSummary.monthly).toLocaleString()}
				</Text>
				<Text style={styles.statLabel}>Total Earnings</Text>
			 </View>
			 <View style={styles.statItem}>
				<Text style={styles.statValue}>₦{earningsSummary.totalWithdrawals.toLocaleString()}</Text>
				<Text style={styles.statLabel}>Total Withdrawals</Text>
			 </View>
			</View>
		 </View>

		 {/* Transaction Logs */}
		 <View style={styles.transactionSection}>
			<View style={styles.sectionHeader}>
			 <Text style={styles.sectionTitle}>Recent Transactions</Text>
			 <TouchableOpacity>
				<Text style={styles.viewAllText}>View All</Text>
			 </TouchableOpacity>
			</View>

			{transactions.map((transaction) => (
				<TouchableOpacity key={transaction.id} style={styles.transactionItem}>
				 <View style={styles.transactionIcon}>
					<Ionicons
						name={getTransactionIcon(transaction.type) as any}
						size={20}
						color={getTransactionColor(transaction.type, transaction.amount)}
					/>
				 </View>

				 <View style={styles.transactionDetails}>
					<Text style={styles.transactionDescription}>{transaction.description}</Text>
					<Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
				 </View>

				 <View style={styles.transactionRight}>
					<Text
						style={[
						 styles.transactionAmount,
						 { color: getTransactionColor(transaction.type, transaction.amount) },
						]}
					>
					 {transaction.amount > 0 ? "+" : ""}₦{Math.abs(transaction.amount).toLocaleString()}
					</Text>
					<View
						style={[
						 styles.statusBadge,
						 {
							backgroundColor:
								transaction.status === "completed"
									? "#dcfce7"
									: transaction.status === "pending"
										? "#fef3c7"
										: "#fee2e2",
						 },
						]}
					>
					 <Text
						 style={[
							styles.statusText,
							{
							 color:
								 transaction.status === "completed"
									 ? "#16a34a"
									 : transaction.status === "pending"
										 ? "#d97706"
										 : "#dc2626",
							},
						 ]}
					 >
						{transaction.status}
					 </Text>
					</View>
				 </View>
				</TouchableOpacity>
			))}
		 </View>
		</ScrollView>

		{/* Withdraw Modal */}
		<Modal visible={showWithdrawModal} transparent animationType="fade">
		 <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
			<Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
			 <View style={styles.modalHeader}>
				<Text style={styles.modalTitle}>Withdraw Funds</Text>
				<TouchableOpacity onPress={closeWithdrawModal}>
				 <Ionicons name="close" size={24} color="#000" />
				</TouchableOpacity>
			 </View>

			 <View style={styles.modalBody}>
				<Text style={styles.availableBalance}>Available: ₦{currentBalance.toLocaleString()}</Text>

				<View style={styles.inputGroup}>
				 <Text style={styles.inputLabel}>Amount</Text>
				 <TextInput
					 style={styles.amountInput}
					 value={withdrawAmount}
					 onChangeText={setWithdrawAmount}
					 placeholder="Enter amount"
					 keyboardType="numeric"
				 />
				</View>

				<View style={styles.inputGroup}>
				 <View style={styles.methodHeader}>
					<Text style={styles.inputLabel}>Withdrawal Method</Text>
					<TouchableOpacity onPress={openAddMethodModal} style={styles.addMethodButton}>
					 <Ionicons name="add" size={16} color="#00B624" />
					 <Text style={styles.addMethodText}>Add Method</Text>
					</TouchableOpacity>
				 </View>

				 <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
					{withdrawalMethods.map((method) => (
						<TouchableOpacity
							key={method.id}
							style={[styles.methodItem, selectedMethodId === method.id && styles.methodItemSelected]}
							onPress={() => setSelectedMethodId(method.id)}
						>
						 <View style={styles.methodInfo}>
							<View style={styles.methodIcon}>
							 <Ionicons
								 name={method.type === "bank" ? "card" : "phone-portrait"}
								 size={20}
								 color={selectedMethodId === method.id ? "#00B624" : "#666"}
							 />
							</View>
							<View style={styles.methodDetails}>
							 <Text style={styles.methodName}>{method.name}</Text>
							 <Text style={styles.methodSubtext}>
								{method.details} • {method.accountNumber}
							 </Text>
							</View>
						 </View>
						 <TouchableOpacity onPress={() => removeWithdrawalMethod(method.id)} style={styles.removeButton}>
							<Ionicons name="trash-outline" size={18} color="#ef4444" />
						 </TouchableOpacity>
						</TouchableOpacity>
					))}
				 </ScrollView>
				</View>

				<TouchableOpacity style={styles.confirmButton} onPress={handleWithdraw}>
				 <Text style={styles.confirmButtonText}>Confirm Withdrawal</Text>
				</TouchableOpacity>
			 </View>
			</Animated.View>
		 </Animated.View>
		</Modal>

		{/* Add Method Modal */}
		{ <Modal visible={ showAddMethodModal } transparent animationType="none" presentationStyle="overFullScreen">
		 <View style={ styles.addMethodModalOverlay }>
			<TouchableOpacity style={ styles.modalBackdrop } activeOpacity={ 1 } onPress={ closeAddMethodModal }/>
			<View style={ styles.addMethodModalContent }>
			 <View style={ styles.modalHeader }>
				<Text style={ styles.modalTitle }>Add Withdrawal Method</Text>
				<TouchableOpacity onPress={ closeAddMethodModal }>
				 <Ionicons name="close" size={ 24 } color="#000"/>
				</TouchableOpacity>
			 </View>


			 <ScrollView style={ styles.addMethodModalBody } showsVerticalScrollIndicator={ false }>
				{/* Method Type Section - Bank Only */ }

				{/* Form Fields */ }
				<View style={ styles.formSection }>
				 <View style={ styles.inputGroup }>
					<Text style={ styles.inputLabel }>Account Holder Name</Text>
					<View style={ styles.inputContainer }>
					 <Ionicons name="person-outline" size={ 20 } color="#64748b" style={ styles.inputIcon }/>
					 <TextInput
						 style={ styles.enhancedInput }
						 value={ newMethodName }
						 onChangeText={ setNewMethodName }
						 placeholder="Enter full name as on account"
						 placeholderTextColor="#94a3b8"
					 />
					</View>
				 </View>

				 <View style={ styles.inputGroup }>
					<Text style={ styles.inputLabel }>Bank Name</Text>
					<View style={ styles.inputContainer }>
					 <Ionicons name="business-outline" size={ 20 } color="#64748b" style={ styles.inputIcon }/>
					 <TextInput
						 style={ styles.enhancedInput }
						 value={ newMethodDetails }
						 onChangeText={ setNewMethodDetails }
						 placeholder="e.g. UBA, GTBank, First Bank"
						 placeholderTextColor="#94a3b8"
					 />
					</View>
				 </View>

				 <View style={ styles.inputGroup }>
					<Text style={ styles.inputLabel }>Account Number</Text>
					<View style={ styles.inputContainer }>
					 <Ionicons name="card-outline" size={ 20 } color="#64748b" style={ styles.inputIcon }/>
					 <TextInput
						 style={ styles.enhancedInput }
						 value={ newMethodAccount }
						 onChangeText={ setNewMethodAccount }
						 placeholder="Enter 10-digit account number"
						 placeholderTextColor="#94a3b8"
						 keyboardType="numeric"
					 />
					</View>
				 </View>

				 {/* Preview Card */ }
				 { (newMethodName || newMethodDetails || newMethodAccount) && (
					 <View style={ styles.previewSection }>
						<Text style={ styles.previewTitle }>Preview</Text>
						<View style={ styles.previewCard }>
						 <View style={ styles.previewIcon }>
							<Ionicons name="card" size={ 20 } color="#00B624"/>
						 </View>
						 <View style={ styles.previewDetails }>
							<Text style={ styles.previewName }>{ newMethodName || "Account Holder Name" }</Text>
							<Text style={ styles.previewSubtext }>
							 { newMethodDetails || "Bank Name" } • { newMethodAccount || "Account" }
							</Text>
						 </View>
						</View>
					 </View>
				 ) }
				</View>

				<TouchableOpacity
					style={ [
					 styles.addMethodConfirmButton,
					 (!newMethodName || !newMethodDetails || !newMethodAccount) && styles.addMethodConfirmButtonDisabled,
					] }
					onPress={ addWithdrawalMethod }
					disabled={ !newMethodName || !newMethodDetails || !newMethodAccount }
				>
				 <Ionicons name="add-circle" size={ 20 } color="#fff"/>
				 <Text style={ styles.addMethodConfirmButtonText }>Add Withdrawal Method</Text>
				</TouchableOpacity>
			 </ScrollView>
			</View>
		 </View>
		</Modal> }
	 </SafeAreaView>
 )
}

const styles = StyleSheet.create({
 container: {
	flex: 1,
	backgroundColor: "#f8fafc",
 },
 header: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	paddingHorizontal: 20,
	paddingVertical: 16,
	backgroundColor: "#fff",
 },
 headerTitle: {
	fontSize: 20,
	fontWeight: "600",
	color: "#000",
 },
 balanceCard: {
	backgroundColor: "#00B624",
	margin: 20,
	padding: 24,
	borderRadius: 16,
	alignItems: "center",
 },
 balanceLabel: {
	fontSize: 16,
	color: "rgba(255, 255, 255, 0.8)",
	marginBottom: 8,
 },
 balanceAmount: {
	fontSize: 36,
	fontWeight: "bold",
	color: "#fff",
	marginBottom: 20,
 },
 balanceActions: {
	flexDirection: "row",
 },
 withdrawButton: {
	flexDirection: "row",
	alignItems: "center",
	backgroundColor: "rgba(255, 255, 255, 0.2)",
	paddingHorizontal: 20,
	paddingVertical: 12,
	borderRadius: 8,
	gap: 8,
 },
 withdrawButtonText: {
	color: "#fff",
	fontSize: 16,
	fontWeight: "600",
 },
 summaryCard: {
	backgroundColor: "#fff",
	marginHorizontal: 20,
	marginBottom: 20,
	padding: 20,
	borderRadius: 12,
 },
 summaryHeader: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	marginBottom: 20,
 },
 summaryTitle: {
	fontSize: 18,
	fontWeight: "600",
	color: "#000",
 },
 periodToggle: {
	flexDirection: "row",
	backgroundColor: "#f1f5f9",
	borderRadius: 8,
	padding: 2,
 },
 periodButton: {
	paddingHorizontal: 16,
	paddingVertical: 8,
	borderRadius: 6,
 },
 periodButtonActive: {
	backgroundColor: "#00B624",
 },
 periodButtonText: {
	fontSize: 14,
	color: "#64748b",
 },
 periodButtonTextActive: {
	color: "#fff",
	fontWeight: "600",
 },
 summaryStats: {
	flexDirection: "row",
	justifyContent: "space-between",
 },
 statItem: {
	alignItems: "center",
 },
 statValue: {
	fontSize: 24,
	fontWeight: "bold",
	color: "#00B624",
	marginBottom: 4,
 },
 statLabel: {
	fontSize: 14,
	color: "#64748b",
 },
 transactionSection: {
	backgroundColor: "#fff",
	marginHorizontal: 20,
	marginBottom: 20,
	borderRadius: 12,
	padding: 20,
 },
 sectionHeader: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	marginBottom: 16,
 },
 sectionTitle: {
	fontSize: 18,
	fontWeight: "600",
	color: "#000",
 },
 viewAllText: {
	fontSize: 14,
	color: "#00B624",
	fontWeight: "600",
 },
 transactionItem: {
	flexDirection: "row",
	alignItems: "center",
	paddingVertical: 12,
	borderBottomWidth: 1,
	borderBottomColor: "#f1f5f9",
 },
 transactionIcon: {
	width: 40,
	height: 40,
	borderRadius: 20,
	backgroundColor: "#f8fafc",
	justifyContent: "center",
	alignItems: "center",
	marginRight: 12,
 },
 transactionDetails: {
	flex: 1,
 },
 transactionDescription: {
	fontSize: 16,
	fontWeight: "500",
	color: "#000",
	marginBottom: 4,
 },
 transactionDate: {
	fontSize: 14,
	color: "#64748b",
 },
 transactionRight: {
	alignItems: "flex-end",
 },
 transactionAmount: {
	fontSize: 16,
	fontWeight: "600",
	marginBottom: 4,
 },
 statusBadge: {
	paddingHorizontal: 8,
	paddingVertical: 2,
	borderRadius: 4,
 },
 statusText: {
	fontSize: 12,
	fontWeight: "500",
	textTransform: "capitalize",
 },
 modalOverlay: {
	flex: 1,
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	justifyContent: "flex-end",
 },
 modalContent: {
	backgroundColor: "#fff",
	borderTopLeftRadius: 20,
	borderTopRightRadius: 20,
	paddingBottom: 40,
 },
 addMethodModalOverlay: {
	flex: 1,
	backgroundColor: "rgba(0, 0, 0, 0.5)",
	justifyContent: "flex-end",
 },
 modalBackdrop: {
	position: "absolute",
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
 },
 addMethodModalContent: {
	backgroundColor: "#fff",
	borderTopLeftRadius: 24,
	borderTopRightRadius: 24,
	minHeight: "80%",
	maxHeight: "90%",
	paddingBottom: Platform.OS === "ios" ? 40 : 20,
	shadowColor: "#000",
	shadowOffset: { width: 0, height: -2 },
	shadowOpacity: 0.25,
	shadowRadius: 10,
	elevation: 10,
 },
 addMethodModalBody: {
	flex: 1,
 },
 modalHeader: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	padding: 20,
	borderBottomWidth: 1,
	borderBottomColor: "#f1f5f9",
 },
 modalTitle: {
	fontSize: 20,
	fontWeight: "600",
	color: "#000",
 },
 modalBody: {
	padding: 20,
 },
 availableBalance: {
	fontSize: 16,
	color: "#64748b",
	textAlign: "center",
	marginBottom: 24,
 },
 inputGroup: {
	marginBottom: 20,
 },
 inputLabel: {
	fontSize: 16,
	fontWeight: "500",
	color: "#000",
	marginBottom: 8,
 },
 amountInput: {
	borderWidth: 1,
	borderColor: "#e2e8f0",
	borderRadius: 8,
	padding: 16,
	fontSize: 16,
	backgroundColor: "#fff",
 },
 inputContainer: {
	flexDirection: "row",
	alignItems: "center",
	borderWidth: 1,
	borderColor: "#e2e8f0",
	borderRadius: 12,
	backgroundColor: "#fff",
	paddingHorizontal: 16,
 },
 inputIcon: {
	marginRight: 12,
 },
 enhancedInput: {
	flex: 1,
	paddingVertical: 16,
	fontSize: 16,
	color: "#000",
 },
 methodHeader: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	marginBottom: 12,
 },
 addMethodButton: {
	flexDirection: "row",
	alignItems: "center",
	gap: 4,
 },
 addMethodText: {
	fontSize: 14,
	color: "#00B624",
	fontWeight: "600",
 },
 methodsList: {
	maxHeight: 200,
 },
 methodItem: {
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "space-between",
	padding: 16,
	borderWidth: 1,
	borderColor: "#e2e8f0",
	borderRadius: 8,
	marginBottom: 8,
 },
 methodItemSelected: {
	borderColor: "#00B624",
	backgroundColor: "#f0fdf4",
 },
 methodInfo: {
	flexDirection: "row",
	alignItems: "center",
	flex: 1,
 },
 methodIcon: {
	width: 40,
	height: 40,
	borderRadius: 20,
	backgroundColor: "#f8fafc",
	justifyContent: "center",
	alignItems: "center",
	marginRight: 12,
 },
 methodDetails: {
	flex: 1,
 },
 methodName: {
	fontSize: 16,
	fontWeight: "600",
	color: "#000",
	marginBottom: 2,
 },
 methodSubtext: {
	fontSize: 14,
	color: "#64748b",
 },
 removeButton: {
	padding: 8,
 },
 confirmButton: {
	backgroundColor: "#00B624",
	padding: 16,
	borderRadius: 8,
	alignItems: "center",
	marginTop: 20,
 },
 confirmButtonText: {
	color: "#fff",
	fontSize: 16,
	fontWeight: "600",
 },
 methodTypeSection: {
	padding: 20,
	paddingBottom: 0,
 },
 methodTypeGrid: {
	flexDirection: "row",
	gap: 12,
 },
 methodTypeCard: {
	flex: 1,
	backgroundColor: "#f8fafc",
	borderWidth: 2,
	borderColor: "#e2e8f0",
	borderRadius: 12,
	padding: 16,
	alignItems: "center",
 },
 methodTypeCardActive: {
	borderColor: "#00B624",
	backgroundColor: "#f0fdf4",
 },
 methodTypeIcon: {
	width: 48,
	height: 48,
	borderRadius: 24,
	backgroundColor: "#e2e8f0",
	justifyContent: "center",
	alignItems: "center",
	marginBottom: 12,
 },
 methodTypeIconActive: {
	backgroundColor: "#00B624",
 },
 methodTypeTitle: {
	fontSize: 16,
	fontWeight: "600",
	color: "#000",
	marginBottom: 4,
 },
 methodTypeTitleActive: {
	color: "#00B624",
 },
 methodTypeSubtitle: {
	fontSize: 12,
	color: "#64748b",
	textAlign: "center",
 },
 methodTypeSubtitleActive: {
	color: "#00B624",
 },
 formSection: {
	padding: 20,
 },
 previewSection: {
	marginTop: 20,
 },
 previewTitle: {
	fontSize: 16,
	fontWeight: "600",
	color: "#000",
	marginBottom: 12,
 },
 previewCard: {
	flexDirection: "row",
	alignItems: "center",
	padding: 16,
	backgroundColor: "#f8fafc",
	borderRadius: 12,
	borderWidth: 1,
	borderColor: "#e2e8f0",
 },
 previewIcon: {
	width: 40,
	height: 40,
	borderRadius: 20,
	backgroundColor: "#fff",
	justifyContent: "center",
	alignItems: "center",
	marginRight: 12,
 },
 previewDetails: {
	flex: 1,
 },
 previewName: {
	fontSize: 16,
	fontWeight: "600",
	color: "#000",
	marginBottom: 2,
 },
 previewSubtext: {
	fontSize: 14,
	color: "#64748b",
 },
 addMethodConfirmButton: {
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: "#00B624",
	padding: 18,
	borderRadius: 12,
	marginHorizontal: 20,
	marginTop: 24,
	gap: 8,
 },
 addMethodConfirmButtonDisabled: {
	backgroundColor: "#94a3b8",
 },
 addMethodConfirmButtonText: {
	color: "#fff",
	fontSize: 16,
	fontWeight: "600",
 },
})

export default RiderWalletScreen
