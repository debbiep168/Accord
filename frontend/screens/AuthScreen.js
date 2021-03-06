'use strict';
import React, { Component } from 'react';
import { Animated, Keyboard, Dimensions, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ScrollView, Alert, AppRegistry, StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
// var t = require('tcomb-form-native');
import t from '../style/authStyle';
import * as firebase from 'firebase';
import stylesheet from '../style/authStyle';

var Form = t.form.Form;

const backgroundImage = require('../assets/icons/backgroundimg.png');
const goBackButton = require('../assets/icons/back.png');
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT =70;
const IMAGE_HEIGHT_SMALL =30;



const nickname = t.refinement(t.String, nickname => {
  return nickname.length <=12;
})

const Email = t.refinement(t.String, email => {
  const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/; //or any other regexp
  return reg.test(email);
});

const StrongPassword = t.refinement(t.String, password => {
  return password.length >= 6;
});

// here we are: define your domain model
var Person = t.struct({
  nickname: nickname,              // a required string
  email: Email,
  gender: t.String,
  school: t.String,
  description: t.String,
  password: StrongPassword,
});

var options = {
  fields: {
    email : {
      error: 'Insert a valid email address'
    },
    password: {
      password: true,
      secureTextEntry: true,
      error: 'Insert a password greater than 6 characters'
    },
    nickname: {
      error: 'Nickname should be less than 12 characters'
    }
  }
};


class AwesomeProject extends Component {
  constructor(props){
    super(props);

    this.keyboardHeight = new Animated.Value(0);
    this.imageHeight = new Animated.Value(IMAGE_HEIGHT);

  }

  componentWillMount () {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = (event) => {
   Animated.parallel([
     Animated.timing(this.keyboardHeight, {
       duration: event.duration,
       toValue: event.endCoordinates.height,
     }),
     Animated.timing(this.imageHeight, {
       duration: event.duration,
       toValue: IMAGE_HEIGHT_SMALL,
     }),
   ]).start();
 };

 keyboardWillHide = (event) => {
  Animated.parallel([
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0,
    }),
    Animated.timing(this.imageHeight, {
      duration: event.duration,
      toValue: IMAGE_HEIGHT,
    }),
  ]).start();
};


  registerSubmit({nickname, email, gender, school, description, password}) {
		firebase.auth().createUserWithEmailAndPassword(email, password)
		.then((user) => {
      return user.sendEmailVerification();
		})
    .then(() => {
      return fetch('https://us-central1-accord-18bdf.cloudfunctions.net/route/register', {
				method: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({nickname, password, gender, email, school, desc: description})
			})
    })
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson !== null) {
        Alert.alert('Please check your inbox for a verification email');
				this.props.navigation.navigate('Login')
				console.log(responseJson);
			}else{
				Alert.alert('Something went wrong, please try again.');
			}
		})
		.catch((err) => {
      // err.code ==== auth/email-already-in-use
      Alert.alert(err.message);
		});
	}


  onPress() {
    console.log('navigation exists :O', this.props.navigation)
    // call getValue() to get the values of the form
    var value = this.form.getValue();
    if (value) { // if validation fails, value will be null
      // Alert.alert('value:' + JSON.stringify(value.email));
      // console.log(value); // value here is an instance of Person
      this.registerSubmit(value);
    }
  }


  onGoBack() {
    this.props.navigation.navigate('Welcome');
  }

  render() {
      if(Platform.OS === 'android') {
        return (
        <View style={{flex: 1}}>
          <View style={{flex: 13}}>
            <KeyboardAvoidingView
              keyboardVerticalOffset={400}
              style={[styles.container, { flex: 14}]}
              behavior="padding"
              >
                <View style={{ backgroundColor: 'transparent'}}>
                  <Image
                    source={require('../assets/icons/icon2.png')}
                    style={{width: 130, height: 45, alignSelf:'center'}}
                    rezieMode='contain'
                    >
                    </Image>
                  </View>
                  <Form
                    ref={(form) => {this.form = form}}
                    type={Person}
                    options={options}
                  />
                </KeyboardAvoidingView>
              </View>
              <View style={{flex: 1, backgroundColor: '#fcf6e3', flexDirection: 'row'}}>
                <TouchableHighlight
                  rezieMode='contain'
                  style={styles.buttonLeft}
                  onPress={() => this.onPress()}
                  underlayColor='#fcf6e3'>
                  <Text
                    style={styles.buttonText}
                    rezieMode='contain'
                    >Sign Up</Text>
                  </TouchableHighlight>

                  <TouchableHighlight
                    style={styles.buttonRight}
                    rezieMode='contain'
                    onPress={() => this.onGoBack()}
                    underlayColor='#fcf6e3'>
                    <Text
                      style={styles.buttonText}
                      rezieMode='contain'
                      >Go Back</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              )
      } else {
        return (
        <View style={{flex: 1}}>
          <View style={{flex: 13}}>
            <Animated.View
              style={[styles.container, { paddingBottom: this.keyboardHeight, flex: 14}]}>
              {/* <View style={{ backgroundColor: 'transparent'}}>
                <Animated.Image
                  source={require('../assets/icons/icon2.png')}
                  style={{width: 280, height: 70, alignSelf:'center'}}
                  rezieMode='contain'
                  >
                  </Animated.Image>
                </View> */}
                <Form
                  ref={(form) => {this.form = form}}
                  type={Person}
                  options={options}
                />
              </Animated.View>
            </View>
            <View style={{flex: 1, backgroundColor: '#fcf6e3', flexDirection: 'row'}}>
              <TouchableHighlight
                rezieMode='contain'
                style={styles.buttonLeft}
                onPress={() => this.onPress()}
                underlayColor='#fcf6e3'>
                <Text
                  style={styles.buttonText}
                  rezieMode='contain'
                  >Sign Up</Text>
                </TouchableHighlight>

                <TouchableHighlight
                  style={styles.buttonRight}
                  rezieMode='contain'
                  onPress={() => this.onGoBack()}
                  underlayColor='#fcf6e3'>
                  <Text
                    style={styles.buttonText}
                    rezieMode='contain'
                    >Go Back</Text>
                  </TouchableHighlight>
                </View>
              </View>
            )
      }
          }

        }

var styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 13,
    padding: 20,
    backgroundColor: '#34495e',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        fontFamily:'Avenir'
      },
      android: {
        fontFamily: 'Roboto'
      }
    })
  },
  buttonRight: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#6adaa8',
    borderColor: '#34495e',
    borderLeftWidth: 1,
  },
  buttonLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#6adaa8',
    borderColor: '#34495e',
    borderRightWidth: 1,
  }
});

export default AwesomeProject;
