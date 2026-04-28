import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

type Show = {
    show_id?: number;
    title: string;
    description: string;
    duration: number;
    age_rating: string;
};

export default function Shows() {
    const { theatreId, theatreName } = useLocalSearchParams<{
        theatreId?: string;
        theatreName?: string;
    }>();
    const [shows, setShows] = useState<Show[]>([]);
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

        const fetchShows = async () => {
            if (!theatreId) {
                setError("Theatre was not selected");
                setLoading(false);
                return;
            }

            try {
                const response = await apiFetch(`/api/shows?theatreId=${encodeURIComponent(theatreId)}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load shows");
                }

                if (isMounted) {
                    setShows(data);
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
                await fetchShows();
            }
        };

        loadScreen();

        return () => {
            isMounted = false;
        };
    }, [theatreId]);

    const handleViewShowtimes = (show: Show) => {
        if (!show.show_id) {
            return;
        }

        router.push({
            pathname: "/showtimes",
            params: {
                showId: String(show.show_id),
                showTitle: show.title,
            },
        });
    };

    if (loading) {
        return (
            <View style={ui.centeredScreen}>
                <Text style={ui.loadingText}>Loading shows...</Text>
            </View>
        );
    }

    return (
        <View style={ui.screen}>
            <View style={ui.content}>
            <TouchableOpacity onPress={() => router.push("/theatres")} style={ui.homeButton}>
                <Text style={ui.homeButtonText}>Home</Text>
            </TouchableOpacity>

            <Text style={ui.title}>{theatreName || "Shows"}</Text>
            <Text style={ui.subtitle}>Select a show to see dates, times, and ticket prices.</Text>

            {error ? (
                <View style={ui.errorCard}>
                    <Text style={ui.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {shows.map((show, index) => (
                        <View
                            key={show.show_id ?? index}
                            style={ui.card}
                        >
                            <Text style={ui.cardTitle}>
                                {show.title}
                            </Text>
                            <Text style={ui.bodyText}>
                                {show.description}
                            </Text>
                            <Text style={ui.metaText}>
                                Duration: {show.duration} minutes
                            </Text>
                            <Text style={ui.metaText}>
                                Age rating: {show.age_rating}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleViewShowtimes(show)}
                                style={ui.button}
                            >
                                <Text style={ui.buttonText}>View Showtimes</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
            </View>
        </View>
    );
}
