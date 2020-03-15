/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import 'react-native-gesture-handler';
import React, { useState, useEffect, useReducer, useMemo } from 'react';
import LoginForm from './screens/LoginForm';
import Dashboard from './screens/Dashboard';
import Splash from './screens/Splash';
import { Platform, StyleSheet, AsyncStorage, Text, Button, View } from 'react-native';
import { NavigationContainer, NavigationActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext, reducer, prevState } from './Context/AuthContext';

const Stack = createStackNavigator();

const App = (props) => {

  const [state, dispatch] = useReducer(reducer, prevState);
// demo2@foodie.com
// 123456
  const authContext = useMemo(
      () => ({
        signIn: async (email, password) => {
          await fetch("http://192.168.1.243/hellodrive/public/api/shop/login", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              password: password,
            })
          })
          .then((response) => response.json())
          .then((responseData) => {
              console.log(responseData);
              if(responseData && responseData.access_token) {
                dispatch({ type: 'SIGN_IN', token: responseData.access_token, isLoading: false});
                AsyncStorage.setItem('token', responseData.access_token);
              }
          })
          .done();
        },
        signOut: async data => {
          dispatch({ type: 'SIGN_OUT', token: null, isLoading: false});
          AsyncStorage.removeItem('token');
        },
        saveToken: (token) => {
          dispatch({ type: 'SAVE_TOKEN', token: token, isLoading: false});
          AsyncStorage.setItem('token', token);
        }
      }),
      []
    );

  useEffect(() => {
    // Update the document title using the browser API
    AsyncStorage.getItem('token')
    .then((token) => {
        if(token) {
          authContext.saveToken(token);
        } else {
          authContext.signOut();
        }
      }) 
  }, []);

  if(state.isLoading) {
    return (
        <Splash />
      )
  }

  const DrawerButton = (props) => {
  return (
    <View>
      <Button onPress={() => {props.navigation.openDrawer()}} title="Menu"/>
    </View>
  );
};


  return (
      <AuthContext.Provider value={ authContext }>
        <NavigationContainer>
          <Stack.Navigator>
          { state.loggedIn ? (
              <>
                <Stack.Screen name="Dashboard" component={Dashboard}
                />
              </>
            ) : (
              <>
                <Stack.Screen name="LoginForm" component={LoginForm} options={{title:'Login'}} />
              </>
            )
          }
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
  );
};


export default App;
