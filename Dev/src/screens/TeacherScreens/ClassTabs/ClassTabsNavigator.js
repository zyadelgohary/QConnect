import React from 'react';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { PixelRatio } from 'react-native';
import colors from 'config/colors';
import { Icon } from 'react-native-elements';
import ClassMainScreen from '../ClassMainScreen/ClassMainScreen';
import ClassAttendanceScreen from '../ClassAttendanceScreen/ClassAttendanceScreen';
import strings from '../../../../config/strings';
import MushafAssignmentScreen from '../../MushafScreen/MushafAssignmentScreen';
import { screenHeight } from 'config/dimensions';

var iconSizeSelected = PixelRatio.get() < 2 ? 18 : 25;
var iconSizeNotSelected = PixelRatio.get() < 2 ? 14 : 20;
var fontSize = PixelRatio.get() < 2 ? 12 : 14;

const routeConfig = {
  AttendanceTab: {
    screen: ClassAttendanceScreen,
    navigationOptions: {
      tabBarLabel: strings.Attendance,
      tabBarIcon: ({ tintColor, focused }) => (
        <Icon
          name="calendar-check-o"
          size={focused ? iconSizeSelected : iconSizeNotSelected}
          type="font-awesome"
          color={tintColor}
        />
      )
    },
  },
  ClassStudentsTab: {
    screen: ClassMainScreen,
    navigationOptions: {
      tabBarLabel: strings.Class,
      tabBarIcon: ({ tintColor, focused }) => (
        <Icon
          name="group"
          size={focused ? iconSizeSelected : iconSizeNotSelected}
          type="font-awesome"
          color={tintColor}
        />
      ),
    },
  },
  AssignmentsTab: {
    screen: MushafAssignmentScreen,
    navigationOptions: ({ navigation }) => {
      return {
        isTeacher: true,
        assignToAllClass: true,
        userID: navigation.getParam("userID"),
        tabBarVisible: false,
        tabBarLabel: strings.Assignments,
        tabBarIcon: ({ tintColor, focused }) => (
          <Icon
            name="feather"
            size={focused ? iconSizeSelected : iconSizeNotSelected}
            type="material-community"
            color={tintColor}
          />
        ),
      };
    },
  }
};

const navigatorConfig = {
  initialRouteName: 'ClassStudentsTab',
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
    drawerLabel: 'ClassStudentsTab',
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

const TeacherBottomTabNavigator = createBottomTabNavigator(
  routeConfig,
  navigatorConfig
);

const ClassTabsNavigator = createAppContainer(TeacherBottomTabNavigator);

export default ClassTabsNavigator;
