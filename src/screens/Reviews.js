import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import ReviewsWidget from "../components/ReviewsWidget";
import BookContext from "../context/BookContext";
import theme from "../styles/theme";

export default function Reviews() {
  const [book, setBook] = useContext(BookContext);

  return (
    <View style={styles.container}>
      <ReviewsWidget isbn={book.isbn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.background
  }
});
