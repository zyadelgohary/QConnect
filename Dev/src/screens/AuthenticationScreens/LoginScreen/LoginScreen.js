// This is the screen that users will be able to log in from using email and password
import React, { useState, useEffect } from 'react';
import { View, ImageBackground, Alert } from 'react-native';
import Form from 'components/Form';
import ButtonSubmit from 'components/ButtonSubmit';
import SignupSection from 'components/SignupSection';
import QcAppBanner from 'components/QcAppBanner';
import FirebaseFunctions from 'config/FirebaseFunctions';
import strings from 'config/strings';
import LoadingSpinner from 'components/LoadingSpinner';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import styles from './LoginScreenStyle';
import BG_IMAGE from 'assets/images/read_child_bg.jpg';

// Creates the functional component
const LoginScreen = (props) => {
	// The state fields for this screen
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// The useEffect function which acts as a componentDidMount method (called when the screen is first mounted)
	useEffect(() => {
		//Sets the screen for firebase analytics
		FirebaseFunctions.setCurrentScreen('Log In Screen', 'LogInScreen');
	}, []);

	// Logs the user in, fetches their ID, and then navigates to the correct screen according to whether they
	// are a student or a teacher
	const signIn = async () => {
		setIsLoading(true);

		if (username.trim() === '' || !password.replace(/\s/g, '').length) {
			Alert.alert(string.Whoops, strings.PleaseMakeSureAllFieldsAreFilledOut);
		} else {
			const account = await FirebaseFunctions.logIn(username.trim(), password.trim());
			if (account === -1) {
				setIsLoading(false);
				setUsername(username);
				setPassword(password);
				Alert.alert(strings.Whoops, strings.IncorrectInfo);
			} else {
				const userID = account.uid;
				const isTeacher = await FirebaseFunctions.call('getTeacherByID', { teacherID: userID });
				if (isTeacher === -1) {
					FirebaseFunctions.logEvent('STUDENT_LOG_IN');
					props.navigation.push('StudentCurrentClass', {
						userID,
					});
				} else {
					FirebaseFunctions.logEvent('TEACHER_LOG_IN');
					props.navigation.push('TeacherCurrentClass', {
						teacherID: userID,
						classID: isTeacher.currentClassID
					});
				}
			}
		}
	};

	// Renders the UI for this screen
	return isLoading === true ? (
		<QCView style={screenStyle.container}>
			<ImageBackground source={BG_IMAGE} style={styles.bgImage}>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<LoadingSpinner isVisible={true} />
				</View>
			</ImageBackground>
		</QCView>
	) : (
		<QCView style={screenStyle.container}>
			<ImageBackground source={BG_IMAGE} style={styles.bgImage}>
				<View style={styles.imageContainer}>
					<QcAppBanner />
				</View>
				<View style={styles.flexOneCenter}>
					<Form
						onUserNameChange={(text) => setUsername(text)}
						onPwChange={(text) => setPassword(text)}
					/>
				</View>
				<View style={styles.flexOneCenter}>
					<ButtonSubmit
						text={strings.Login}
						onSubmit={() => signIn()}
						navigation={props.navigation}
						screen='LoginScreen'
					/>
				</View>
				<View style={styles.flexHalfCenter}>
					<SignupSection
						onCreateAccount={() => props.navigation.push('AccountTypeScreen')}
						onForgotPassword={() => props.navigation.navigate('ForgotPassword')}
					/>
				</View>
				<View style={styles.flexOne} />
			</ImageBackground>
		</QCView>
	);
};

// Exports the component
export default LoginScreen;
