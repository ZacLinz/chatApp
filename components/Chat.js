import KeyboardSpacer from "react-native-keyboard-spacer";
import React, { Component } from "react";
import {
  StyleSheet,
  ImageBackground,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Button,
  View,
  Platform
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import firebase from "firebase";
import "firebase/firestore";

export default class Chat extends React.Component {
  constructor() {
    super();


    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyAPPB1RjDE43q61ee-YBA4dVMV1rH2UW9M",
        authDomain: "chatapp-a9af6.firebaseapp.com",
        databaseURL: "https://chatapp-a9af6.firebaseio.com",
        projectId: "chatapp-a9af6",
        storageBucket: "chatapp-a9af6.appspot.com",
        messagingSenderId: "761937547166",
        appId: "1:761937547166:web:8fe9859120960ca9cfd08f",
        measurementId: "G-FH7JX8GNCG"
      })
    }

    this.referenceMessageUser = null;
    this.referenceMessages = firebase.firestore().collection('messages')

    this.state = {
      messages: [],
      uid: 0
    };
  }

  //this will put the users name in navigation bar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name
    };
  };

  get user() {
    return {
      name: this.props.navigation.state.params.name,
      _id: this.state.uid,
      id: this.state.uid,
    }
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach(doc => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user.toString(),
        image: data.image,
        location: data.location
      });
    });
    this.setState({
      messages
    });
  };

  addMessage() {
    console.log(this.state.messages[0])
      this.referenceMessages.add({
        _id: this.state.messages._id,
        text: this.state.messages.text || '',
        createdAt: this.state.messages.createdAt,
        user: [this.state.uid, this.props.navigation.state.params.name, ''],
        image: this.state.messages.image || '',
        location: this.state.messages.location || null,
        uid: this.state.uid,
    });
  }

  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }),
      () => {
        this.addMessage();
      }
    );
  }

  componentDidMount() {
    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: "Hello there"
      });

      // create a reference to the active user's documents (messages)
      this.referenceMessageUser = firebase.firestore().collection("messages").where("uid", "==", this.state.uid);
      // listen for collection changes for current user
      this.unsubscribeMessageUser = this.referenceMessageUser.onSnapshot(this.onCollectionUpdate);
    });
    this.setState({
    messages: [
      {
      _id: 2,
      text: this.props.navigation.state.params.name + " has entered the chat",
      createdAt: new Date(),
      system: true,
    }
    ]
  })
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeMessageUser();
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.props.navigation.state.params.color
        }}
      >
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.user}
        />
        {Platform.OS === "android" ? <KeyboardSpacer /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  }
});
