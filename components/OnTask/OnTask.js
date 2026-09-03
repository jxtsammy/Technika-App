import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import api from "../../api";
import TokenModalScreen from "./AcknowledgmentToken";
import { openDirections } from "../../utils/directions";

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const DeliveryTrackingApp = ({ navigation, route }) => {
  const { task } = route.params;

  const [hasArrived, setHasArrived] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [distanceToTarget, setDistanceToTarget] = useState(null);

  const destinationLat = task.location?.latitude || 6.6488;
  const destinationLng = task.location?.longitude || -1.6518;

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is required to track proximity to the delivery site."
        );
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });

          const dist = getDistanceInMeters(
            latitude,
            longitude,
            destinationLat,
            destinationLng
          );
          setDistanceToTarget(Math.round(dist));
          setIsWithinRadius(dist <= 50);
        }
      );
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [destinationLat, destinationLng]);

  const handleArrived = async () => {
    if (!isWithinRadius) {
      Alert.alert(
        "Too Far Away",
        `You are currently ${distanceToTarget}m away. You must be within 50 meters of the destination to mark arrival.`
      );
      return;
    }

    try {
      await api.patch(`/tasks/status/${task.taskId}`, { status: "Arrived" });
      const now = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setArrivalTime(now);
      setHasArrived(true);
      setShowTokenModal(true);
    } catch (error) {
      console.error("Failed to update status:", error);
      Alert.alert("Error", "Could not update status. Please try again.");
    }
  };

  const handleOpenDirections = () => {
    openDirections(
      destinationLat,
      destinationLng,
      task.locationName || "Destination"
    );
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .custom-avatar {
            border-radius: 50%;
            border: 2px solid #007a3f;
            box-shadow: 0px 2px 4px rgba(0,0,0,0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const destLat = ${destinationLat};
          const destLng = ${destinationLng};
          const userLat = ${userLocation ? userLocation.latitude : destinationLat};
          const userLng = ${userLocation ? userLocation.longitude : destinationLng};

          const map = L.map('map', { zoomControl: false }).setView([destLat, destLng], 18);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          const clientIcon = L.icon({
            iconUrl: '${task.clientImage || "https://via.placeholder.com/150"}',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'custom-avatar'
          });
          L.marker([destLat, destLng], { icon: clientIcon }).addTo(map)
            .bindPopup("${task.clientName || "Destination"}")
            .openPopup();

          L.circle([destLat, destLng], {
            color: '#007a3f',
            fillColor: '#007a3f',
            fillOpacity: 0.15,
            radius: 50
          }).addTo(map);

          if (${!!userLocation}) {
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: '<div style="background:#007a3f; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 6px rgba(0,0,0,0.4);"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

            L.polyline([[userLat, userLng], [destLat, destLng]], {
              color: '#007a3f',
              weight: 3,
              dashArray: '6, 8'
            }).addTo(map);
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Track Location</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Section */}
      <WebView
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={styles.map}
      />

      {/* Task Card Container */}
      <View style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>Task Details</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.status}>
              {hasArrived ? "Arrived" : task.status || "In Transit"}
            </Text>
          </View>
        </View>

        <View style={styles.taskDetails}>
          <Image
            source={{
              uri: task.clientImage || "https://via.placeholder.com/150",
            }}
            style={styles.clientImage}
          />
          <View style={styles.taskInfo}>
            <View style={styles.taskIdRow}>
              <Text style={styles.taskId}>{task.taskId || "TSK-0000"}</Text>
              <View style={styles.communicationContainer}>
                <TouchableOpacity style={styles.messageButton}>
                  <Ionicons name="chatbubble-outline" size={18} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.callButton}>
                  <Ionicons name="call-outline" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.clientRow}>
              <Text style={styles.clientName}>
                {task.clientName || "Client Name"}
              </Text>
            </View>

            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.location}>
                {task.locationName || "Location details"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={handleOpenDirections}
        >
          <MaterialIcons name="directions" size={18} color="#FFFFFF" />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>

        {!hasArrived && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleArrived}
          >
            <Text style={styles.completeButtonText}>Arrived at Site</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Token Modal */}
      {showTokenModal && (
        <TokenModalScreen
          visible={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          taskId={task.taskId}
          arrivalTime={arrivalTime}
          navigation={navigation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    paddingTop: 55,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  map: { flex: 1 },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 60,
    padding: 2,
    borderWidth: 2,
    borderColor: "#007a3f",
  },
  markerImage: { width: 36, height: 36, borderRadius: 18 },
  taskCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 35,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskTitle: { fontSize: 16, fontWeight: "bold" },
  taskDetails: { flexDirection: "row", marginBottom: 16 },
  clientImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  taskInfo: { flex: 1 },
  taskIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskId: { fontSize: 18, fontWeight: "bold" },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clientName: { color: "#666" },
  locationContainer: { flexDirection: "row", alignItems: "center", top: -5 },
  location: { color: "#666", marginLeft: 4 },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#007a3f",
  },
  status: { color: "white", fontSize: 13 },
  communicationContainer: { flexDirection: "row", gap: 8, top: 15 },
  messageButton: {
    backgroundColor: "#EEE8E8",
    padding: 6,
    borderRadius: 6,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: "#EEE8E8",
    padding: 6,
    borderRadius: 6,
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  completeButton: {
    backgroundColor: "#007a3f",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007a3f",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 16,
    gap: 6,
  },
  directionsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  completeButtonText: { color: "white", fontWeight: "500" },
});

export default DeliveryTrackingApp;