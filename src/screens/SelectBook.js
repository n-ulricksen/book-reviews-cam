import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  StyleSheet
} from "react-native";
import SearchContext from "../context/SearchContext";
import BookContext from "../context/BookContext";
import theme from "../styles/theme";
import shortenText from "../util/shortenText";

export default function SelectBook({ navigation }) {
  const [searchTerms, setSearchTerms] = useContext(SearchContext);
  const [_, setBook] = useContext(BookContext);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
    return () => {};
  }, [searchTerms, setSearchTerms]);

  const fetchBooks = async () => {
    const BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?q=";
    const searchQuery = searchTerms.join("%20");

    let response = await fetch(BOOKS_URL + searchQuery);
    let responseJson = await response.json();

    let books = responseJson.items.map(item => {
      const {
        industryIdentifiers,
        imageLinks,
        title,
        authors,
        publishedDate
      } = item.volumeInfo;
      return {
        isbn: industryIdentifiers[0].identifier,
        image: imageLinks.smallThumbnail,
        title,
        authors,
        publishedDate
      };
    });

    setBooks(books);
  };

  const onBookSelect = book => {
    setBook(book);

    navigation.navigate("Reviews");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.textHeading}>Book Results..</Text>
      <FlatList
        style={styles.flatList}
        data={books}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={
              index % 2 == 0 ? styles.flatListItem : styles.flatListItemAlt
            }
            onPress={() => {
              onBookSelect(item);
            }}
          >
            <Image style={styles.listImage} source={{ uri: item.image }} />
            <View style={styles.listItemDesc}>
              <Text style={styles.listItemDescText}>
                {shortenText(item.title)}
              </Text>
              <Text style={styles.listItemDescText}>
                {item.authors &&
                  item.authors.length > 0 &&
                  shortenText(item.authors.join(", "))}
              </Text>
              <Text style={styles.listItemDescText}>{item.publishedDate}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(_, index) => {
          return index.toString();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: "center"
  },
  textHeading: {
    fontSize: 40,
    lineHeight: 50,
    textAlign: "center",
    marginTop: 48,
    marginBottom: 38,
    color: theme.textHeader,
    fontFamily: "Righteous"
  },
  flatList: {
    flex: 1,
    width: 314
  },
  flatListItem: {
    paddingVertical: 18,
    height: 108,
    paddingHorizontal: 12,
    backgroundColor: theme.listBackground,
    flexDirection: "row"
  },
  flatListItemAlt: {
    paddingVertical: 18,
    height: 108,
    paddingHorizontal: 12,
    backgroundColor: theme.listBackground2,
    flexDirection: "row"
  },
  listImage: {
    width: 72,
    height: 72,
    marginRight: 16
  },
  listItemDesc: {
    width: 200
  },
  listItemDescText: {
    fontSize: 18,
    lineHeight: 25,
    fontFamily: "Righteous",
    color: theme.text
  }
});
