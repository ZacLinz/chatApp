import KeyboardSpacer from "react-native-keyboard-spacer";
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Platform,
  AsyncStorage
} from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import firebase from "firebase";
import "firebase/firestore";
import MapView from 'react-native-maps';
import config from "config";

/**
* @class chat
* @requires React
* @requires React-native
* @requires react-native-keyboard-spacer
* @requires react-native-gifted-chat
* @requires react-native-community/netinfo
* @requires CustomActions from './CustomActions'
* @requires firebase
* @requires firestore
*/


export default class Chat extends React.Component {
  constructor() {
    super();
    /**
    * firestore credentials
    * @param {string} apiKey
    * @param {string} authDomain
    * @param {string} databaseURL
    * @param {string} projectId
    * @param {string} storageBucket
    * @param {string} messageSenderId
    * @param {string} appId
    * @param {string} measurementId
    */

    if (!firebase.apps.length) {
      firebase.initializeApp({config})
    }

    this.referenceMessageUser = null;
    this.referenceMessages = firebase.firestore().collection('messages')

    this.state = {
      messages: [],
      uid: 0,
      isConnected: false,
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
    };
  }

  //this will put the users name in navigation bar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name
    };
  };

//allows default values to be set for a users name and avatar

/**
* sets default data for a user if none is provided
* @function setUser
* @params {string} _id
* @params {string} name
* @params {string} avatar
* called in componentWillMount()
*/

  setUser = (_id, name = 'Guest User', avatar = 'https://placeimg.com/140/140/any') => {
    this.setState({
      user: {
        _id: _id,
        name: name,
        avatar: avatar,
      }
    })
  }

  /**
  * updates the state based on firestore collection update
  * is called whenever the collection is updated
  * @function onCollectionUpdate
  * @param {string} _id
  * @param {string} text
  * @param {date} createdAt
  * @param {object} user
  * @param {string} image
  * @param {location} location

  */

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach(doc => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || '',
        location: data.location || null,
      });
    });
    this.setState({
      messages
    });
  };


/**
* Adds message to firestore reference database
* @type {string} _id
* @type {sting} text
* @type {date} createdAt
* @type {object} user
* @type {string} image url
* @type {location} location
* adds all data to firestore
*/
  addMessage() {
    console.log(this.state.user)
      this.referenceMessages.add({
        _id: this.state.messages[0]._id,
        text: this.state.messages[0].text || '',
        createdAt: this.state.messages[0].createdAt,
        user: this.state.user,
        uid: this.state.uid,
        image: this.state.messages[0].image || '',
        location: this.state.messages[0].location || null,
    });
  }

  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }

// async functions

/**
* loads all messages from async storage
* @function getMessages
* @async
* @return {Promise<string>} the data from the storage
*/
  getMessages = async () => {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error){
      console.log(error.message);
    }
  };

  /**
  * saves messages to AsyncStorage
  * @function saveMessages
  * @async
  * @return {Promise<string>} The data will be saved to storage
  */
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }
  /**
  * deletes messages from AsyncStorage
  * not currently used in app
  * @function deleteMessage
  * @async
  * @return {Promise<string>} The data will deleted from storage
  */

  deleteMessage = async () => {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message);
    }
  }
/**
* NetInfo checks if user is online and sets state appropriately
* firebase uses anonymous authentication
* subscribes authenticated user to firestore collection
* retrieves messages in firestore
*/
  componentDidMount() {
    // listen to authentication events
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected == true) {
        console.log('online');
        this.setState({
          isConnected: true,
        })
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }
          //update user state with currently active user data
          if(!this.props.navigation.state.params.name){
          this.setUser(user.uid );
          this.setState({
            uid: user.uid,
            loggedInText: "Hello there"
          });
        }else{
          this.setUser(user.uid, this.props.navigation.state.params.name )
          this.setState({
            uid: user.uid,
            loggedInText: "Hello there"
          });
        }

      // create a reference to the active user's documents (messages)
        this.referenceMessageUser = firebase.firestore().collection("messages");
        // listen for collection changes for current user
        this.unsubscribeMessageUser = this.referenceMessageUser.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
      });
    } else {
      console.log('offline');
      this.setState({
        isConnected: false,
      });
      this.getMessages();
    }
  })
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeMessageUser();
  }

  //Gifted Chat functions
  /**
  * GiftedChat render bubble
  *@function renderBubble
  * sets the background color of message bubbles
  */
  renderBubble(props) {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: '#123458'
        },
        left: {
          backgroundColor: '#6495ED'
        }
      }}
    />
  )
}

/**
*does not render toolbar if device is offline
*@function renderInputToolbar
*/

  renderInputToolbar(props){
    if (this.state.isConnected == false){
    } else {
      return (
        <InputToolbar
          {...props}
        />
      )
    }
  }

  /**
  * uses CustomActions defined in CustomActions component
  */

  renderCustomActions = (props) => {
   return <CustomActions {...props} />;
 };


/**
*renders a map view if user wants to share their location
*/
 renderCustomView(props){
   const { currentMessage } = props;
   if (currentMessage.location) {
     return (
         <MapView
           style={{width: 150, height: 100, borderRadius: 13, margin: 3}}
           region={{latitude: currentMessage.location.latitude, longitude: currentMessage.location.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421}}
         />
     );
   }
   return null;
 }

  render() {
    /**
    * uses name and background color defiend on start screen
    */
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.props.navigation.state.params.color
        }}
      >
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions.bind(this)}
          renderCustomView={this.renderCustomView.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
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
