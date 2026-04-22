import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.226:5000/api/theatres";

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
        theatresRequest = fetch(API_URL)
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
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
                <Text style={{ color: "black" }}>Loading theatres...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
            <TouchableOpacity
                onPress={handleLogout}
                style={{
                    alignSelf: "flex-end",
                    backgroundColor: "black",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    marginBottom: 12,
                }}
            >
                <Text style={{ color: "white" }}>Logout</Text>
            </TouchableOpacity>

            <Text style={{ color: "black", fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                Theatres
            </Text>

            {error ? (
                <Text style={{ color: "black" }}>{error}</Text>
            ) : (
                <ScrollView>
                    {theatres.map((theatre, index) => (
                        <View
                            key={theatre.theatre_id ?? index}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ddd",
                                padding: 15,
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ color: "black", fontSize: 18, fontWeight: "bold" }}>
                                {theatre.name}
                            </Text>
                            <Text style={{ color: "black", marginTop: 6 }}>
                                Location: {theatre.location}
                            </Text>
                            <Text style={{ color: "black", marginTop: 6 }}>
                                {theatre.description}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleViewShows(theatre)}
                                style={{
                                    backgroundColor: "blue",
                                    padding: 12,
                                    marginTop: 12,
                                }}
                            >
                                <Text style={{ color: "white", textAlign: "center" }}>View Shows</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
