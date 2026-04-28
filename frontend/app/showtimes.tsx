import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { formatDisplayDate, formatPrice } from "../utils/formatters";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

type Showtime = {
    showtime_id?: number;
    show_date: string;
    show_time: string;
    available_seats: number;
    price: number | string;
};

export default function Showtimes() {
    const { showId, showTitle } = useLocalSearchParams<{
        showId?: string;
        showTitle?: string;
    }>();
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadSession = async () => {
            const [[, savedToken], [, savedUser]] = await AsyncStorage.multiGet(["token", "user"]);

            if (isMounted && (!savedToken || !savedUser)) {
                router.replace("/login");
                return false;
            }

            return true;
        };

        const fetchShowtimes = async () => {
            if (!showId) {
                setError("Show was not selected");
                setLoading(false);
                return;
            }

            try {
                const response = await apiFetch(`/api/showtimes?showId=${encodeURIComponent(showId)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load showtimes");
                }

                if (isMounted) {
                    setShowtimes(data);
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

        const loadScreen = async () => {
            const hasSession = await loadSession();

            if (hasSession) {
                await fetchShowtimes();
            }
        };

        loadScreen();

        return () => {
            isMounted = false;
        };
    }, [showId]);

    const handleBookNow = (showtime: Showtime) => {
        if (!showtime.showtime_id) {
            return;
        }

        router.push({
            pathname: "/booking",
            params: {
                showtimeId: String(showtime.showtime_id),
                showTitle: showTitle || "Show",
                date: showtime.show_date,
                time: showtime.show_time,
                price: String(showtime.price),
            },
        });
    };

    if (loading) {
        return (
            <View style={ui.centeredScreen}>
                <Text style={ui.loadingText}>Loading showtimes...</Text>
            </View>
        );
    }

    return (
        <View style={ui.screen}>
            <View style={ui.content}>
            <TouchableOpacity onPress={() => router.push("/theatres")} style={ui.homeButton}>
                <Text style={ui.homeButtonText}>Home</Text>
            </TouchableOpacity>

            <Text style={ui.title}>{showTitle || "Showtimes"}</Text>
            <Text style={ui.subtitle}>Pick a showtime and continue to booking.</Text>

            {error ? (
                <View style={ui.errorCard}>
                    <Text style={ui.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {showtimes.map((showtime, index) => (
                        <View
                            key={showtime.showtime_id ?? index}
                            style={ui.card}
                        >
                            <Text style={ui.cardTitle}>
                                Date: {formatDisplayDate(showtime.show_date)}
                            </Text>
                            <Text style={ui.detailText}>
                                Time: {showtime.show_time}
                            </Text>
                            <Text style={ui.detailText}>
                                Available seats: {showtime.available_seats}
                            </Text>
                            <Text style={ui.detailText}>
                                Price: {formatPrice(showtime.price)}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleBookNow(showtime)}
                                style={ui.button}
                            >
                                <Text style={ui.buttonText}>Book Now</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
            </View>
        </View>
    );
}
