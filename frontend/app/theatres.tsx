import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

type Theatre = {
    theatre_id?: number;
    name: string;
    location: string;
    description: string;
};

let theatresCache: Theatre[] | null = null;
let theatresRequest: Promise<Theatre[]> | null = null;

const loadTheatres = async () => {
    if (theatresCache) {
        return theatresCache;
    }

    if (!theatresRequest) {
        theatresRequest = apiFetch("/api/theatres")
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load theatres");
                }

                theatresCache = data;
                return data;
            })
            .finally(() => {
                theatresRequest = null;
            });
    }

    return theatresRequest;
};

export default function Theatres() {
    const [theatres, setTheatres] = useState<Theatre[]>([]);
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

        const fetchTheatres = async () => {
            try {
                const data = await loadTheatres();

                if (isMounted) {
                    setTheatres(data);
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
                await fetchTheatres();
            }
        };

        loadScreen();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(["token", "user"]);
        router.replace("/login");
    };

    const handleViewShows = (theatre: Theatre) => {
        if (!theatre.theatre_id) {
            return;
        }

        router.push({
            pathname: "/shows",
            params: {
                theatreId: String(theatre.theatre_id),
                theatreName: theatre.name,
            },
        });
    };

    if (loading) {
        return (
            <View style={ui.centeredScreen}>
                <Text style={ui.loadingText}>Loading theatres...</Text>
            </View>
        );
    }

    return (
        <View style={ui.screen}>
            <View style={ui.content}>
            <View style={ui.topActions}>
                <TouchableOpacity
                    onPress={() => router.push("/my-bookings")}
                    style={ui.smallButton}
                >
                    <Text style={ui.smallButtonText}>My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={[ui.smallButton, ui.buttonDark]}
                >
                    <Text style={ui.smallButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Text style={ui.title}>Theatres</Text>
            <Text style={ui.subtitle}>Choose a theatre to view its available shows.</Text>

            {error ? (
                <View style={ui.errorCard}>
                    <Text style={ui.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {theatres.map((theatre, index) => (
                        <View
                            key={theatre.theatre_id ?? index}
                            style={ui.card}
                        >
                            <Text style={ui.cardTitle}>
                                {theatre.name}
                            </Text>
                            <Text style={ui.metaText}>
                                Location: {theatre.location}
                            </Text>
                            <Text style={[ui.bodyText, { marginTop: 8 }]}>
                                {theatre.description}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleViewShows(theatre)}
                                style={ui.button}
                            >
                                <Text style={ui.buttonText}>View Shows</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
            </View>
        </View>
    );
}
