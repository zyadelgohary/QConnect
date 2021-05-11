//This will be the drawer items that will display from the student side when the click on
//the hamburger icon
import React, { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, StyleSheet, Modal, Text, Alert, Image } from 'react-native';
import colors from 'config/colors';
import classImages from 'config/classImages';
import { SafeAreaView } from 'react-navigation';
import QcDrawerItem from 'components/QcDrawerItem';
import studentImages from 'config/studentImages';
import strings from 'config/strings';
import QcParentScreen from 'screens/QcParentScreen';
import { Input } from 'react-native-elements';
import { screenHeight, screenWidth } from 'config/dimensions';
import QcActionButton from 'components/QcActionButton';
import FirebaseFunctions from 'config/FirebaseFunctions';
import LoadingSpinner from 'components/LoadingSpinner';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import CodeInput from 'react-native-confirmation-code-input';
import styles from './LeftNavPaneStyle';
import fontStyles from 'config/fontStyles';

// Creates the functional component
const LeftNavPane = (props) => {
	// The state fields that will be used in this screen
	const [student, setStudent] = useState(props.student);
	const [studentID, setStudentID] = useState(props.studentID);
	const [classes, setClasses] = useState(props.classes);
	const [modalVisible, setModalVisible] = useState(false);
	const [classCode, setClassCode] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// The useEffect method which gets called when the component is first mounted. It acts like a componentDidMount
	// in class components. It will set the component name for Firebase Analytics
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Student Left Nav Pane', 'LeftNavPane');
	}, []);

	// This method is going to attempt to connect the student to a specific class based on the code that was entered
	// by the student. If the code is invalid, an error modal will be shown to the student. If it is valid, it will
	// connect the student, then navigate to the correct class screen
	const joinClass = async () => {
		setIsLoading(true);
		const didJoinClass = await FirebaseFunctions.call('joinClassByClassInviteCode', {
			classInviteCode: classCode,
			studentID,
		});
		if (didJoinClass === -1) {
			setIsLoading(false);
			setModalVisible(false);
			Alert.alert(strings.Whoops, strings.IncorrectClassCode);
		} else {
			setIsLoading(false);
			setModalVisible(false);
			props.navigation.push('StudentCurrentClass', {
				studentID,
				classID: didJoinClass,
			});
		}
	};

	// This method is going to handle the logic when the teacher navigates to a different class. It will update
	// the teacher document in Firestore to show which class is the most recent one they've navigated to. Since
	// the result of this function doesn't matter, the class will be navigated to simaltaneously
	const openClass = (classID) => {
		FirebaseFunctions.call('updateStudentByID', {
			studentID,
			updates: {
				currentClassID: classID,
			},
		});
		FirebaseFunctions.logEvent('STUDENT_OPEN_CLASS');

		props.navigation.push('StudentCurrentClass', {
			studentID,
			classID,
		});
	};

	// Renders the UI for this screen
	return (
		<ScrollView>
			<SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
				<View
					style={styles.AppTitleContainer}>
					<View style={{ flexDirection: 'row' }}>
						<Text style={fontStyles.hugeTextStylePrimaryDark}>{strings.AppTitle}</Text>
					</View>
				</View>

				<QcDrawerItem
					title={student.name + strings.sProfile}
					image={studentImages.images[student.profileImageID]}
					onPress={() =>
						props.navigation.push('Profile', {
							accountObject: student,
							userID: studentID,
							classes: classes,
							isTeacher: false,
						})
					}
				/>

				<QcDrawerItem
					title='Holy Quran'
					image={classImages.images[2]}
					onPress={() =>
						props.navigation.push('MushafReadingScreen', {
							isTeacher: false,
							studentID,
							accountObject: student,
							classID: classes && classes.length > 0 ? classes[0].ID : undefined,
							userID: studentID,
							imageID: student.profileImageID,
						})
					}
				/>

				<FlatList
					data={classes}
					keyExtractor={(item, index) => item.classID}
					renderItem={({ item, index }) => (
						<QcDrawerItem
							title={item.className}
							image={classImages.images[item.classImageID]}
							onPress={() => openClass(item.classID)}
						/>
					)}
				/>

				<QcDrawerItem
					title={strings.JoinClass}
					icon='plus'
					onPress={() => {
						setModalVisible(true);
					}}
				/>
				<QcDrawerItem
					title={strings.Settings}
					icon='cogs'
					onPress={() =>
						props.navigation.push('Settings', {
							isTeacher: false,
							teacher: student,
							userID: studentID,
							classes: classes,
						})
					}
				/>
				<Modal
					animationType='fade'
					style={{ alignItems: 'center', justifyContent: 'center' }}
					transparent={true}
					presentationStyle='overFullScreen'
					visible={modalVisible}
					onRequestClose={() => {}}>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							alignSelf: 'center',
							paddingTop: screenHeight / 3,
						}}>
						<View style={styles.modal}>
							{isLoading === true ? (
								<View>
									<LoadingSpinner isVisible={true} />
								</View>
							) : (
								<View>
									<View
										style={{
											flex: 1,
											justifyContent: 'center',
											alignItems: 'center',
										}}>
										<Image
											source={require('assets/emptyStateIdeas/welcome-girl.png')}
											style={styles.WelcomeGirlPic}
										/>
										<Text style={[fontStyles.mainTextStyleDarkGrey, styles.classCodeBottomMargin]}>
											{strings.TypeInAClassCode}
										</Text>
									</View>
									<View
										style={{
											flex: 1,
											justifyContent: 'center',
											alignItems: 'center',
										}}>
										<CodeInput
											space={2}
											size={50}
											codeLength={5}
											activeColor={colors.primaryDark}
											inactiveColor={colors.primaryLight}
											autoFocus={true}
											inputPosition='center'
											className='border-circle'
											containerStyle={styles.codeInputBottomMargin}
											codeInputStyle={styles.codeInputBorderWidth}
											onFulfill={(code) => setClassCode(code)}
										/>
									</View>
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
										}}>
										<QcActionButton
											text={strings.Cancel}
											onPress={() => {
												setModalVisible(false);
											}}
										/>
										<QcActionButton
											text={strings.Confirm}
											onPress={() => {
												//Joins the class
												joinClass();
											}}
										/>
									</View>
								</View>
							)}
						</View>
					</View>
				</Modal>
			</SafeAreaView>
		</ScrollView>
	);
};

export default LeftNavPane;
