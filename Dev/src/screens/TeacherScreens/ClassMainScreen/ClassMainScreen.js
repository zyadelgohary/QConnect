// This is the main screen for teachers where they will view specific information about their class like a list of their
// students, etc.
import React, { useEffect, useState } from 'react';
import {
	ScrollView,
	StyleSheet,
	FlatList,
	View,
	Text,
	Image,
	PixelRatio,
	Alert,
} from 'react-native';
import StudentMultiAssignmentsCard from 'components/StudentMultiAssignmentsCard';
import colors from 'config/colors';
import studentImages from 'config/studentImages';
import LoadingSpinner from '../../../components/LoadingSpinner';
import strings from 'config/strings';
import QcParentScreen from 'screens/QcParentScreen';
import QcActionButton from 'components/QcActionButton';
import FirebaseFunctions from 'config/FirebaseFunctions';
import TopBanner from 'components/TopBanner';
import LeftNavPane from '../LeftNavPane/LeftNavPane';
import SideMenu from 'react-native-side-menu';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import fontStyles from 'config/fontStyles';
import { Icon } from 'react-native-elements';
import { screenHeight, screenWidth } from 'config/dimensions';
import Toast, { DURATION } from 'react-native-easy-toast';
import themeStyles from 'config/themeStyles';
import styles from './ClassMainScreenStyle';

