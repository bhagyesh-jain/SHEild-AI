import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";

import * as Location from "expo-location";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { Accelerometer } from "expo-sensors";
import MapView, { Marker, Circle } from "react-native-maps";


export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [sosActive, setSosActive] =useState(false);
  
  useEffect(() => {
    getLocation();
  
    Accelerometer.setUpdateInterval(300);
  
    const subscription = Accelerometer.addListener((data) => {
      const total =
        Math.abs(data.x) +
        Math.abs(data.y) +
        Math.abs(data.z);
  
      if (total > 2.4 && !sosActive) {
        setSosActive(true);
  
        triggerSOS();
  
        setTimeout(() => {
          setSosActive(false);
        }, 10000);
      }
    });
  
    return () => {
      subscription.remove();
    };
  }, [sosActive, location]);

  const getLocation = async () => {
    let { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation(loc.coords);
  };

  const playSiren = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/siren.wav")
    );

    await sound.playAsync();
  };

  const triggerSOS = async () => {
    if (!location) return;

    await playSiren();

    const message =
      `🚨 EMERGENCY ALERT 🚨\n\n` +
      `I need help.\n\n` +
      `My Live Location:\n` +
      `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

    const phoneNumber = "+919302266309";

    const whatsappURL =
      `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappURL);

    setTimeout(() => {
      Linking.openURL(`tel:${phoneNumber}`);
    }, 3000);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#030712",
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 80,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 38,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        SHEild AI 🛡️
      </Text>
  
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 16,
          marginBottom: 40,
        }}
      >
        Smart Women Safety System
      </Text>
  
      <View
        style={{
          width: "100%",
          backgroundColor: "#111827",
          padding: 20,
          borderRadius: 24,
          marginBottom: 30,
        }}
      >
        <Text
          style={{
            color: "#60A5FA",
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          📍 Live Location
        </Text>
  
        {location && (
          <>
            <Text style={{ color: "white", marginBottom: 6 }}>
              Latitude: {location.latitude}
            </Text>
  
            <Text style={{ color: "white" }}>
              Longitude: {location.longitude}
            </Text>
          </>
        )}
        {location && (
  <MapView
    style={{
      width: "100%",
      height: 220,
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 30,
    }}
ScrollEnable={false}
zoomEnable={false}
rotateEnable={false}
pitchEnable={false}  
initialRegion={{
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
  >
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      title="You are here"
      description="Current Live Location"
    />
    <Circle
  center={{
    latitude: location.latitude + 0.001,
    longitude: location.longitude + 0.001,
  }}
  radius={120}
  fillColor="rgba(255,0,0,0.35)"
  strokeColor="red"
/>

<Circle
  center={{
    latitude: location.latitude - 0.001,
    longitude: location.longitude - 0.001,
  }}
  radius={120}
  fillColor="rgba(34,197,94,0.35)"
  strokeColor="green"
/>

<Circle
  center={{
    latitude: location.latitude,
    longitude: location.longitude + 0.002,
  }}
  radius={120}
  fillColor="rgba(120,53,15,0.35)"
  strokeColor="brown"
/>
  </MapView>
)}
    </View>
      <TouchableOpacity
        onPress={triggerSOS}
        style={{
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: "#DC2626",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "red",
          shadowOpacity: 0.9,
          shadowRadius: 25,
          elevation: 20,
          marginBottom: 40,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 42,
            fontWeight: "bold",
          }}
        >
          SOS
        </Text>
      </TouchableOpacity>
  
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#1F2937",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 18,
            width: "48%",
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            📞 Fake Call
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={{
            backgroundColor: "#1F2937",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 18,
            width: "48%",
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            📤 Share
          </Text>
        </TouchableOpacity>
      </View>
  
      <View
  style={{
    backgroundColor: "#052e16",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
  }}
>
  <Text
    style={{
      color: "#4ADE80",
      fontWeight: "bold",
      fontSize: 16,
    }}
  >
    🟢 Status: Safe
  </Text>
</View>

</ScrollView>
);
}