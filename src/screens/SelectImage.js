import React, { useState, useEffect, useContext } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  SafeAreaView,
  View
} from "react-native";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import getuuid from "../util/getuuid";
import Environment from "../../config/environment";
import firebase from "../../config/firebase";
import SearchContext from "../context/SearchContext";
import theme from "../styles/theme";
import shadow from "../styles/shadow";

export default function SelectImage({ navigation }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [googleResponse, setGoogleResponse] = useState(null);
  const [searchTerms, setSearchTerms] = useContext(SearchContext);

  useEffect(() => {
    Permissions.askAsync(Permissions.CAMERA_ROLL);
    Permissions.askAsync(Permissions.CAMERA);
  }, []);

  const _maybeRenderButtons = () => {
    if (image) {
      return;
    }

    return (
      <>
        <Text style={styles.header}>BOOK REVIEWS {"\n"}CAM</Text>
        <TouchableOpacity style={styles.button} onPress={_takePhoto}>
          <Text style={styles.textButton}>TAKE {"\n"}PICTURE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={_pickImage}>
          <Text style={styles.textButton}>SELECT {"\n"}IMAGE</Text>
        </TouchableOpacity>
      </>
    );
  };

  const _maybeRenderUploadingOverlay = () => {
    if (uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center"
            }
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  const _maybeRenderImage = () => {
    if (!image) {
      return;
    }

    return (
      <>
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
        <TouchableOpacity
          style={styles.wideButton}
          onPress={() => submitToGoogle()}
        >
          <Text style={styles.textButton}>GET REVIEWS</Text>
        </TouchableOpacity>
      </>
    );
  };

  const _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    _handleImagePicked(pickerResult);
  };

  const _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    _handleImagePicked(pickerResult);
  };

  const _handleImagePicked = async pickerResult => {
    try {
      setUploading(true);

      if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri);
        setImage(uploadUrl);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      setUploading(false);
    }
  };

  const submitToGoogle = async () => {
    try {
      setUploading(true);
      let body = JSON.stringify({
        requests: [
          {
            features: [{ type: "TEXT_DETECTION" }],
            image: {
              source: {
                imageUri: image
              }
            }
          }
        ]
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
          Environment["GOOGLE_CLOUD_VISION_API_KEY"],
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: body
        }
      );
      let responseJson = await response.json();
      console.log(responseJson)
      setGoogleResponse(responseJson);
      setSearchTerms(
        responseJson.responses[0].textAnnotations
          .slice(1, 9)
          .map(term => term.description)
      );
      setUploading(false);
    } catch (error) {
      console.log(error);
    } finally {
      navigation.navigate("Select Book");
    }
  };

  return (
    <View style={styles.container}>
      {_maybeRenderButtons()}
      {_maybeRenderImage()}
      {_maybeRenderUploadingOverlay()}
    </View>
  );
}

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const id = await getuuid();

  const ref = firebase
    .storage()
    .ref()
    .child(id);
  const snapshot = await ref.put(blob);

  blob.close();

  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: theme.background
  },
  header: {
    fontSize: 40,
    lineHeight: 50,
    color: theme.textHeader,
    textAlign: "center",
    fontFamily: "Righteous",
    marginTop: 45,
    marginBottom: 26
  },
  button: {
    width: 259,
    height: 139,
    backgroundColor: theme.btnBackground,
    marginBottom: 68,
    justifyContent: "center",
    ...shadow
  },
  wideButton: {
    width: 312,
    height: 108,
    backgroundColor: theme.btnBackground,
    justifyContent: "center",
    marginTop: 58,
    ...shadow
  },
  textButton: {
    color: theme.textHeader,
    fontSize: 36,
    lineHeight: 45,
    textAlign: "center",
    fontFamily: "Righteous"
  },
  imageContainer: {
    backgroundColor: "#E7DECE",
    width: 312,
    marginTop: 66,
    ...shadow
  },
  image: {
    height: 414,
    resizeMode: "contain"
  }
});
