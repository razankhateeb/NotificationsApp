import { StatusBar } from "expo-status-bar";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    }

    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received");
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    const subscriptionResp =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received");
        console.log(response);
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      });
    return () => {
      subscription.remove();
      subscriptionResp.remove();
    };
  }, []);

  function scheduleNotificationHandler() {
    console.log("start");
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification.",
        data: { userName: "Razan" },
      },
      trigger: {
        seconds: 5,
      },
    })
      .then((response) => {
        console.log("Notification scheduled: ", response);
      })
      .catch((error) => {
        console.log("Error scheduling notification: ", error);
      });
  }

  function schedulePushNotification() {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to: "ExponentPushToken[A1E23s5XxeDF_5A1S2d34s]",
        title: "Test - sent from device",
        body: "This is a test.",
      }),
    });
  }
  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification in 5 seconds"
        onPress={scheduleNotificationHandler}
      />

      <Button
        title="Schedule Push Notification"
        onPress={schedulePushNotification}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
