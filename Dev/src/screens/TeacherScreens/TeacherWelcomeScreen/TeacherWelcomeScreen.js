// This is the screen where the teacher will initially sign up and enter their information
import React, { useEffect, useState } from 'react';
import {
	StyleSheet,
	View,
	Image,
	Text,
	TouchableOpacity,
	Alert,
	ScrollView,
	LayoutAnimation,
	Platform,
} from 'react-native';
import QcActionButton from 'components/QcActionButton';
import ImageSelectionRow from 'components/ImageSelectionRow';
import ImageSelectionModal from 'components/ImageSelectionModal';
import TeacherInfoEntries from 'components/TeacherInfoEntries';
import strings from 'config/strings';
import FadeInView from '../../../components/FadeInView';
import FirebaseFunctions from 'config/FirebaseFunctions';
import { Icon } from 'react-native-elements';
import fontStyles from 'config/fontStyles';
import styles from './TeacherWelcomeScreenStyle';
import {
	getHighlightedImages,
	getRandomGenderNeutralImage,
} from './FunctionHelpers';
import teacherImages from 'config/teacherImages';

// Creates the functional component
const TeacherWelcomeScreen = (props) => {
	// Declares the state fields that will be used in this screen
	const [phoneNumber, setPhoneNumber] = useState('');
	const [emailAddress, setEmailAddress] = useState('');
	const [name, setName] = useState('');
	const [profileImageID, setProfileImageID] = useState(getRandomGenderNeutralImage());
	const [highlightedImagesIndices, setHighlightedImageIndices] = useState(getHighlightedImages());
	const [modalVisible, setModalVisible] = useState(false);
	const [isPhoneValid, setIsPhoneValid] = useState('');
	const [authCode, setAuthCode] = useState('');
	const [password, setPassword] = useState('');
	const [passwordTwo, setPasswordTwo] = useState('');

	// The useEffect method acts as componentDidMount, which will set the screen in Firebase Analytics, as well as add
	// an easing transition
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Teacher Welcome Screen', 'TeacherWelcomeScreen');
		if (Platform.OS === 'ios') {
			LayoutAnimation.easeInEaseOut();
		}
	}, []);

	// This method will be used to handle image selection
	const onImageSelected = (index) => {
		let candidateImages = highlightedImagesIndices;

		if (!highlightedImagesIndices.includes(index)) {
			candidateImages.splice(0, 1);
			candidateImages.splice(0, 0, index);
		}

		setProfileImageID(index);
		setHighlightedImageIndices(candidateImages);
		setModalVisible(false);
	};

	// This method will be used to create the teacher object in Firebase. It will first create the user in Firebase Auth,
	// then will use that ID to pass into the Cloud Function to create the teacher's document
	const saveProfileInfo = async () => {
		// First double checks all inputs are filled out
		const trimmedName = name.trim();
		const trimmedPhoneNumber = phoneNumber.trim();
		const trimmedEmailAddress = emailAddress.trim();
		const trimmedPassword = password.trim();
		const trimmedPasswordTwo = passwordTwo.trim();

		if (
			trimmedName === '' ||
			trimmedPhoneNumber === '' ||
			trimmedEmailAddress === '' ||
			trimmedPassword === '' ||
			trimmedPasswordTwo === ''
		) {
			Alert.alert(strings.Whoops, strings.PleaseMakeSureAllFieldsAreFilledOut);
		} else if (!isPhoneValid) {
			Alert.alert(strings.Whoops, strings.InvalidPhoneNumber);
		} else if (!(password === passwordTwo)) {
			Alert.alert(strings.Whoops, strings.PasswordsDontMatch);
		} else {
			try {
				// Signs up the user in auth
				const ID = await FirebaseFunctions.signUp(trimmedEmailAddress, trimmedPassword);

				// Creaets the teacher object in Cloud Firestore
				await FirebaseFunctions.call('createTeacher', {
					emailAddress: trimmedEmailAddress,
					name: trimmedName,
					phoneNumber: trimmedPhoneNumber,
					profileImageID: profileImageID,
					teacherID: ID,
				});

				props.navigation.push('TeacherCurrentClass', {
					teacherID: ID,
				});
			} catch (err) {
				if (err && err.message) {
					Alert.alert(strings.Whoops, err.message);
				} else {
					Alert.alert(strings.Whoops, strings.SomethingWentWrong);
				}

				FirebaseFunctions.logEvent('CREATE_USER_FAILED', { err });
			}
		}
	};

	// Renders the UI for this screen
	return (
		<View>
			<ScrollView>
				<View>
					<ImageSelectionModal
						visible={modalVisible}
						images={teacherImages.images}
						cancelText={strings.Cancel}
						setModalVisible={(visible) => setModalVisible(visible)}
						onImageSelected={(index) => onImageSelected(index)}
					/>
					<View style={styles.picContainer}>
						<View style={styles.backButtonContainer}>
							<TouchableOpacity
								style={styles.backButtonTouchableOpacity}
								onPress={() => {
									props.navigation.goBack();
								}}>
								<Icon name={'angle-left'} type='font-awesome' />
							</TouchableOpacity>
						</View>
						<View style={styles.welcomeImageContainer}>
							<FadeInView style={{ alignItems: 'center', justifyContent: 'center' }}>
								<Image style={styles.welcomeImage} source={require('assets/images/salam.png')} />
								<Text style={fontStyles.mainTextStyleDarkGrey}>
									{strings.TeacherWelcomeMessage}
								</Text>
							</FadeInView>
						</View>
					</View>
					<View style={styles.editInfo} behavior='padding'>
						<TeacherInfoEntries
							name={name}
							phoneNumber={phoneNumber}
							emailAddress={emailAddress}
							password={password}
							passwordTwo={passwordTwo}
							onNameChanged={(name) => setName(name)}
							onPhoneNumberChanged={(number) => {
								setPhoneNumber(number.getValue());
								setIsPhoneValid(number.isValidNumber());
							}}
							onEmailAddressChanged={(email) => setEmailAddress(email)}
							showPasswordField={true}
							onPasswordChanged={(pw) => setPassword(pw)}
							onPasswordTwoChanged={(pw2) => setPasswordTwo(pw2)}
						/>
						<Text />
						<ImageSelectionRow
							images={teacherImages.images}
							highlightedImagesIndices={highlightedImagesIndices}
							onImageSelected={(index) => onImageSelected(index)}
							onShowMore={() => setModalVisible(true)}
							selectedImageIndex={profileImageID}
						/>
					</View>
					<View style={styles.buttonsContainer}>
						<QcActionButton text={strings.CreateAccount} onPress={() => saveProfileInfo()} />
					</View>
					<View style={styles.filler} />
				</View>
			</ScrollView>
		</View>
	);
};

// Exports the component
export default TeacherWelcomeScreen;
