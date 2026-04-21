import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.226:5000/api/restaurants";

type Restaurant = {
    id?: number;
    name: string;
    location: string;
    cuisine: string;
};

let restaurantsCache: Restaurant[] | null = null;
let restaurantsRequest: Promise<Restaurant[]> | null = null;

const loadRestaurants = async () => {
    if (restaurantsCache) {
        return restaurantsCache;
    }

    if (!restaurantsRequest) {
        restaurantsRequest = fetch(API_URL)
            .then(async (response) => {
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message || "Failed to load restaurants");
                }

                restaurantsCache = data;
                return data;
            })
            .finally(() => {
                restaurantsRequest = null;
            });
    }

    return restaurantsRequest;
};

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
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

        const fetchRestaurants = async () => {
            try {
                const data = await loadRestaurants();

                if (isMounted) {
                    setRestaurants(data);
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
                await fetchRestaurants();
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

    const handleReserve = (restaurant: Restaurant) => {
        router.push({
            pathname: "/reservation-form",
            params: {
                restaurantId: String(restaurant.id),
                restaurantName: restaurant.name,
            },
        });
    };

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
                <Text style={{ color: "black" }}>Loading restaurants...</Text>
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
                Restaurants
            </Text>

            {error ? (
                <Text style={{ color: "black" }}>{error}</Text>
            ) : (
                <ScrollView>
                    {restaurants.map((restaurant, index) => (
                        <View
                            key={restaurant.id ?? index}
                            style={{
                                borderWidth: 1,
                                borderColor: "#ddd",
                                padding: 15,
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ color: "black", fontSize: 18, fontWeight: "bold" }}>
                                {restaurant.name}
                            </Text>
                            <Text style={{ color: "black", marginTop: 6 }}>
                                Location: {restaurant.location}
                            </Text>
                            <Text style={{ color: "black", marginTop: 6 }}>
                                Cuisine: {restaurant.cuisine}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleReserve(restaurant)}
                                style={{
                                    backgroundColor: "blue",
                                    padding: 12,
                                    marginTop: 12,
                                }}
                            >
                                <Text style={{ color: "white", textAlign: "center" }}>Reserve</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
