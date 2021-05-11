// This is going to be the screen that is displayed to both teachers and students that will allow them to edit their profiles
import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast';
import QcActionButton from 'components/QcActionButton';
import TouchableText from 'components/TouchableText';
import teacherImages from 'config/teacherImages';
import studentImages from 'config/studentImages';
import TopBanner from 'components/TopBanner';
import ImageSelectionModal from 'components/ImageSelectionModal';
import TeacherInfoEntries from 'components/TeacherInfoEntries';
import strings from 'config/strings';
import FirebaseFunctions from 'config/FirebaseFunctions';
import SideMenu from 'react-native-side-menu';
import TeacherLeftNavPane from '../TeacherScreens/LeftNavPane/LeftNavPane';
import StudentLeftNavPane from '../StudentScreens/LeftNavPane';
import QCView from 'components/QCView';
import fontStyles from 'config/fontStyles';
import styles from './ProfileScreenStyle';

// Creates the functional component
const ProfileScreen = (props) => {
	// These are going to be the state fields and the props that are passed in from other screens for this screen
	const { isTeacher, accountObject, userID, classes } = props.navigation.state.params;
	const [name, setName] = useState(accountObject.name);
	const [phoneNumber, setPhoneNumber] = useState(accountObject.phoneNumber);
	const [emailAddress, setEmailAddress] = useState(accountObject.emailAddress);
	const [profileImageID, setProfileImageID] = useState(accountObject.profileImageID);
	const [isLoading, setIsLoading] = useState(false);
	const [isPhoneValid, setIsPhoneValid] = useState(true);
	const [isOpen, setIsOpen] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);

	// The useEffect Method is going to be called when the component is first mounted and is going to set the screen
	// Analytics in Firebase
	useEffect(() => {
		if (isTeacher === true) {
			FirebaseFunctions.setCurrentScreen('Teacher Profile Screen', 'ProfileScreen');
		} else {
			FirebaseFunctions.setCurrentScreen('Student Profile Screen', 'ProfileScreen');
		}
	}, []);

	// This is going to save the new profile information in Cloud Firestore after double checking that all fields
	// have been correctly filled out
	const saveProfileInfo = async () => {
		const trimmedName = name.trim();
		const trimmedPhoneNumber = phoneNumber.trim();
		const trimmedEmailAddress = emailAddress.trim();
		if (trimmedName === '' || trimmedPhoneNumber === '' || trimmedEmailAddress === '') {
			Alert.alert(strings.Whoops, strings.PleaseMakeSureAllFieldsAreFilledOut);
		} else if (!isPhoneValid) {
			Alert.alert(strings.Whoops, strings.InvalidPhoneNumber);
		} else {
			if (isTeacher === true) {
				setIsLoading(true);
				await FirebaseFunctions.call('updateTeacherByID', {
					teacherID: userID,
					updates: {
						name,
						phoneNumber,
						profileImageID,
					},
				});
				props.navigation.push('TeacherCurrentClass', {
					teacherID: userID,
					classID: accountObject.currentClassID,
				});
				setIsLoading(false);
			} else {
				await FirebaseFunctions.call('updateStudentByID', {
					studentID: userID,
					updates: {
						name,
						phoneNumber,
						profileImageID,
					},
				});
				props.navigation.push('StudentCurrentClass', {
					studentID: userID,
					classID: accountObject.currentClassID,
				});
			}
		}
	};

	// Renders the UI of the screen
	return (
		<SideMenu
			isOpen={isOpen}
			menu={
				isTeacher === true ? (
					<TeacherLeftNavPane
						teacher={accountObject}
						teacherID={userID}
						classes={classes}
						edgeHitWidth={0}
						navigation={props.navigation}
					/>
				) : (
					<StudentLeftNavPane
						student={accountObject}
						userID={userID}
						classes={classes}
						edgeHitWidth={0}
						navigation={props.navigation}
					/>
				)
			}>
			<QCView
				style={styles.qcviewContainer}>
				<ScrollView style={styles.container}>
					<TopBanner
						LeftIconName='navicon'
						LeftOnPress={() => setIsOpen(true)}
						Title={strings.MyProfile}
					/>
					<View>
						<ImageSelectionModal
							visible={modalVisible}
							images={isTeacher === true ? teacherImages.images : studentImages.images}
							cancelText={strings.Cancel}
							setModalVisible={(isVisible) => setModalVisible(isVisible)}
							onImageSelected={(index) => {
								setProfileImageID(index);
								setModalVisible(false);
							}}
						/>
						<View style={styles.picContainer}>
							<Image
								style={styles.profilePic}
								source={
									isTeacher === true
										? teacherImages.images[profileImageID]
										: studentImages.images[profileImageID]
								}
							/>
							<TouchableText
								text={strings.UpdateProfileImage}
								onPress={() => setModalVisible(true)}
							/>
						</View>

						<TeacherInfoEntries
							name={name}
							phoneNumber={phoneNumber}
							emailAddress={emailAddress}
							onNameChanged={(newName) => setName(newName)}
							noEmailField={true}
							onPhoneNumberChanged={(phone) => {
								setIsPhoneValid(phone.isValidNumber());
								setPhoneNumber(phone.getValue());
							}}
							onEmailAddressChanged={() => {}}
						/>
						<View style={styles.buttonsContainer}>
							<QcActionButton
								text={strings.Cancel}
								onPress={() => {
									if (isTeacher === true) {
										//Just goes back without saving anything
										props.navigation.push('TeacherCurrentClass', {
											teacherID: userID,
											classID: accountObject.currentClassID,
										});
									} else {
										props.navigation.push('StudentCurrentClass', {
											studentID: userID,
											classID: accountObject.currentClassID,
										});
									}
								}}
							/>
							<QcActionButton text={strings.Save} onPress={() => saveProfileInfo()} />
						</View>
						<Toast position={'center'} ref='toast' />
					</View>
					<View style={styles.buttonsContainer}>
						<TouchableOpacity
							style={styles.cardStyle}
							onPress={async () => {
								await FirebaseFunctions.logOut(userID);
								props.navigation.push('FirstScreenLoader');
							}}>
							<Text style={fontStyles.bigTextStyleBlack}>{strings.LogOut}</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</QCView>
		</SideMenu>
	);
};

// Exports the component
export default ProfileScreen;
