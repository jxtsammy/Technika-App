import { Platform, Linking, Alert } from "react-native";

/**
 * Opens native maps for directions. `destination` can be either
 * { latitude, longitude } or a plain address string — falls back to
 * address text since task creation currently only captures a free-text
 * address, not coordinates.
 */
export const openDirections = async (destination, label = "Destination") => {
    let query;

    if (
        destination &&
        typeof destination === "object" &&
        destination.latitude &&
        destination.longitude
    ) {
        query = `${destination.latitude},${destination.longitude}`;
    } else if (typeof destination === "string" && destination.trim()) {
        query = destination.trim();
    } else {
        Alert.alert("No Location", "This task has no location set.");
        return;
    }

    const encodedQuery = encodeURIComponent(query);

    const googleMapsApp =
        Platform.OS === "ios"
            ? `comgooglemaps://?daddr=${encodedQuery}&directionsmode=driving`
            : `google.navigation:q=${encodedQuery}`;

    const appleMapsApp = `maps://?daddr=${encodedQuery}&dirflg=d`;
    const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;

    try {
        const canOpenGoogle = await Linking.canOpenURL(googleMapsApp);
        if (canOpenGoogle) {
            await Linking.openURL(googleMapsApp);
            return;
        }

        if (Platform.OS === "ios") {
            const canOpenApple = await Linking.canOpenURL(appleMapsApp);
            if (canOpenApple) {
                await Linking.openURL(appleMapsApp);
                return;
            }
        }

        await Linking.openURL(webFallback);
    } catch (error) {
        console.error("Failed to open directions:", error);
        Alert.alert("Error", "Could not open directions.");
    }
};
