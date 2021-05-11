// This is going to be the screen where attendance for a specific day is shown for a specific class
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { ScrollView, StyleSheet, View, Image, Text, Dimensions, Alert } from 'react-native';
import Toast, { DURATION } from 'react-native-easy-toast';
import StudentCard from 'components/StudentCard';
import QcActionButton from 'components/QcActionButton';
import colors from 'config/colors';
import studentImages from 'config/studentImages';
import strings from 'config/strings';
import QcParentScreen from 'screens/QcParentScreen';
import FirebaseFunctions from 'config/FirebaseFunctions';
import LoadingSpinner from 'components/LoadingSpinner';
import LeftNavPane from '../LeftNavPane/LeftNavPane';
import TopBanner from 'components/TopBanner';
import SideMenu from 'react-native-side-menu';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import { screenHeight, screenWidth } from 'config/dimensions';
import fontStyles from 'config/fontStyles';
import DailyTracker from 'components/DailyTracker';
import moment from 'moment';
import { convertDateToString } from 'config/utils/dateUtils';
import { Icon } from 'react-native-elements';
import styles from './ClassAttendanceScreenStyle';

// Creates the functional component
const ClassAttendanceScreen = (props) => {
	// Props passed in from previous screen
	const { classID, teacherID } = props.navigation.state.params;

	// These are the state variables that are going to be used in this screen
	const [isLoading, setIsLoading] = useState(true);
	const [isOpen, setIsOpen] = useState(false);
	const [currentClass, setCurrentClass] = useState('');
	const [teacher, setTeacher] = useState('');
	const [selectedDate, setSelectedDate] = useState(convertDateToString(new Date()));
	const [classes, setClasses] = useState('');
	const [present, setPresent] = useState([]);
	const [attendanceObject, setAttendanceObject] = useState('');
	const [absent, setAbsent] = useState([]);

	// The useEffect method is going to set the initial state of the screen by fetching the correct information
	// about the teacher, the current attendance, etc.
	useEffect(() => {
		// Sets the screen in Firebase, then initializes the rest of the screen using a helper function
		FirebaseFunctions.setCurrentScreen('Class Attendance Screen', 'ClassAttendanceScreen');
		initScreen();
	}, []);

	// Helper method to help with initializing the screen by fetching the right data
	const initScreen = async () => {
		// Calls the functions all at once to boost performance
		const functionCalls = await Promise.all([
			FirebaseFunctions.call('getTeacherByID', { teacherID }),
			FirebaseFunctions.call('getClassesByTeacherID', { teacherID }),
			FirebaseFunctions.call('getAttendanceForClassByDay', { classID, day: selectedDate }),
		]);

		setTeacher(functionCalls[0]);
		setCurrentClass(functionCalls[1].find((eachClass) => eachClass.classID === classID));
		setClasses(functionCalls[1]);

		const absentArray = [];
		const presentArray = [];
		for (const studentID of Object.keys(functionCalls[2])) {
			if (functionCalls[2][studentID] === true) {
				presentArray.push(studentID);
			} else {
				absentArray.push(studentID);
			}
		}
		setAbsent(absentArray);
		setPresent(presentArray);
		setAttendanceObject(functionCalls[2]);
		setIsLoading(false);
	};

	// This function handles the logic behind actually saving an attendance to Firebase. It also shows a toast
	// to the user when it's done
	const saveAttendance = async () => {
		setIsLoading(true);
		await FirebaseFunctions.call('saveAttendanceForClassByDay', {
			classID,
			day: selectedDate,
			attendanceObject,
		});
		setIsLoading(false);
	};

	// This handles the state setting of the attendance. It will split the attendance into two arrays, one with present
	// students, and one with absent students.
	const setAttendance = async (dateString) => {
		const attendance = await FirebaseFunctions.call('getAttendanceForClassByDay', {
			classID,
			day: dateString,
		});
		const absentArray = [];
		const presentArray = [];
		for (const studentID of Object.keys(attendance)) {
			if (attendance[studentID] === true) {
				presentArray.push(studentID);
			} else {
				absentArray.push(studentID);
			}
		}
		setAttendanceObject(attendance);
		setAbsent(absentArray);
		setPresent(presentArray);
	};

	// Renders the UI of the screen based on the current state
	if (isLoading === true) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<LoadingSpinner isVisible={true} />
			</View>
		);
	}

	if (currentClass.students.length === 0) {
		return (
			<SideMenu
				isOpen={isOpen}
				menu={
					<LeftNavPane
						teacher={teacher}
						teacherID={teacherID}
						classes={classes}
						edgeHitWidth={0}
						navigation={props.navigation}
					/>
				}>
				<QCView style={screenStyle.container}>
					<View style={styles.topBannerContainer}>
						<TopBanner
							LeftIconName='navicon'
							LeftOnPress={() => setIsOpen(true)}
							Title={currentClass.className}
						/>
					</View>
					<View style={styles.emptyClassContainer}>
						<Text style={fontStyles.hugeTextStylePrimaryDark}>{strings.EmptyClass}</Text>
						<Image
							source={require('assets/emptyStateIdeas/welcome-girl.png')}
							style={styles.emptyClassImage}
						/>
						<QcActionButton
							text={strings.AddStudentButton}
							onPress={() =>
								this.props.navigation.push('ShareClassCode', {
									classInviteCode: currentClass.classInviteCode,
									classID,
									teacherID,
									currentClass,
								})
							}
						/>
					</View>
				</QCView>
			</SideMenu>
		);
	}

	return (
		<SideMenu
			isOpen={isOpen}
			menu={
				<LeftNavPane
					teacher={teacher}
					teacherID={teacherID}
					classes={classes}
					edgeHitWidth={0}
					navigation={props.navigation}
				/>
			}>
			<QCView style={screenStyle.container}>
				<ScrollView>
					<View style={styles.topBannerContainer}>
						<TopBanner
							LeftIconName='navicon'
							LeftOnPress={() => setIsOpen(true)}
							Title={currentClass.className}
						/>
					</View>
					<View style={styles.saveAttendance}>
						<DailyTracker
							data={{
								[selectedDate]: { type: 'attendance' },
							}}
							selectedDate={selectedDate}
							trackingMode={false}
							onDatePressed={async (date) => {
								setIsLoading(true);
								const dateString = date.dateString;
								setSelectedDate(dateString);
								await setAttendance(dateString);
								setIsLoading(false);
							}}
						/>
						<QcActionButton
							text={strings.SaveAttendance}
							onPress={() => saveAttendance()}
							style={styles.saveAttendanceButton}
						/>
					</View>
					{(absent.length !== 0 || present.length !== 0) && (
						<View style={styles.attendanceTextContainer}>
							<Text style={[fontStyles.mainTextStyleDarkGrey, styles.attendanceText]}>
								{strings.Attendance}:
							</Text>

							<View style={styles.present}>
								<View style={styles.presentAbsentText}>
									<Icon
										name='account-check-outline'
										type='material-community'
										color={colors.darkGreen}
										size={20}
									/>
									<Text style={[fontStyles.mainTextStyleDarkGreen, styles.attendanceText]}>
										{strings.Present}
									</Text>
									<Text style={[fontStyles.mainTextStyleDarkGreen]}>{present.length}</Text>
								</View>
							</View>
							<View style={{ width: 20 }} />
							<View style={styles.absent}>
								<View style={styles.presentAbsentText}>
									<Icon
										name='account-remove-outline'
										type='material-community'
										color={colors.darkRed}
										size={20}
									/>
									<Text style={[fontStyles.mainTextStyleDarkRed, styles.attendanceText]}>
										{strings.Absent}
									</Text>
									<Text style={[fontStyles.mainTextStyleDarkRed]}>{absent.length}</Text>
								</View>
							</View>
						</View>
					)}

					{currentClass.students.map((student) => {
						let color = absent.includes(student.studentID) ? colors.red : colors.green;
						let attendanceCaption = absent.includes(student.studentID)
							? strings.Absent
							: strings.Present;
						return (
							<StudentCard
								key={student.studentID}
								studentName={student.name}
								currentAssignment={attendanceCaption}
								profilePic={studentImages.images[student.profileImageID]}
								background={color}
								onPress={() => {
									console.log(attendanceObject);
									const isHere = attendanceObject[student.studentID];
									if (isHere === undefined || isHere === true) {
										setAttendanceObject({ ...attendanceObject, [student.studentID]: false });
										const updatedAbsent = absent;
										updatedAbsent.push(student.studentID);
										const updatedPresent = present;
										updatedPresent.splice(
											updatedPresent.indexOf((studentID) => student.studentID === studentID),
											1
										);
										setAbsent(updatedAbsent);
										setPresent(updatedPresent);
									} else {
										setAttendanceObject({ ...attendanceObject, [student.studentID]: true });
										const updatedPresent = present;
										updatedPresent.push(student.studentID);
										const updatedAbsent = absent;
										updatedAbsent.splice(
											updatedAbsent.indexOf((studentID) => student.studentID === studentID),
											1
										);
										setAbsent(updatedAbsent);
										setPresent(updatedPresent);
									}
								}}
							/>
						);
					})}
				</ScrollView>
			</QCView>
		</SideMenu>
	);
};

// Exports the component
export default ClassAttendanceScreen;
