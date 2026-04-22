import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const API_URL = "http://192.168.1.226:5000/api/reservations";
const RESERVATION_YEAR = 2026;
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const TIME_SLOTS = [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
    "23:00",
];

const normalizeToken = (token: string | null) => {
    if (!token) {
        return null;
    }

    return token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
};

const getDaysInMonth = (month: number) => {
    if (month === 2) {
        return 28;
    }

    if ([4, 6, 9, 11].includes(month)) {
        return 30;
    }

    return 31;
};

const formatReservationDate = (month: number, day: number, time: string) => {
    const paddedMonth = String(month).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");

    return `${RESERVATION_YEAR}-${paddedMonth}-${paddedDay} ${time}`;
};

export default function ReservationForm() {
    const { restaurantId, restaurantName } = useLocalSearchParams<{
        restaurantId?: string;
        restaurantName?: string;
    }>();
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedDay, setSelectedDay] = useState(1);
    const [selectedTime, setSelectedTime] = useState("19:00");
    const [showMonthOptions, setShowMonthOptions] = useState(false);
    const [showDayOptions, setShowDayOptions] = useState(false);
    const [showTimeOptions, setShowTimeOptions] = useState(false);
    const [guests, setGuests] = useState(2);
    const [submitting, setSubmitting] = useState(false);
    const daysInSelectedMonth = getDaysInMonth(selectedMonth);
    const dayOptions = Array.from({ length: daysInSelectedMonth }, (_, index) => index + 1);

    useEffect(() => {
        if (selectedDay > daysInSelectedMonth) {
            setSelectedDay(daysInSelectedMonth);
        }
    }, [daysInSelectedMonth, selectedDay]);

    const handleSubmit = async () => {
        if (!restaurantId || !selectedMonth || !selectedDay || !selectedTime) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        const reservationDate = formatReservationDate(selectedMonth, selectedDay, selectedTime);

        setSubmitting(true);

        try {
            const savedToken = await AsyncStorage.getItem("token");
            const token = normalizeToken(savedToken);

            if (!token) {
                Alert.alert("Error", "Session expired. Please log in again.");
                router.replace("/login");
                return;
            }

            console.log("Reservation token exists:", Boolean(token));
            console.log("Reservation auth header format:", `Bearer <token length ${token.length}>`);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    restaurant_id: restaurantId,
                    reservation_date: reservationDate,
                    guests,
                }),
            });

            const rawText = await response.text();
            const data = rawText ? JSON.parse(rawText) : null;

            if (!response.ok) {
                Alert.alert("Error", data?.message || `Reservation failed with status ${response.status}`);
                return;
            }

            Alert.alert("Success", data?.message || "Reservation created successfully");
            router.replace("/restaurants");
        } catch (error: any) {
            Alert.alert("Error", error?.message || "Could not create reservation");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ color: "black", fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                {restaurantName || "Restaurant"}
            </Text>

            <Text style={{ color: "black", fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Date</Text>
            <View
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                    backgroundColor: "#fafafa",
                }}
            >
                <Text style={{ color: "#555", fontSize: 13, marginBottom: 4 }}>Year</Text>
                <Text style={{ color: "black", fontSize: 18, fontWeight: "600" }}>{RESERVATION_YEAR}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: "#555", fontSize: 13, marginBottom: 6 }}>Month</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setShowMonthOptions((isOpen) => !isOpen);
                            setShowDayOptions(false);
                            setShowTimeOptions(false);
                        }}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ddd",
                            borderRadius: 12,
                            padding: 14,
                            backgroundColor: "white",
                        }}
                    >
                        <Text style={{ color: "black", fontSize: 16 }}>{selectedMonth}</Text>
                    </TouchableOpacity>
                    {showMonthOptions ? (
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: "#ddd",
                                borderRadius: 12,
                                marginTop: 6,
                                backgroundColor: "white",
                                overflow: "hidden",
                            }}
                        >
                            {MONTHS.map((month) => (
                                <TouchableOpacity
                                    key={month}
                                    onPress={() => {
                                        setSelectedMonth(month);
                                        setShowMonthOptions(false);
                                    }}
                                    style={{
                                        padding: 12,
                                        backgroundColor: selectedMonth === month ? "black" : "white",
                                    }}
                                >
                                    <Text style={{ color: selectedMonth === month ? "white" : "black" }}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={{ color: "#555", fontSize: 13, marginBottom: 6 }}>Day</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setShowDayOptions((isOpen) => !isOpen);
                            setShowMonthOptions(false);
                            setShowTimeOptions(false);
                        }}
                        style={{
                            borderWidth: 1,
                            borderColor: "#ddd",
                            borderRadius: 12,
                            padding: 14,
                            backgroundColor: "white",
                        }}
                    >
                        <Text style={{ color: "black", fontSize: 16 }}>{selectedDay}</Text>
                    </TouchableOpacity>
                    {showDayOptions ? (
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: "#ddd",
                                borderRadius: 12,
                                marginTop: 6,
                                backgroundColor: "white",
                                overflow: "hidden",
                            }}
                        >
                            {dayOptions.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => {
                                        setSelectedDay(day);
                                        setShowDayOptions(false);
                                    }}
                                    style={{
                                        padding: 12,
                                        backgroundColor: selectedDay === day ? "black" : "white",
                                    }}
                                >
                                    <Text style={{ color: selectedDay === day ? "white" : "black" }}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}
                </View>
            </View>

            <Text style={{ color: "black", fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Time</Text>
            <TouchableOpacity
                onPress={() => {
                    setShowTimeOptions((isOpen) => !isOpen);
                    setShowMonthOptions(false);
                    setShowDayOptions(false);
                }}
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: showTimeOptions ? 6 : 20,
                    backgroundColor: "white",
                }}
            >
                <Text style={{ color: "black", fontSize: 16 }}>{selectedTime}</Text>
            </TouchableOpacity>
            {showTimeOptions ? (
                <View
                    style={{
                        borderWidth: 1,
                        borderColor: "#ddd",
                        borderRadius: 12,
                        marginBottom: 20,
                        backgroundColor: "white",
                        overflow: "hidden",
                    }}
                >
                    {TIME_SLOTS.map((time) => (
                        <TouchableOpacity
                            key={time}
                            onPress={() => {
                                setSelectedTime(time);
                                setShowTimeOptions(false);
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: selectedTime === time ? "black" : "white",
                            }}
                        >
                            <Text style={{ color: selectedTime === time ? "white" : "black" }}>{time}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}

            <Text style={{ color: "black", fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Guests</Text>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 20,
                }}
            >
                <TouchableOpacity
                    onPress={() => setGuests((currentGuests) => Math.max(1, currentGuests - 1))}
                    disabled={guests <= 1}
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 22,
                        backgroundColor: guests <= 1 ? "#eee" : "black",
                    }}
                >
                    <Text style={{ color: guests <= 1 ? "#777" : "white", fontSize: 24 }}>-</Text>
                </TouchableOpacity>

                <Text style={{ color: "black", fontSize: 22, fontWeight: "600" }}>{guests}</Text>

                <TouchableOpacity
                    onPress={() => setGuests((currentGuests) => Math.min(12, currentGuests + 1))}
                    disabled={guests >= 12}
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 22,
                        backgroundColor: guests >= 12 ? "#eee" : "black",
                    }}
                >
                    <Text style={{ color: guests >= 12 ? "#777" : "white", fontSize: 24 }}>+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={{
                    backgroundColor: submitting ? "#777" : "blue",
                    padding: 15,
                }}
            >
                <Text style={{ color: "white", textAlign: "center" }}>
                    {submitting ? "Submitting..." : "Submit"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
