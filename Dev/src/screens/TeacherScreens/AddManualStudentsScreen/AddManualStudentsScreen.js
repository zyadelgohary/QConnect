// This screen will be accessed from the ShareClassCodeScreen if the teacher elects to create a manual
// student. Manual students will be given a name and a profile picture selected by the teacher. Once the
// teacher clicks "Add Student", that student will be added to the class
import React, { Component, useEffect, useState } from 'react';
import {
	ScrollView,
	View,
	StyleSheet,
	FlatList,
	Dimensions,
	Text,
	Alert,
	Share,
	TextInput,
	PixelRatio,
	Platform,
} from 'react-native';
import StudentCard from 'components/StudentCard';
import colors from 'config/colors';
import studentImages from 'config/studentImages';
import { Icon } from 'react-native-elements';
import strings from 'config/strings';
import QcActionButton from 'components/QcActionButton';
import ImageSelectionModal from 'components/ImageSelectionModal';
import ImageSelectionRow from 'components/ImageSelectionRow';
import FirebaseFunctions from 'config/FirebaseFunctions';
import LoadingSpinner from 'components/LoadingSpinner';
import QCView from 'components/QCView';
import fontStyles from 'config/fontStyles';
import { screenHeight, screenWidth } from 'config/dimensions';
import { getRandomGenderNeutralImage, getHighlightedImages } from './FunctionHelpers';
import styles from './AddManualStudentsScreenStyle';

// Creates the functional component
const AddManualStudentsScreen = (props) => {
	// The state fields used in this screen and the props passed from existing screens
	const { classID, teacherID, currentClass } = props.navigation.state.params;
	const [students, setStudents] = useState(currentClass.students);
	const [newStudentName, setNewStudentName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [profileImageID, setProfileImageID] = useState(getRandomGenderNeutralImage());
	const [highlightedImagesIndices, setHighlightedImageIndices] = useState(getHighlightedImages());
	const [modalVisible, setModalVisible] = useState(false);

	// The useEffect method which will get called when the component mounts and sets the screen in Firebase Analytics
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Add Students Manually Screen', 'AddManualStudentsScreen');
	}, []);

	// This method handles the state management for when an image is clicked
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

	// Handles the Cloud Functions for saving the new array of students to Firestore
	const addManualStudent = async () => {
		if (newStudentName.trim() === '') {
			Alert.alert(strings.Whoops, strings.PleaseInputAName);
		} else {
			setIsLoading(true);

			// Adds the student to Firestore
			const studentID = await FirebaseFunctions.call('createStudent', {
				emailAddress: '',
				isManual: {
					classID: classID,
					classInviteCode: currentClass.classInviteCode,
				},
				name: newStudentName,
				phoneNumber: '',
				profileImageID: profileImageID,
				studentID: '',
			});

			// Appends the student to the state
			let newArrayOfStudents = students;
			newArrayOfStudents.push({
				name: newStudentName,
				studentID: studentID,
				profileImageID: profileImageID,
			});
			setNewStudentName('');
			setStudents(newArrayOfStudents);
			setHighlightedImageIndices(getHighlightedImages());
			setIsLoading(false);
		}
	};

	// This will handle the logic of disconnecting a student from a classroom
	const removeStudent = async (studentID) => {
		setIsLoading(true);

		console.log(studentID);
		console.log(classID);

		await FirebaseFunctions.call('disconnectStudentFromClass', {
			studentID,
			classID,
		});

		let arrayOfClassStudents = students;
		let indexOfStudent = arrayOfClassStudents.findIndex((student) => {
			return student.studentID === studentID;
		});

		arrayOfClassStudents.splice(indexOfStudent, 1);

		setStudents(arrayOfClassStudents);
		setIsLoading(false);
	};

	// Renders the UI of the screen
	return (
		<QCView style={styles.qcviewContainer}>
			<ScrollView nestedScrollEnabled={true} style={styles.container}>
				<ImageSelectionModal
					visible={modalVisible}
					images={studentImages.images}
					cancelText='Cancel'
					setModalVisible={(visible) => setModalVisible(visible)}
					onImageSelected={(index) => onImageSelected(index)}
				/>
				<View style={styles.addStudentsView}>
					<View style={styles.enterStudentNameText}>
						<Text style={{ ...fontStyles.mainTextStyleBlack, ...styles.textBottomMargin }}>
							{strings.EnterYourStudentsName}
						</Text>
					</View>
					<View style={styles.studentNameContainer}>
						<TextInput
							style={[fontStyles.mainTextStyleDarkGrey, styles.studentNameTextInput]}
							placeholder={strings.StudentName}
							autoCorrect={false}
							onChangeText={(newStudentName) => setNewStudentName(newStudentName)}
							value={newStudentName}
						/>
					</View>
					<View style={styles.profileImageContainer}>
						<ImageSelectionRow
							images={studentImages.images}
							highlightedImagesIndices={highlightedImagesIndices}
							onImageSelected={(index) => onImageSelected(index)}
							onShowMore={() => setModalVisible(true)}
							selectedImageIndex={profileImageID}
						/>
					</View>
					<View style={styles.addStudentButton}>
						<QcActionButton
							text={strings.AddStudent}
							onPress={() => {
								FirebaseFunctions.logEvent('TEACHER_ADD_STUDENT_MANUAL');
								addManualStudent();
							}}
						/>
					</View>
				</View>
				<View style={styles.doneButton}>
					{isLoading === true ? (
						<LoadingSpinner isVisible={true} />
					) : (
						<QcActionButton
							text={strings.Done}
							onPress={() =>
								props.navigation.push('TeacherCurrentClass', {
									teacherID,
									classID,
								})
							}
						/>
					)}
				</View>
				<FlatList
					data={students}
					keyExtractor={(item, index) => item.studentID}
					extraData={students}
					renderItem={({ item, index }) => (
						<StudentCard
							key={index}
							studentName={item.name}
							profilePic={studentImages.images[item.profileImageID]}
							background={colors.white}
							onPress={() => {}}
							compOnPress={() => {
								Alert.alert(strings.RemoveStudent, strings.AreYouSureYouWantToRemoveStudent, [
									{
										text: strings.Remove,
										onPress: () => {
											removeStudent(item.studentID);
										},
									},

									{ text: strings.Cancel, style: 'cancel' },
								]);
							}}
							comp={
								<Icon
									name='user-times'
									size={PixelRatio.get() * 9}
									type='font-awesome'
									color={colors.primaryLight}
								/>
							}
						/>
					)}
				/>
			</ScrollView>
		</QCView>
	);
};

// Exports the component
export default AddManualStudentsScreen;
