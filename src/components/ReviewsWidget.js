import React from "react";
import { View, Text, StyleSheet, Linking, Dimensions } from "react-native";
import { useMediaQuery } from "react-responsive";
import EmbedWebView from "./EmbedWebView";

export default function ReviewsWidget({ isbn }) {
  console.log(isbn);

  const isSmallDevice = useMediaQuery({
    maxDeviceWidth: 320
  });

  return (
    <View style={isSmallDevice ? styles.smallContainer : styles.container}>
      <View style={styles.goodreadsWidget}>
        <EmbedWebView
          html={`<iframe
                    id="the_iframe"
                    src="https://www.goodreads.com/api/reviews_widget_iframe?did=63343&format=html&header_text=Goodreads+Reviews&isbn=${isbn}&links=660&min_rating=&num_reviews=&review_back=ffffff&stars=FFA942&stylesheet=&text=686657"
                    frameborder="0"
                    height="100%"
                  ></iframe>`}
          style={{ height: "95%" }}
        />
        <View style={styles.gr_footer} id="gr_footer">
          <Text
            style={styles.goodreadsWidgetGrBranding}
            class="gr_branding"
            target="_blank"
            rel="nofollow noopener noreferrer"
            onPress={() => Linking.openURL("https://www.goodreads.com/")}
          >
            Reviews from Goodreads.com
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "90%"
  },
  smallContainer: {
    flex: 1,
    width: 314
  },
  goodreadsWidget: {
    padding: 18
  },
  gr_footer: {
    width: "100%",
    borderTopWidth: 1,
    textAlign: "right"
  },
  goodreadsWidgetGrBranding: {
    color: "#382110",
    fontSize: 11,
    textDecorationLine: "none",
    fontFamily: "Helvetica"
  }
});
