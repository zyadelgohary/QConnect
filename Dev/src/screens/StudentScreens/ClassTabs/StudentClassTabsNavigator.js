import React from 'react';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { PixelRatio } from 'react-native';
import colors from 'config/colors';
import { Icon } from 'react-native-elements';
import strings from '../../../../config/strings';
import StudentMainScreen from './StudentMainScreen';
import { screenHeight } from 'config/dimensions';
import FeedsScreen from '../../UniversalClassScreens/FeedsScreen';
import { string } from 'prop-types';

var iconSizeSelected = PixelRatio.get() < 2 ? 18 : 25;
var iconSizeNotSelected = PixelRatio.get() < 2 ? 14 : 20;
var fontSize = PixelRatio.get() < 2 ? 12 : 14;

const routeConfig = {
  ClassTab: {
    screen: StudentMainScreen,
    navigationOptions: {
      tabBarLabel: strings.Class,
      tabBarIcon: ({ tintColor, focused }) => (
        <Icon
          name="home"
          size={focused ? iconSizeSelected : iconSizeNotSelected}
          type="font-awesome"
          color={tintColor}
        />
      ),
    },
  },
  FeedsScreen: {
    screen: FeedsScreen,
    navigationOptions: {
      tabBarLabel: strings.Feed,
      tabBarIcon: ({tintColor, focused}) => (
        <Icon 
          type="material" 
          name="chat" size={focused ? iconSizeSelected : iconSizeSelected}
          color={tintColor}/>
      )
    }
  },
};

const navigatorConfig = {
  initialRouteName: 'ClassTab',
  animationEnabled: false,
  swipeEnabled: true,
  // Android's default option displays tabBars on top, but iOS is bottom
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: colors.primaryDark,
    inactiveTintColor: colors.darkGrey,
    style: {
      backgroundColor: colors.white,
      height: screenHeight * 0.1,
      padding: 10,
    },
    labelStyle: {
      fontSize
    },
    // Android's default showing of icons is false whereas iOS is true
    showIcon: true,
  },
  defaultNavigationOptions: {
    drawerLabel: 'ClassTab',
    drawerIcon: ({ tintColor }) => (
      <Icon
        name="group"
        size={iconSizeSelected}
        type="material"
        color={tintColor}
      />
    ),
  }
};

const StudentBottomTabNavigator = createBottomTabNavigator(
  routeConfig,
  navigatorConfig
);

const ClassTabsNavigator = createAppContainer(StudentBottomTabNavigator);

export default ClassTabsNavigator;