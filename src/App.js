import * as React from "react";
import { Platform, StatusBar, StyleSheet, View, Button } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { registerRootComponent } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "@expo/match-media";

import SelectImage from "./screens/SelectImage";
import SelectBook from "./screens/SelectBook";
import Reviews from "./screens/Reviews";
import useLinking from "./navigation/useLinking";
import SearchContext from "./context/SearchContext";
import BookContext from "./context/BookContext";
import theme from "./styles/theme";

const Stack = createStackNavigator();

function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  // for context
  const searchTerms = React.useState([]);
  const book = React.useState({});

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await SplashScreen.preventAutoHideAsync();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf"),
          Righteous: require("./assets/fonts/Righteous-Regular.ttf")
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        await SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const startOver = navigation => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{ name: "Select Image" }]
      })
    );
  };

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <SearchContext.Provider value={searchTerms}>
        <BookContext.Provider value={book}>
          <View style={styles.container}>
            {Platform.OS === "ios" && <StatusBar barStyle="default" />}
            <NavigationContainer
              ref={containerRef}
              initialState={initialNavigationState}
            >
              <Stack.Navigator
                screenOptions={({ navigation }) => ({
                  headerStyle: {
                    backgroundColor: theme.background
                  },
                  title: "",
                  headerRight: () => {
                    return (
                      <Button
                        onPress={() => {
                          // navigation.push("Select Image");
                          startOver(navigation);
                        }}
                        title="Start over "
                        color="#007aff"
                      />
                    );
                  }
                })}
              >
                <Stack.Screen name="Select Image" component={SelectImage} />
                <Stack.Screen name="Select Book" component={SelectBook} />
                <Stack.Screen name="Reviews" component={Reviews} />
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </BookContext.Provider>
      </SearchContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default registerRootComponent(App);
