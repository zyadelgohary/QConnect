//This stack navigator will be the base line for all screens across the app (with the exception of the
//tabs navigator in the teacher screens & the drawerNavigators).
import React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import MushafScreen from './MushafScreen/MushafScreen';
import MushafAssignmentScreen from './MushafScreen/MushafAssignmentScreen';
import MushafReadingScreen from './MushafScreen/MushafReadingScreen';
import FirstScreenLoader from './FirstScreenLoader/FirstScreenLoader';
import LoginScreen from './AuthenticationScreens/LoginScreen/LoginScreen';
import AccountTypeScreen from './AuthenticationScreens/AccountTypeScreen/AccountTypeScreen';
import TeacherWelcomeScreen from './TeacherScreens/TeacherWelcomeScreen/TeacherWelcomeScreen';
import AddClassScreen from './TeacherScreens/AddClassScreen/AddClassScreen';
import ForgotPassword from './AuthenticationScreens/ForgotPassword/ForgotPassword';
import StudentWelcomeScren from './StudentScreens/StudentWelcomeScreen/StudentWelcomeScreen';
import AllSettingsScreen from './SettingsScreen/AllSettingsScreen/AllSettingsScreen';
import CreditsScreen from './SettingsScreen/CreditsScreen/CreditsScreen';
import ProfileScreen from './ProfileScreen/ProfileScreen';
import AddManualStudentsScreen from './TeacherScreens/AddManualStudentsScreen/AddManualStudentsScreen';
import StudentMainScreen from './StudentScreens/StudentMainScreen';
import ClassTabsNavigator from './TeacherScreens/ClassTabs/ClassTabsNavigator';
import StudentProfileScreen from './TeacherScreens/StudentProfileScreen/StudentProfileScreen';
import EvaluationPage from './Evaluation/EvaluationPage';
import ShareClassCodeScreen from './TeacherScreens/ShareClassCodeScreen/ShareClassCodeScreen';
import strings from 'config/strings';
import TopBanner from 'components/TopBanner';

//The routes containing all the screens & their navigation options
routeConfig = {
	MushafAssignmentScreen: {
		screen: MushafAssignmentScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			//disable swipe back to go to previous screen as it interfers with mus7af page swipes
			//https://github.com/zyadelgohary/QConnect/issues/234
			gesturesEnabled: false,
		}),
	},

	MushafReadingScreen: {
		screen: MushafReadingScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			//disable swipe back to go to previous screen as it interfers with mus7af page swipes
			//https://github.com/zyadelgohary/QConnect/issues/234
			gesturesEnabled: false,
		}),
	},

	FirstScreenLoader: {
		screen: FirstScreenLoader,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	LoginScreen: {
		screen: LoginScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	StudentCurrentClass: {
		screen: StudentMainScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	AccountTypeScreen: {
		screen: AccountTypeScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	ForgotPassword: {
		screen: ForgotPassword,
		navigationOptions: ({ navigation }) => ({
			header: (
				<TopBanner
					LeftIconName='angle-left'
					LeftOnPress={() => navigation.goBack()}
					Title={strings.ForgotPasswordNoQuestion}
				/>
			),
		}),
	},

	TeacherWelcomeScreen: {
		screen: TeacherWelcomeScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	StudentWelcomeScreen: {
		screen: StudentWelcomeScren,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	AddClassScreen: {
		screen: AddClassScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	Settings: {
		screen: AllSettingsScreen,
		navigationOptions: ({ navigation }) => ({
			header: null,
			gesturesEnabled: false,
		}),
	},

	CreditsScreen: {
		screen: CreditsScreen,
		navigationOptions: ({ navigation }) => ({
			header: (
				<TopBanner
					LeftIconName='angle-left'
					LeftOnPress={() => navigation.goBack()}
					Title={strings.Credits}
				/>
			),
		}),
	},

	Profile: {
		screen: ProfileScreen,
		navigationOptions: ({ navigation }) => ({
			gesturesEnabled: false,
			header: null,
		}),
	},

	TeacherCurrentClass: {
		screen: ClassTabsNavigator,
		navigationOptions: ({ navigation }) => ({
			gesturesEnabled: false,
			header: null,
		}),
	},

	TeacherStudentProfile: {
		screen: StudentProfileScreen,
		navigationOptions: ({ navigation }) => ({
			gesturesEnabled: false,
			header: (
				<TopBanner
					Title={strings.StudentProfile}
					LeftIconName='angle-left'
					LeftOnPress={() =>
						navigation.push('TeacherCurrentClass', {
							userID: navigation.state.params.userID,
						})
					}
				/>
			),
		}),
	},

	EvaluationPage: {
		screen: EvaluationPage,
		navigationOptions: ({ navigation }) => ({
			gesturesEnabled: false,
			header: null,
		}),
	},

	ShareClassCode: {
		screen: ShareClassCodeScreen,
		navigationOptions: ({ navigation }) => ({
			gesturesEnabled: false,
			header: <TopBanner Title={strings.AddStudents} />,
		}),
	},

	AddManualStudents: {
		screen: AddManualStudentsScreen,
		navigationOptions: ({ navigation }) => ({
			gesturesEnabled: false,
			header: (
				<TopBanner
					Title={strings.AddManualStudents}
					LeftIconName='angle-left'
					LeftOnPress={() => navigation.goBack()}
				/>
			),
		}),
	},
};

//The navigator config containing all the configurations of the navigator (initialRoute, header, etc)
navigatorConfig = {
	initialRouteName: 'FirstScreenLoader',
};

const MainStackStackNavigator = createStackNavigator(routeConfig, navigatorConfig);

const MainStackNavigator = createAppContainer(MainStackStackNavigator);

export default MainStackNavigator;
