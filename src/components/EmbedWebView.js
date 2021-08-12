// use as
// <EmbedWebView
//  html = ".. html codes you get from Iframely .."
// />

// Found & taken from: https://iframely.com/docs/react-native

import React, { Component } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

// will receive height data from WebView
function parseMessage(data) {
  try {
    data = JSON.parse(data);
  } catch (ex) {
    data = null;
  }
  return data;
}

// script to inject into WebView
const script = `
    function getHeight(el) {
        var elHeight = el.scrollHeight;
        var docHeight = document.body.scrollHeight;
        var height;
        if (elHeight < docHeight && elHeight > 0) {
            height = elHeight;
        } else {
            height = docHeight;
        }
        return height;
    }
    var height = 0;
    var wrapper = document.body.firstChild;
    function updateSize() {
        var h = getHeight(wrapper);
        if (h !== height) {
            height = h;
            postMessage(JSON.stringify({"height": height}));
        }
    }
    window.addEventListener("message", function() {
        // Listen to all messages to trigger additional size checks.
        // Includes Iframely resize message, native pings from Twitter & et al
        
        // You can also try checking sizes periodically if you have issues
        // see https://github.com/react-native-community/react-native-webview/issues/154
        updateSize();
    });
    updateSize();
`;

// prevent webview scaling & add Iframely default styles and embed.js script as necessary
const head = `
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
iframe {
  width: 100%;
}
.iframely-responsive { 
    top: 0; left: 0; width: 100%; height: 0;
    position: relative; padding-bottom: 50%;
}
.iframely-responsive>* {
    top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;
}
</style>
`;

// please load embed.js script off your custom CDN, if you use it
const embedJsScript = '<script src="https://cdn.iframe.ly/embed.js"></script>';

export default class EmbedWebView extends Component {
  constructor(props) {
    super(props);

    const needScript =
      this.props.html.match(/app=1/) ||
      this.props.html.match(/data-iframely-url=/);

    this.html =
      "<head>" +
      head +
      (needScript ? embedJsScript : "") +
      "</head><body>" +
      this.props.html +
      "</body>";

    this.state = {
      height: 0
    };

    this.onWebViewMessage = this.onWebViewMessage.bind(this);
  }

  onWebViewMessage(e) {
    var message = parseMessage(e.nativeEvent.data);
    if (message && message.height) {
      this.setState({
        height: message.height,
        aspectRatio: null
      });
    }
  }

  render() {
    return (
      <View style={this.props.style}>
        <WebView
          // 'useWebKit' adds support of postMessage for iOS WebView, available from the 0.57 release
          useWebKit={true}
          scrollEnabled={true}
          onMessage={this.onWebViewMessage}
          source={{ html: this.html }}
          // style={{ height: this.state.height }}
          javaScriptEnabled={true}
          injectedJavaScript={script}
          // add more props as you deem necessary, e.g. allowsInlineMediaPlayback, mediaPlaybackRequiresUserAction
        />
      </View>
    );
  }
}
