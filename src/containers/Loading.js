import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Dimensions, Image } from "react-native";
import { firebase } from "../firebase/Config";
import { useDispatch, useSelector } from "react-redux";
import * as authActions from "../actions/Auth";
import * as booksActions from "../actions/Books";
import * as socialActions from "../actions/Social";
import Spinner from "../components/Spinner";
import { COLORS } from "../constants";

const Pulse = require("react-native-pulse").default;

function Loading(props) {
  const dispatch = useDispatch();
  const database = firebase.firestore();
  const userInState = useSelector((state) => state.auth.user);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user && !userInState) {
        database
          .collection("users")
          .doc(user.uid)
          .get()
          .then(function (response) {
            const responseData = response.data();
            dispatch(authActions.login(responseData));
            let favoriteBooksFromDB = responseData.favoriteBooks;
            let favoriteBooks = {};
            favoriteBooksFromDB.forEach((favoriteBook) => {
              favoriteBooks[favoriteBook.bookID] = favoriteBook.book;
            });
            dispatch(booksActions.setFavoriteBooks(favoriteBooks));
            let collectionFromDB = responseData.collection;
            let collection = {};
            collectionFromDB.forEach((item) => {
              collection[item.bookID] = item.book;
            });
            dispatch(booksActions.setCollection(collection));
            let friendsFromDB = responseData.friends;
            let friends = {};
            friendsFromDB.forEach((item) => {
              friends[item.uid] = item.friend;
            });
            dispatch(socialActions.setFriends(friends));
            props.navigation.navigate("MainNavigator");
          })
          .catch(function (error) {
            console.error(error);
          });
      } else {
        props.navigation.navigate("Login");
      }
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.black,
        position: "relative",
      }}
    >
      <View style={styles.circle}>
        <Pulse
          color="#f96d41"
          numPulses={1}
          diameter={220}
          speed={20}
          duration={1}
          initialDiameter={150}
        />
      </View>
      <Image
        style={{ height: 150, width: 150 }}
        source={require("../../assets/logo.png")}
      />
    </View>
  );
}

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1b26",
  },
  circle: {
    width: 100,
    height: 100,
    position: "absolute",
    left: Dimensions.get("window").width / 2,
    top: Dimensions.get("window").height / 2,
    marginLeft: -100 / 2,
    marginTop: -100 / 2,
  },
});
