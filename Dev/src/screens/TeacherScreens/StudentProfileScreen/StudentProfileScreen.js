// This is the screen where information about the class-specific student is shown
import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	Image,
	Text,
	ScrollView,
	FlatList,
	TouchableHighlight,
	TouchableOpacity,
} from 'react-native';
import colors from 'config/colors';
import QcActionButton from 'components/QcActionButton';
import { Rating, ListItem } from 'react-native-elements';
import strings from 'config/strings';
import studentImages from 'config/studentImages';
import QcParentScreen from 'screens/QcParentScreen';
import FirebaseFunctions from 'config/FirebaseFunctions';
import LoadingSpinner from 'components/LoadingSpinner';
import fontStyles from 'config/fontStyles';
import { Icon } from 'react-native-elements';
import DailyTracker from 'components/DailyTracker';
import Toast, { DURATION } from 'react-native-easy-toast';
import themeStyles from 'config/themeStyles';
import styles from './StudentProfileScreenStyle';
import { convertDateToString } from 'config/utils/dateUtils';

// Creates the functional component
const StudentProfileScreen = (props) => {
	// The global variables used in this screen
	const { teacherID, studentID, currentClass, classID } = props.navigation.state.params;
	let assignmentTypes = [];
	assignmentTypes[strings.Memorization] = {
		color: colors.darkGreen,
		iconName: 'brain',
		iconType: 'material-community',
		name: strings.Memorize,
	};

	assignmentTypes[strings.Reading] = {
		color: colors.magenta,
		iconName: 'book-open',
		iconType: 'feather',
		name: strings.Read,
	};

	assignmentTypes[strings.Revision] = {
		color: colors.blue,
		iconName: 'redo',
		iconType: 'evilicon',
		name: strings.Review,
	};

	// The state variables used in this screen
	const [isLoading, setIsLoading] = useState(true);
	const [currentAssignments, setCurrentAssignments] = useState(
		props.navigation.state.params.currentAssignments
	);
	const [assignmentHistory, setAssignmentHistory] = useState('');
	const [classStudent, setClassStudent] = useState('');
	const [isDialogVisible, setIsDialogVisible] = useState(false);
	const [dailyPracticeLog, setDailyPracticeLog] = useState({});

	// The useEffect method acts as a componentDidMount and fetches all the correct data from Firebase using a helper method, along with setting
	// the screen name in Firebase Analytics
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Teacher Student Profile Screen', 'StudentProfileScreen');
		initializeScreen();
	}, []);

	// Helper method for useEffect in order to fetch initial student data from Firebase. Uses promises
	// in order to fetch the data fast
	const initializeScreen = async () => {
		const promises = [];

		promises.push(FirebaseFunctions.call('getStudentByClassID', { classID, studentID }));
		promises.push(
			FirebaseFunctions.call('getCompletedAssignmentsByStudentID', { classID, studentID, limit: 3 })
		);
		promises.push(
			FirebaseFunctions.call('getPracticeLogForStudentByWeek', {
				studentID,
				classID,
				day: convertDateToString(new Date()),
			})
		);

		const results = await Promise.all(promises);
		setClassStudent(results[0]);
		setAssignmentHistory(results[1]);
		setDailyPracticeLog(results[2]);
		setIsLoading(false);
	};

	// This method is going to return the caption string associated with the average rating of a student
	const getRatingCaption = () => {
		let caption = strings.GetStarted;

		const { averageRating } = classStudent;

		if (averageRating > 4) {
			caption = strings.OutStanding;
		} else if (averageRating >= 3) {
			caption = strings.GreatJob;
		} else if (averageRating > 0) {
			caption = strings.PracticePerfect;
		}

		return caption;
	};

	// The following methods will aid in rendering specific sections of the UI. They will be named appropriately
	const renderAssignmentsSectionHeader = (label, iconName, desc) => {
		return (
			<View style={styles.assignmentSectionHeader}>
				<View
					style={{
						alignItems: 'center',
						flexDirection: 'row',
					}}>
					<Icon name={iconName} type='material-community' color={colors.darkGrey} />
					<Text
						style={[styles.assignmentSectionHeaderLeftMargin, fontStyles.mainTextStyleDarkGrey]}>
						{label ? label.toUpperCase() : strings.Assignment}
					</Text>
				</View>
				{desc && <Text style={fontStyles.smallTextStyleDarkGrey}>{desc}</Text>}
			</View>
		);
	};

	const renderHistoryItem = (item, index) => {
		return (
			<TouchableOpacity
				onPress={() => {
					//To-Do: Navigates to more specific evaluation for this assignment
					props.navigation.push('EvaluationPage', {
						classID: classID,
						studentID: studentID,
						classStudent: classStudent,
						assignmentID: item.assignmentID,
						assignment: item.assignment,
						teacherID: teacherID,
						readOnly: true,
						newAssignment: false,
					});
				}}>
				<View style={styles.prevAssignmentCard} key={index}>
					<View style={styles.historyInnerContainer}>
						<View style={styles.completionDateText}>
							<Text style={fontStyles.mainTextStylePrimaryDark}>{item.completionDate}</Text>
						</View>
						<View style={styles.assignmentTypeContainer}>
							<Text
								numberOfLines={1}
								style={[
									fontStyles.mainTextStyleBlack,
									{
										color:
											item.type === strings.Reading
												? colors.grey
												: item.type === strings.Memorization
												? colors.darkGreen
												: colors.darkishGrey,
									},
								]}>
								{item.type}
							</Text>
						</View>
						<View style={styles.ratingContainer}>
							<Rating readonly={true} startingValue={item.evaluation.rating} imageSize={17} />
						</View>
					</View>
					<View style={styles.assignmentNameContainer}>
						<Text numberOfLines={1} style={fontStyles.bigTextStyleBlack}>
							{item.name}
						</Text>
					</View>
					{item.evaluation.notes ? (
						<Text numberOfLines={2} style={fontStyles.smallTextStyleDarkGrey}>
							{'Notes: ' + item.evaluation.notes}
						</Text>
					) : (
						<View />
					)}
					{item.evaluation.improvementAreas && item.evaluation.improvementAreas.length > 0 ? (
						<View style={styles.improvementAreasContainer}>
							<Text
								style={[
									fontStyles.smallTextStyleDarkGrey,
									{ textVerticalAlign: 'center', paddingTop: 5 },
								]}>
								{strings.ImprovementAreas}
							</Text>
							{item.evaluation.improvementAreas.map((tag, cnt) => {
								return (
									<View style={[styles.corner, styles.improvementAreaBox]}>
										<Icon
											name='tag'
											size={10}
											containerStyle={styles.rightSpacer}
											style={styles.rightSpacer}
											type='simple-line-icon'
											color={colors.darkGrey}
										/>

										<Text key={tag} style={[fontStyles.smallTextStyleDarkGrey, styles.centerText]}>
											{tag}
										</Text>
									</View>
								);
							})}
						</View>
					) : (
						<View />
					)}
					{item.submission ? (
						<View style={styles.flexEndRow}>
							<Icon name='microphone' type='material-community' color={colors.darkRed} />
						</View>
					) : (
						<View />
					)}
				</View>
			</TouchableOpacity>
		);
	};

	if (isLoading === true) {
		return (
			<View style={styles.loadingContainer}>
				<LoadingSpinner isVisible={true} />
			</View>
		);
	}

	// Renders the UI of the screen
	return (
		<View style={styles.flexOne}>
			<ScrollView containerStyle={styles.studentInfoContainer}>
				<View style={styles.profileInfo}>
					<View style={styles.profileInfoTop}>
						<View style={styles.horizontalSpacer} />
						<View style={styles.profileInfoTopRight}>
							<Text numberOfLines={1} style={fontStyles.bigTextStyleBlack}>
								{classStudent.name.toUpperCase()}
							</Text>
							<View style={styles.topRatingContainer}>
								<Rating readonly={true} startingValue={classStudent.averageRating} imageSize={25} />
								<View
									style={{
										flexDirection: 'column',
										justifyContent: 'center',
									}}>
									<Text style={fontStyles.bigTextStyleDarkGrey}>
										{classStudent.averageRating === 0
											? ''
											: parseFloat(classStudent.averageRating).toFixed(1)}
									</Text>
								</View>
							</View>
							<Text style={fontStyles.mainTextStylePrimaryDark}>{getRatingCaption()}</Text>
						</View>
					</View>
					<View style={styles.profileInfoBottom}>
						<View style={styles.profileInfoTopLeft}>
							<Image
								style={styles.profilePic}
								source={studentImages.images[classStudent.profileImageID]}
							/>
						</View>
						<View style={styles.attendanceHeader}>
							<Text style={[fontStyles.mainTextStyleDarkGrey, styles.textPadding]}>
								{strings.Attendance}:
							</Text>

							<View style={styles.classesAttended}>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'flex-start',
									}}>
									<Icon
										name='account-check-outline'
										type='material-community'
										color={colors.darkGreen}
										size={20}
									/>
									<Text style={[fontStyles.mainTextStyleDarkGreen, styles.textPadding]}>
										{strings.Attended}
									</Text>
									<Text style={[fontStyles.mainTextStyleDarkGreen]}>
										{classStudent.classesAttended}
									</Text>
								</View>
							</View>
							<View style={styles.smallHorizontalSpacer} />
							<View style={styles.classesMissed}>
								<View style={styles.missedTextContainer}>
									<Icon
										name='account-remove-outline'
										type='material-community'
										color={colors.darkRed}
										size={20}
									/>
									<Text style={[fontStyles.mainTextStyleDarkRed, styles.textPadding]}>
										{strings.Missed}
									</Text>
									<Text style={[fontStyles.mainTextStyleDarkRed]}>
										{classStudent.classesMissed}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
				{currentAssignments.length === 0 && assignmentHistory.length === 0 ? (
					<View style={styles.noClassText}>
						<Text style={fontStyles.hugeTextStylePrimaryDark}>{strings.NoClass}</Text>

						<Image
							source={require('assets/emptyStateIdeas/welcome-girl.png')}
							style={styles.welcomeImage}
						/>

						<QcActionButton
							text={strings.AddAssignment}
							onPress={() => {
								props.navigation.push('MushafAssignmentScreen', {
									newAssignment: true,
									popOnClose: true,
									assignToAllClass: false,
									teacherID: teacherID,
									classID,
									studentID,
									currentClass,
									imageID: classStudent.profileImageID,
								});
							}}
						/>
					</View>
				) : (
					<View />
				)}
				{renderAssignmentsSectionHeader(
					strings.DailyPracticeLog,
					'calendar-check-outline',
					strings.DailyPracticeLogDecTeacherView
				)}

				<DailyTracker data={dailyPracticeLog} readOnly={true} />
				{renderAssignmentsSectionHeader(strings.CurrentAssignments, 'book-open-outline')}

				<FlatList
					style={{ flexGrow: 0 }}
					extraData={currentAssignments.map((value) => value.name)}
					data={currentAssignments}
					keyExtractor={(item, index) => item.name + index + Math.random() * 10}
					renderItem={({ item, index }) => (
						<View
							style={[
								styles.currentAssignment,
								{
									backgroundColor:
										item.isReadyEnum === 'WORKING_ON_IT'
											? colors.workingOnItColorBrown
											: item.isReadyEnum === 'READY'
											? colors.green
											: item.isReadyEnum === 'NOT_STARTED'
											? colors.primaryVeryLight
											: colors.red,
								},
							]}>
							{item.submission ? (
								<View style={styles.microphoneContainer}>
									<Icon name='microphone' type='material-community' color={colors.darkRed} />
								</View>
							) : (
								<View />
							)}
							<View style={styles.middleView}>
								<View style={styles.assignmentTypeIcon}>
									{item.type && (
										<Icon
											name={assignmentTypes[item.type].iconName}
											type={assignmentTypes[item.type].iconType}
											color={colors.darkGrey}
											size={15}
										/>
									)}
									<Text style={[fontStyles.mainTextStyleBlack, { paddingLeft: 5 }]}>
										{item.type}
									</Text>
								</View>
								<Text style={[fontStyles.bigTextStyleBlack, { paddingTop: 5 }]}>
									{item.name.toUpperCase()}
								</Text>
							</View>
							<View style={styles.statusContainer}>
								<Text style={fontStyles.mainTextStylePrimaryDark}>
									{item.status === 'READY' && strings.Ready}
									{item.status === 'WORKING_ON_IT' && strings.WorkingOnIt}
									{item.status === 'NOT_STARTED' && strings.NotStarted}
									{item.status === 'NEED_HELP' && strings.NeedHelp}
								</Text>
							</View>
							<View style={styles.flexOne}>
								<View style={styles.assignmentCardContainer}>
									<TouchableHighlight
										style={styles.cardButtonStyle}
										onPress={() => {
											props.navigation.push('MushafAssignmentScreen', {
												popOnClose: true,
												assignToAllClass: false,
												teacherID,
												classID,
												studentID,
												newAssignment: false,
												currentClass,
												assignment: item,
												assignmentID: item.assignmentID,
												imageID: classStudent.profileImageID,
											});
										}}>
										<Text style={fontStyles.mainTextStyleDarkGrey}>{strings.EditAssignment}</Text>
									</TouchableHighlight>
									<TouchableHighlight
										style={styles.cardButtonStyle}
										onPress={() => {
											props.navigation.push('EvaluationPage', {
												classID: classID,
												studentID: studentID,
												assignmentName: item.name,
												teacherID,
												classStudent: classStudent,
												assignmentID: item.assignmentID,
												assignment: item,
												newAssignment: true,
												readOnly: false,
											});
										}}>
										<View style={styles.gradeText}>
											<Text style={fontStyles.mainTextStyleDarkGrey}>{strings.Grade}</Text>
										</View>
									</TouchableHighlight>
								</View>
							</View>
						</View>
					)}
				/>
				<TouchableHighlight
					style={[styles.noOpacityCardButtonStyle, { flexDirection: 'row' }]}
					onPress={() => {
						props.navigation.push('MushafAssignmentScreen', {
							popOnClose: true,
							newAssignment: true,
							assignToAllClass: false,
							teacherID,
							classID,
							studentID,
							currentClass,
							imageID: classStudent.profileImageID,
						});
					}}>
					<View style={styles.addAssignmentText}>
						<Icon name='addfile' type='antdesign' size={15} color={colors.primaryDark} />
						<Text style={[fontStyles.mainTextStylePrimaryDark, styles.smallLeftMargin]}>
							{strings.AddAssignment}
						</Text>
					</View>
				</TouchableHighlight>
				<ScrollView>
					{assignmentHistory &&
						assignmentHistory.length > 0 &&
						renderAssignmentsSectionHeader(strings.PastAssignments, 'history')}
					<FlatList
						data={assignmentHistory}
						keyExtractor={(item, index) => item.name + index}
						renderItem={({ item, index }) => {
							return renderHistoryItem(item, index, currentClass);
						}}
					/>
				</ScrollView>
			</ScrollView>
		</View>
	);
};

// Exports the component
export default StudentProfileScreen;
