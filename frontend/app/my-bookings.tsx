import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { formatDisplayDate, formatPrice, getNumericPrice } from "../utils/formatters";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

type Booking = {
    id: number;
    guests: number;
    showtime_id: number;
    show_date: string;
    show_time: string;
    price: number | string;
    show_title: string;
    theatre_name: string;
    theatre_location: string;
};

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchBookings = async () => {
            try {
                const savedUser = await AsyncStorage.getItem("user");

                if (!savedUser) {
                    router.replace("/login");
                    return;
                }

                const response = await apiFetch("/api/user/reservations", {
                    auth: true,
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load bookings");
                }

                if (isMounted) {
                    setBookings(data);
                }
            } catch (fetchError: any) {
                if (isMounted) {
                    setError(fetchError?.message || "Could not reach the server");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBookings();

        return () => {
            isMounted = false;
        };
    }, []);

    const cancelBooking = async (bookingId: number) => {
        setCancellingId(bookingId);

        try {
            const response = await apiFetch(`/api/user/reservations/${bookingId}`, {
                method: "DELETE",
                auth: true,
            });
            const rawText = await response.text();
            const data = rawText ? JSON.parse(rawText) : null;

            if (!response.ok) {
                Alert.alert("Error", data?.message || `Cancel failed with status ${response.status}`);
                return;
            }

            setBookings((currentBookings) => currentBookings.filter((booking) => booking.id !== bookingId));
            Alert.alert("Success", data?.message || "Booking cancelled successfully");
        } catch (cancelError: any) {
            Alert.alert("Error", cancelError?.message || "Could not cancel booking");
        } finally {
            setCancellingId(null);
        }
    };

    const handleCancelBooking = (bookingId: number) => {
        Alert.alert(
            "Cancel Booking",
            "Are you sure you want to cancel this booking?",
            [
                {
                    text: "Keep Booking",
                    style: "cancel",
                },
                {
                    text: "Cancel Booking",
                    style: "destructive",
                    onPress: () => cancelBooking(bookingId),
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={ui.centeredScreen}>
                <Text style={ui.loadingText}>Loading bookings...</Text>
            </View>
        );
    }

    return (
        <View style={ui.screen}>
            <View style={ui.content}>
            <TouchableOpacity onPress={() => router.push("/theatres")} style={ui.homeButton}>
                <Text style={ui.homeButtonText}>Home</Text>
            </TouchableOpacity>

            <Text style={ui.title}>My Bookings</Text>
            <Text style={ui.subtitle}>Review your upcoming reservations and manage cancellations.</Text>

            {error ? (
                <View style={ui.errorCard}>
                    <Text style={ui.errorText}>{error}</Text>
                </View>
            ) : bookings.length === 0 ? (
                <View style={ui.emptyState}>
                    <Text style={ui.cardTitle}>
                        No bookings yet
                    </Text>
                    <Text style={[ui.bodyText, { marginBottom: 16 }]}>
                        Your theatre bookings will appear here after you reserve tickets.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push("/theatres")}
                        style={ui.button}
                    >
                        <Text style={ui.buttonText}>Browse Theatres</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {bookings.map((booking) => {
                        const pricePerTicket = getNumericPrice(booking.price);
                        const totalPrice = pricePerTicket * booking.guests;

                        return (
                            <View
                                key={booking.id}
                                style={ui.card}
                            >
                                <Text style={ui.cardTitle}>
                                    {booking.show_title}
                                </Text>
                                <Text style={ui.detailText}>
                                    Theatre: {booking.theatre_name}
                                </Text>
                                <Text style={ui.detailText}>
                                    Location: {booking.theatre_location}
                                </Text>
                                <Text style={ui.detailText}>
                                    Date: {formatDisplayDate(booking.show_date)}
                                </Text>
                                <Text style={ui.detailText}>
                                    Time: {booking.show_time}
                                </Text>
                                <Text style={ui.detailText}>
                                    Guests: {booking.guests}
                                </Text>
                                <Text style={ui.detailText}>
                                    Price per ticket: {formatPrice(pricePerTicket)} €
                                </Text>
                                <Text style={[ui.detailText, { fontWeight: "800" }]}>
                                    Total price: {formatPrice(totalPrice)} €
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleCancelBooking(booking.id)}
                                    disabled={cancellingId === booking.id}
                                    style={[ui.button, ui.buttonDanger, cancellingId === booking.id && ui.buttonDisabled]}
                                >
                                    <Text style={ui.buttonText}>
                                        {cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
            </View>
        </View>
    );
}
