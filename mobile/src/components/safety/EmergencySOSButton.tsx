import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Vibration,
  Linking,
  Modal
} from "react-native";
import * as Haptics from "expo-haptics";

interface EmergencySOSButtonProps {
  onTriggerSOS: () => void;
  disabled?: boolean;
}

export const EmergencySOSButton: React.FC<EmergencySOSButtonProps> = ({
  onTriggerSOS,
  disabled = false
}) => {
  const [holding, setHolding] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [tapToConfirmMode, setTapToConfirmMode] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const holdTimerRef = useRef<any>(null);
  const countdownTimerRef = useRef<any>(null);

  const HOLD_DURATION = 1800; // 1.8 seconds hold time

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const startHold = () => {
    if (disabled || showCountdown) return;

    setHolding(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      Vibration.vibrate(100);
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.96, // pressScale >= 0.96
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: HOLD_DURATION,
        useNativeDriver: false
      })
    ]).start();

    holdTimerRef.current = setTimeout(() => {
      completeHold();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (!holding) return;
    setHolding(false);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
  };

  const completeHold = () => {
    setHolding(false);
    scaleAnim.setValue(1);
    progressAnim.setValue(0);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      Vibration.vibrate([0, 200, 100, 200]);
    }

    // Start 3-second cancellation countdown
    startCountdown();
  };

  const startCountdown = () => {
    setCountdownSeconds(3);
    setShowCountdown(true);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setShowCountdown(false);
          onTriggerSOS(); // Fire actual SOS alert
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setShowCountdown(false);
  };

  const forceImmediateSend = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setShowCountdown(false);
    onTriggerSOS();
  };

  const handle112Call = () => {
    Linking.openURL("tel:112");
  };

  const fillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  return (
    <View style={styles.container}>
      {/* Tap & Confirm Accessibility Toggle */}
      <TouchableOpacity
        onPress={() => setTapToConfirmMode(!tapToConfirmMode)}
        style={styles.accessibleToggleBtn}
        accessibilityRole="button"
        accessibilityLabel="Toggle accessible tap and confirm SOS mode"
      >
        <Text style={styles.accessibleToggleText}>
          {tapToConfirmMode ? "♿ Mode: Tap & Confirm (Active)" : "♿ Switch to Accessible Tap Mode"}
        </Text>
      </TouchableOpacity>

      {/* Raised Power Smash SOS Button */}
      {tapToConfirmMode ? (
        <TouchableOpacity
          onPress={startCountdown}
          activeOpacity={0.8}
          style={styles.powerSmashButton}
          accessibilityRole="button"
          accessibilityLabel="Emergency SOS Tap Button"
        >
          <Text style={styles.sirenIcon}>🚨</Text>
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.subText}>TAP TO CONFIRM</Text>
        </TouchableOpacity>
      ) : (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPressIn={startHold}
            onPressOut={cancelHold}
            style={styles.powerSmashButton}
            accessibilityRole="button"
            accessibilityLabel="Emergency SOS Hold Button. Hold for 1.8 seconds to activate."
          >
            {/* Progress Fill Indicator */}
            <Animated.View style={[styles.progressFill, { width: fillWidth }]} />

            <View style={styles.buttonContent}>
              <Text style={styles.sirenIcon}>🚨</Text>
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.subText}>
                {holding ? "HOLDING..." : "PRESS & HOLD"}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* Direct 112 Dialer Shortcut Button */}
      <TouchableOpacity
        onPress={handle112Call}
        style={styles.emergency112Btn}
        accessibilityRole="button"
        accessibilityLabel="Call 112 National Emergency Hotline directly"
      >
        <Text style={styles.emergency112Text}>📞 Direct 112 Hotline Dialer</Text>
      </TouchableOpacity>

      {/* 3-Second Cancellation Countdown Modal */}
      <Modal visible={showCountdown} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚨 SOS TRIGGERED</Text>
            <Text style={styles.modalSub}>
              Broadcasting incident & live coordinates to your guardians in:
            </Text>

            <View style={styles.countdownBadge}>
              <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
              <Text style={styles.countdownUnit}>SEC</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={cancelCountdown}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>CANCEL ALERT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={forceImmediateSend}
                style={styles.sendNowButton}
              >
                <Text style={styles.sendNowButtonText}>SEND NOW ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    width: "100%"
  },
  accessibleToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    marginBottom: 16
  },
  accessibleToggleText: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600"
  },
  powerSmashButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    // Raised 3D visual depth
    borderBottomWidth: 8,
    borderBottomColor: "#991B1B",
    borderRightWidth: 4,
    borderRightColor: "#991B1B",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
    overflow: "hidden",
    position: "relative"
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    zIndex: 1
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2
  },
  sirenIcon: {
    fontSize: 32,
    marginBottom: 4
  },
  sosText: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 2
  },
  subText: {
    color: "#FEE2E2",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    letterSpacing: 1
  },
  emergency112Btn: {
    marginTop: 20,
    backgroundColor: "#7F1D1D",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EF4444"
  },
  emergency112Text: {
    color: "#FEE2E2",
    fontWeight: "700",
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 7, 18, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#111827",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#EF4444",
    padding: 24,
    alignItems: "center"
  },
  modalTitle: {
    color: "#EF4444",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8
  },
  modalSub: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20
  },
  countdownBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#7F1D1D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#EF4444"
  },
  countdownNumber: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900"
  },
  countdownUnit: {
    color: "#FEE2E2",
    fontSize: 10,
    fontWeight: "700"
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%"
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center"
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13
  },
  sendNowButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center"
  },
  sendNowButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13
  }
});
