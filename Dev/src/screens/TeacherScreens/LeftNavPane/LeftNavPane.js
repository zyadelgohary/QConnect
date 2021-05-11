// This is going to be the LeftSideMenu where Teachers will be able to see their profile, classes, and other information
import React, { useState, useEffect } from 'react';
import { View, FlatList, ScrollView, Text } from 'react-native';
import colors from 'config/colors';
import classImages from 'config/classImages';
import FirebaseFunctions from 'config/FirebaseFunctions';
import { SafeAreaView } from 'react-navigation';
import QcDrawerItem from 'components/QcDrawerItem';
import teacherImages from '../../../../config/teacherImages';
import strings from '../../../../config/strings';
import QcActionButton from 'components/QcActionButton';
import fontStyles from 'config/fontStyles';
import LeftNavPaneStyle from './LeftNavPaneStyle';

// Creates the functional component
const LeftNavPane = (props) => {
	// The state fields for this screen
	const [teacher, setTeacher] = useState(props.teacher);
	const [teacherID, setTeacherID] = useState(props.teacherID);
	const [classes, setClasses] = useState(props.classes);
	const [deleteOrStopDeleteText, setDeleteOrStopDeleteText] = useState(strings.deleteClass);
	const [backColor, setBackColor] = useState(colors.white);
	const [deleteBool, setDeleteBool] = useState(false);

	// The useEffect method acts as a componentDidMount in that it calls when the component is mounted. This one
	// records the screen in Firebase
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Teacher Left Nav Pane', 'LeftNavPane');
	}, []);

	// This method handles the open class functionality. It will record the current class being viewed in the teacher object
	// in Firestore then navigates to the teacher current class. Not async so we don't hold up the UI
	const openClass = (classID) => {
		FirebaseFunctions.call('updateTeacherByID', {
			teacherID,
			updates: {
				currentClassID: classID,
			},
		});
		FirebaseFunctions.logEvent('TEACHER_OPEN_CLASS');

		props.navigation.push('TeacherCurrentClass', {
			teacherID,
			classID,
		});
	};

	// This method handles the logic and state management for deleting a specific class
	const triggerDeleteClass = () => {
		setDeleteOrStopDeleteText(
			deleteOrStopDeleteText === strings.deleteClass
				? strings.finishDeleteClass
				: strings.deleteClass
		);
		setBackColor(backColor === colors.white ? colors.red : colors.white);
		setDeleteBool(!deleteBool);
	};

	// Handles the logic behind disconnecting a teacher from a class
	const disconnectTeacher = async (classID) => {
		// Disconnects the teacher from the class
		await FirebaseFunctions.call('disconnectTeacherFromClass', {
			teacherID,
			classID,
		});
		if (teacher.currentClassID === classID) {
			if (teacher.classIDs.length > 1) {
				const newClassID = teacher.classIDs.find((eachClassID) => eachClassID !== classID);
				props.navigation.push('TeacherCurrentClass', {
					teacherID,
					classID: newClassID,
				});
			} else {
				props.navigation.push('TeacherCurrentClass', {
					teacherID,
				});
			}
		} else {
			props.navigation.push('TeacherCurrentClass', {
				teacherID,
				classID: teacher.currentClassID,
			});
		}
	};

	// Returns the UI of the screen
	return (
		<ScrollView>
			<SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
				<View style={LeftNavPaneStyle.container}>
					<View style={{ flexDirection: 'row' }}>
						<Text style={fontStyles.hugeTextStylePrimaryDark}>{strings.AppTitle}</Text>
					</View>
				</View>
				<QcDrawerItem
					title={teacher.name + strings.sProfile}
					image={teacherImages.images[teacher.profileImageID]}
					onPress={() => {
						triggerDeleteClass();
						props.navigation.push('Profile', {
							accountObject: teacher,
							userID: teacherID,
							classes: classes,
							isTeacher: true,
						});
					}}
				/>
				<FlatList
					data={classes}
					extraData={deleteOrStopDeleteText}
					keyExtractor={(item, index) => item.classID}
					renderItem={({ item, index }) => (
						<QcDrawerItem
							title={item.className}
							image={classImages.images[item.classImageID]}
							onPress={async () => {
								if (deleteBool === true) {
									disconnectTeacher(item.classID);
								} else {
									openClass(item.classID);
								}
							}}
							backColor={backColor}
						/>
					)}
				/>
				<QcDrawerItem
					title={strings.AddNewClass}
					icon='plus'
					onPress={() => {
						props.navigation.push('AddClassScreen', {
							teacherID: teacherID,
						});
					}}
				/>
				<QcDrawerItem
					title={strings.Settings}
					icon='cogs'
					onPress={() =>
						props.navigation.push('Settings', {
							isTeacher: true,
							teacher: teacher,
							userID: teacherID,
							classes: classes,
						})
					}
				/>
				<QcActionButton text={deleteOrStopDeleteText} onPress={() => triggerDeleteClass()} />
			</SafeAreaView>
		</ScrollView>
	);
};

// Exports the module
export default LeftNavPane;