// Creates the functional component
const ClassMainScreen = (props) => {
	// The state fields for this screen
	const [isLoading, setIsLoading] = useState(true);
	const [teacherID, setTeacherID] = useState(props.navigation.state.params.teacherID);
	const [teacher, setTeacher] = useState('');
	const [classID, setClassID] = useState(props.navigation.state.params.classID);
	const [currentClass, setCurrentClass] = useState('');
	const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);
	const [allTeacherClasses, setAllTeacherClasses] = useState('');
	const [isEditingClass, setIsEditingClass] = useState(false);
	const [doesTeacherHaveClasses, setDoesTeacherHaveClasses] = useState(
		props.navigation.state.params.classID ? true : false
	);
	const [studentsNeedHelp, setStudentsNeedHelp] = useState([]);
	const [studentsReady, setStudentsReady] = useState([]);
	const [studentsWorkingOnIt, setStudentsWorkingOnIt] = useState([]);
	const [studentsNotStarted, setStudentsNotStarted] = useState([]);
	const [studentsWithNoAssignments, setStudentsWithNoAssignments] = useState([]);
	const [updateBoolean, setUpdateBoolean] = useState(true);

	// The useEffect method acts as the componentDidMount method, which is called when the screen is first initialized.
	// This method is going to set the screen in Firebase analytics, then will call another helper function to fetch
	// the proper data for this screen. useEffect cannot be async, that's why it calls a helper function.
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Class Main Screen', 'ClassMainScreen');
		initScreen();
	}, []);

	// This is the function that is going to sett all the data for this screen. If the screen was passed in a classID,
	// then the function will load the data for that class. If none was passed, then the function won't fetch any classes,
	// because that means that the teacher doesn't have any classes
	const initScreen = async () => {
		// Tests if the teacher has classes and sets the proper state
		if (doesTeacherHaveClasses === false) {
			const teacherObject = await FirebaseFunctions.call('getTeacherByID', { teacherID });
			setTeacher(teacherObject);
			setCurrentClass('');
			setAllTeacherClasses([]);
			setIsLoading(false);
		} else {
			// This clause means the teacher does have classes, so it will fetch the teacher's classes and set
			// the correct state based on that

			// Fetches the different types of students for this class
			let studentsNeedHelp = [];
			let studentsReady = [];
			let studentsWorkingOnIt = [];
			let studentsNotStarted = [];
			let studentsWithNoAssignments = [];

			// Calls the functions all at once to boost performance
			const functionCalls = await Promise.all([
				FirebaseFunctions.call('getTeacherByID', { teacherID }),
				FirebaseFunctions.call('getClassesByTeacherID', { teacherID }),
				FirebaseFunctions.call('getStudentsWithCurrentAssignmentsByClassID', { classID }),
			]);

			// Constructs the arrays of students
			functionCalls[2].map((student) => {
				if (student.currentAssignments.some((assignment) => assignment.status === 'NEED_HELP')) {
					studentsNeedHelp.push(student);
				} else if (student.currentAssignments.some((assignment) => assignment.status === 'READY')) {
					studentsReady.push(student);
				} else if (
					student.currentAssignments.some((assignment) => assignment.status === 'WORKING_ON_IT')
				) {
					studentsWorkingOnIt.push(student);
				} else if (
					student.currentAssignments.some((assignment) => assignment.status === 'NOT_STARTED')
				) {
					studentsNotStarted.push(student);
				} else {
					studentsWithNoAssignments.push(student);
				}
			});

			setStudentsNeedHelp(studentsNeedHelp);
			setStudentsReady(studentsReady);
			setStudentsWorkingOnIt(studentsWorkingOnIt);
			setStudentsNotStarted(studentsNotStarted);
			setStudentsWithNoAssignments(studentsWithNoAssignments);
			setTeacher(functionCalls[0]);
			setCurrentClass(functionCalls[1].find((eachClass) => eachClass.classID === classID));
			setAllTeacherClasses(functionCalls[1]);
			setIsLoading(false);
		}
	};

	// This method is going to handle the removal process of a student. It will first alert the user, then if confirmed,
	// will call the Cloud Function to disconnect the teacher from the class. Not async because the user doesn't have
	// to wait for the result in order to continue
	const removeStudent = (studentID) => {
		Alert.alert(strings.RemoveStudent, strings.AreYouSureYouWantToRemoveStudent, [
			{
				text: strings.Remove,
				onPress: () => {
					FirebaseFunctions.call('disconnectStudentFromClass', { classID, studentID });
					let updatedClass = currentClass;
					let arrayOfClassStudents = updatedClass.students;
					let indexOfStudent = arrayOfClassStudents.findIndex((student) => {
						return student.studentID === studentID;
					});
					arrayOfClassStudents.splice(indexOfStudent, 1);
					updatedClass.students = arrayOfClassStudents;
					setCurrentClass(updatedClass);
					setUpdateBoolean(!updateBoolean);
				},
			},
			{ text: strings.Cancel, style: 'cancel' },
		]);
	};

	// This method is going to handle the name change logic of the class. It'll change the local state just so the user
	// is up to date and doesn't have to wait for an unneccessary asynchronous result. (Not async)
	const changeClassName = (newTitle) => {
		let updatedClass = currentClass;
		updatedClass.className = newTitle;
		setCurrentClass(updatedClass);
		setUpdateBoolean(!updateBoolean);
	};

	// This method is going to handle the profile picture change logic of the class. It'll change the local state just so the
	// user is up to date and doesn't have to wait for an unneccessary asynchronous result. (Not async)
	const changeClassImage = (picID) => {
		let updatedClass = currentClass;
		updatedClass.classImageID = picID;
		setCurrentClass(updatedClass);
		setUpdateBoolean(!updateBoolean);
	};

	// This method is going to be a helper method in the render function. It will render each student
	// section depending on the status of the assignments of the students that are in each section
	const renderStudentSection = (
		sectionTitle,
		sectionIcon,
		sectionIconType,
		studentsList,
		sectionColor,
		sectionBackgroundColor
	) => {
		return (
			<View>
				<View style={styles.sectionTitle}>
					<Icon name={sectionIcon} type={sectionIconType} color={sectionColor} />
					<Text
						style={[
							styles.sectionTitleTextStyle,
							fontStyles.mainTextStyleDarkRed,
							{ color: sectionColor },
						]}>
						{sectionTitle}
					</Text>
				</View>
				<FlatList
					data={studentsList}
					keyExtractor={(item) => item.name} // fix, should be item.id (add id to classes)
					renderItem={({ item }) => (
						<StudentMultiAssignmentsCard
							key={item.studentID}
							studentName={item.name}
							profilePic={studentImages.images[item.profileImageID]}
							currentAssignments={item.currentAssignments}
							onPress={() =>
								props.navigation.push('TeacherStudentProfile', {
									currentAssignments: item.currentAssignments,
									teacherID,
									studentID: item.studentID,
									currentClass,
									classID,
								})
							}
							onAssignmentPress={(assignmentID) => {
								if (assignmentID === -1) {
									//go to the screen to a new assignment
									props.navigation.push('MushafAssignmentScreen', {
										newAssignment: true,
										popOnClose: true,
										onSaveAssignment: () => initScreen(),
										isTeacher: true,
										assignToAllClass: false,
										teacherID,
										classID,
										studentID: item.studentID,
										currentClass,
										imageID: item.profileImageID,
									});
								} else {
									//go to the passed in assignment
									this.props.navigation.push('MushafAssignmentScreen', {
										isTeacher: true,
										assignToAllClass: false,
										popOnClose: true,
										onSaveAssignment: () => initScreen(),
										teacherID,
										classID,
										studentID: item.studentID,
										currentClass,
										assignmentID,
										newAssignment: false,
										imageID: item.profileImageID,
									});
								}
							}}
							background={sectionBackgroundColor}
							comp={
								isEditingClass === true ? (
									<Icon
										name='user-times'
										size={PixelRatio.get() * 9}
										type='font-awesome'
										color={colors.primaryDark}
									/>
								) : null
							}
							compOnPress={() => {
								removeStudent(item.studentID);
							}}
						/>
					)}
				/>
			</View>
		);
	};

	// The return statement will render something different depending on the state of the teacher. The cases
	// are either that the teacher doesn't have any classes, or the teacher has a class but it is empty, or
	// the teacher has a class with students like normal
	if (isLoading === true) {
		return (
			<View style={styles.loadingSpinner}>
				<LoadingSpinner isVisible={true} />
			</View>
		);
	}

	// If teacher doesn't have any classes
	if (doesTeacherHaveClasses === false) {
		return (
			<SideMenu
				isOpen={isLeftNavOpen}
				menu={
					<LeftNavPane
						teacher={teacher}
						teacherID={teacherID}
						classes={allTeacherClasses}
						edgeHitWidth={0}
						navigation={props.navigation}
					/>
				}>
				<QCView style={screenStyle.container}>
					<View style={styles.topBannerContainer}>
						<TopBanner
							LeftIconName='navicon'
							LeftOnPress={() => setIsLeftNavOpen(true)}
							isEditingTitle={isEditingClass}
							isEditingPicture={isEditingClass}
							onEditingPicture={(newPicture) => changeClassImage(newPicture)}
							Title={'Quran Connect'}
							onTitleChanged={(newTitle) => changeClassName(newTitle)}
							profileImageID={currentClass.classImageID}
						/>
					</View>
					<View style={styles.noClassNoStudentsContainer}>
						<Text style={fontStyles.hugeTextStylePrimaryDark}>{strings.NoClass}</Text>

						<Image
							source={require('assets/emptyStateIdeas/welcome-girl.png')}
							style={styles.noClassNoStudentsImage}
						/>

						<QcActionButton
							text={strings.AddClassButton}
							onPress={() => {
								props.navigation.push('AddClassScreen', {
									teacherID,
								});
							}}
						/>
					</View>
				</QCView>
			</SideMenu>
		);
	}

	// If class doesn't have any students
	if (currentClass.students.length === 0) {
		return (
			<SideMenu
				isOpen={isLeftNavOpen}
				menu={
					<LeftNavPane
						teacher={teacher}
						teacherID={teacherID}
						classes={allTeacherClasses}
						edgeHitWidth={0}
						navigation={props.navigation}
					/>
				}>
				<QCView style={screenStyle.container}>
					<View style={styles.topBannerContainer}>
						<TopBanner
							LeftIconName='navicon'
							LeftOnPress={() => setIsLeftNavOpen(true)}
							isEditingTitle={isEditingClass}
							isEditingPicture={isEditingClass}
							Title={currentClass.className}
							onTitleChanged={(newTitle) => changeClassName(newTitle)}
							onEditingPicture={(newPicture) => changeClassImage(newPicture)}
							profileImageID={currentClass.classImageID}
							RightIconName='edit'
							RightOnPress={() =>
								props.navigation.push('ShareClassCode', {
									classInviteCode: currentClass.classInviteCode,
									classID,
									teacherID,
									currentClass,
								})
							}
						/>
					</View>
					<View style={styles.noClassNoStudentsContainer}>
						<Text style={fontStyles.hugeTextStylePrimaryDark}>{strings.EmptyClass}</Text>
						<Image
							source={require('assets/emptyStateIdeas/welcome-girl.png')}
							style={styles.noClassNoStudentsImage}
						/>
						<QcActionButton
							text={strings.AddStudentButton}
							onPress={() =>
								props.navigation.push('ShareClassCode', {
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

	// Renders the UI with the list of students
	return (
		<SideMenu
			isOpen={isLeftNavOpen}
			menu={
				<LeftNavPane
					teacher={teacher}
					teacherID={teacherID}
					classes={allTeacherClasses}
					edgeHitWidth={0}
					navigation={props.navigation}
				/>
			}>
			<ScrollView style={styles.container}>
				<View>
					<TopBanner
						LeftIconName='navicon'
						LeftOnPress={() => setIsLeftNavOpen(true)}
						Title={currentClass.className}
						RightIconName={isEditingClass === false ? 'edit' : null}
						RightTextName={isEditingClass === true ? strings.Done : null}
						isEditingTitle={isEditingClass}
						isEditingPicture={isEditingClass}
						onTitleChanged={(newTitle) => changeClassName(newTitle)}
						onEditingPicture={(newPicture) => changeClassImage(newPicture)}
						profileImageID={currentClass.classImageID}
						RightOnPress={() => {
							if (isEditingClass === true) {
								if (currentClass.className.trim() === '') {
									Alert.alert(strings.Whoops, strings.AddText);
								} else {
									FirebaseFunctions.call('updateClassByID', {
										classID,
										updates: {
											classImageID: currentClass.classImageID,
										},
									});
									FirebaseFunctions.call('updateClassByID', {
										classID,
										updates: {
											className: currentClass.className,
										},
									});
									setIsEditingClass(false);
								}
							} else {
								setIsEditingClass(true);
								setIsLeftNavOpen(false);
							}
						}}
					/>
				</View>
				{isEditingClass && (
					<View style={styles.AddStudentButton}>
						<TouchableText
							text={strings.AddStudents}
							onPress={() => {
								//Goes to add students screen
								props.navigation.push('ShareClassCode', {
									classInviteCode: currentClass.classInviteCode,
									classID,
									teacherID,
									currentClass,
								});
							}}
							style={{
								...fontStyles.bigTextStylePrimaryDark,
								...styles.addStudentsTouchableText,
							}}
						/>
					</View>
				)}
				{//render students who need help with their assignments
				studentsNeedHelp.length > 0 &&
					this.renderStudentSection(
						strings.NeedHelp,
						'issue-opened',
						'octicon',
						studentsNeedHelp,
						colors.darkRed,
						colors.red
					)}
				{//render students who are ready for tasmee'
				studentsReady.length > 0 &&
					renderStudentSection(
						strings.Ready,
						'check-circle-outline',
						'material-community',
						studentsReady,
						colors.darkGreen,
						colors.green
					)}
				{//render section of students who don't have an active assignment yet
				studentsWithNoAssignments.length > 0 &&
					renderStudentSection(
						strings.NeedAssignment,
						'pencil-plus-outline',
						'material-community',
						studentsWithNoAssignments,
						colors.primaryDark,
						colors.white
					)}
				{//Remder section of students who haven't started on their homework yet
				studentsNotStarted.length > 0 &&
					renderStudentSection(
						strings.NotStarted,
						'bookmark-off-outline',
						'material-community',
						studentsNotStarted,
						colors.primaryDark,
						colors.white
					)}
				{//Remder section of students who haven't started on their homework yet
				studentsWorkingOnIt.length > 0 &&
					renderStudentSection(
						strings.WorkingOnIt,
						'update',
						'material-community',
						studentsWorkingOnIt,
						colors.primaryDark,
						colors.white
					)}
			</ScrollView>
		</SideMenu>
	);
};

// Exports the functional component
export default ClassMainScreen;
