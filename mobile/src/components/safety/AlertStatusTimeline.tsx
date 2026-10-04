import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AlertStatusTimelineProps {
  status: "draft_local" | "pending_upload" | "active" | "acknowledged" | "resolved" | "expired";
  alertStatus?: "queued" | "provider_accepted" | "provider_failed" | "guardian_acknowledged";
  isOffline?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export const AlertStatusTimeline: React.FC<AlertStatusTimelineProps> = ({
  status,
  alertStatus,
  isOffline = false,
  acknowledgedBy,
  acknowledgedAt
}) => {
  if (isOffline) {
    return (
      <View style={[styles.container, styles.offlineContainer]}>
        <Text style={styles.offlineTitle}>⚠️ NOT SENT — Waiting for Network</Text>
        <Text style={styles.offlineSub}>
          Your SOS alert is queued in local encrypted outbox. Will retry automatically when internet returns.
        </Text>
      </View>
    );
  }

  if (status === "acknowledged" || alertStatus === "guardian_acknowledged") {
    return (
      <View style={[styles.container, styles.acknowledgedContainer]}>
        <Text style={styles.acknowledgedTitle}>🟢 Guardian Acknowledged Alert</Text>
        <Text style={styles.acknowledgedSub}>
          {acknowledgedBy ? `${acknowledgedBy} has seen and responded to your alert.` : "A trusted guardian has seen your SOS request."}
          {acknowledgedAt ? ` (${new Date(acknowledgedAt).toLocaleTimeString()})` : ""}
        </Text>
      </View>
    );
  }

  if (status === "active") {
    return (
      <View style={[styles.container, styles.activeContainer]}>
        <Text style={styles.activeTitle}>🚨 SOS Alert Broadcasted</Text>
        <Text style={styles.activeSub}>
          {alertStatus === "provider_accepted"
            ? "Server accepted incident. Escalating push alerts to your trusted guardians..."
            : "Incident active. Waiting for guardian acknowledgement."}
        </Text>
      </View>
    );
  }

  if (status === "resolved") {
    return (
      <View style={[styles.container, styles.resolvedContainer]}>
        <Text style={styles.resolvedTitle}>✅ Incident Resolved</Text>
        <Text style={styles.resolvedSub}>You have marked yourself safe.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.safeContainer]}>
      <Text style={styles.safeTitle}>🟢 Status: Protected & Safe</Text>
      <Text style={styles.safeSub}>SHEild AI monitoring active</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    marginVertical: 12
  },
  offlineContainer: {
    backgroundColor: "#78350F",
    borderWidth: 1,
    borderColor: "#F59E0B"
  },
  offlineTitle: {
    color: "#FEF3C7",
    fontWeight: "800",
    fontSize: 15
  },
  offlineSub: {
    color: "#FDE68A",
    fontSize: 12,
    marginTop: 4
  },
  acknowledgedContainer: {
    backgroundColor: "#064E3B",
    borderWidth: 1,
    borderColor: "#34D399"
  },
  acknowledgedTitle: {
    color: "#D1FAE5",
    fontWeight: "800",
    fontSize: 15
  },
  acknowledgedSub: {
    color: "#A7F3D0",
    fontSize: 12,
    marginTop: 4
  },
  activeContainer: {
    backgroundColor: "#7F1D1D",
    borderWidth: 1,
    borderColor: "#EF4444"
  },
  activeTitle: {
    color: "#FEE2E2",
    fontWeight: "800",
    fontSize: 15
  },
  activeSub: {
    color: "#FECACA",
    fontSize: 12,
    marginTop: 4
  },
  resolvedContainer: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151"
  },
  resolvedTitle: {
    color: "#9CA3AF",
    fontWeight: "700",
    fontSize: 14
  },
  resolvedSub: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2
  },
  safeContainer: {
    backgroundColor: "#052E16",
    borderWidth: 1,
    borderColor: "#166534"
  },
  safeTitle: {
    color: "#4ADE80",
    fontWeight: "800",
    fontSize: 15
  },
  safeSub: {
    color: "#86EFAC",
    fontSize: 12,
    marginTop: 2
  }
});
