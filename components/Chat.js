import KeyboardSpacer from 'react-native-keyboard-spacer';
import React, { Component } from 'react';
import { StyleSheet, ImageBackground, Text, TextInput, Alert, TouchableOpacity, Button, View, Platform } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';


export default class Chat extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      messages: [],
    }
  }


  //this will put the users name in navigation bar
  static navigationOptions = ({ navigation }) =>{
    return {
      title: navigation.state.params.name,
    }
  }

componentDidMount() {
  this.setState({
    messages: [
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
      {
        _id: 2,
        text: this.props.navigation.state.params.name + ' has entered the chat',
        createdAt: new Date(),
        system: true,
},
    ],
  })
}

onSend(messages = []) {
  this.setState(previousState => ({
    messages: GiftedChat.append(previousState.messages, messages),
  }))
}

  render(){
  return (
    <View style={{flex: 1, backgroundColor: this.props.navigation.state.params.color}}>
    <GiftedChat
      messages={this.state.messages}
      onSend={messages => this.onSend(messages)}
      user={{_id: 1,}}
    />
    {Platform.OS === 'android' ? <KeyboardSpacer /> : null }
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
