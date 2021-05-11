// This is going to be the StyleSheet for the StudentProfileScreen
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	studentInfoContainer: {
		marginVertical: 0.005 * screenHeight,
		backgroundColor: colors.white,
		flex: 1,
		borderColor: colors.lightGrey,
		borderWidth: 1,
		justifyContent: 'flex-end',
	},
	currentAssignment: {
		minHeight: 120,
		borderWidth: 0.5,
		borderColor: colors.grey,
		marginBottom: 5,
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
		elevation: 2,
	},
	middleView: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	profileInfo: {
		flexDirection: 'column',
		backgroundColor: colors.white,
		marginBottom: 0.001 * screenHeight,
		paddingBottom: screenHeight * 0.01,
	},
	corner: {
		borderColor: '#D0D0D0',
		borderWidth: 1,
		borderRadius: screenHeight * 0.004,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: screenWidth * 0.012,
		marginRight: screenHeight * 0.012,
		marginVertical: screenHeight * 0.004,
	},
	profileInfoTop: {
		paddingHorizontal: screenWidth * 0.024,
		paddingTop: screenHeight * 0.015,
		flexDirection: 'row',
	},
	profileInfoTopLeft: {
		flexDirection: 'column',
		marginLeft: 0.007 * screenWidth,
		marginTop: -0.097 * screenHeight,
		alignItems: 'center',
		width: 0.24 * screenWidth,
	},
	profileInfoTopRight: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		paddingLeft: screenWidth * 0.05,
		paddingBottom: 0.007 * screenHeight,
	},
	profileInfoBottom: {
		flexDirection: 'column',
		paddingHorizontal: 0.024 * screenWidth,
		paddingBottom: screenHeight * 0.02,
		borderBottomColor: colors.grey,
		borderBottomWidth: 1,
	},
	profilePic: {
		width: 0.1 * screenHeight,
		height: 0.1 * screenHeight,
		borderRadius: 0.075 * screenHeight,
		paddingBottom: 0.015 * screenHeight,
	},
	prevAssignments: {
		flexDirection: 'column',
		backgroundColor: colors.white,
		marginHorizontal: 0.017 * screenWidth,
	},
	prevAssignmentCard: {
		flexDirection: 'column',
		borderBottomColor: colors.lightGrey,
		borderBottomWidth: 1,
		paddingHorizontal: screenWidth * 0.007,
		paddingVertical: screenHeight * 0.005,
		shadowColor: colors.black,
	},
	classesAttended: {
		paddingLeft: 5,
		paddingRight: 5,
	},
	classesMissed: {
		paddingRight: 5,
	},
	cardButtonStyle: {
		flex: 1,
		marginHorizontal: 5,
		backgroundColor: 'rgba(255,255,255,0.6)',
		height: 40,
		borderRadius: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},

	noOpacityCardButtonStyle: {
		flex: 1,
		marginHorizontal: 2,
		marginVertical: 8,
		backgroundColor: colors.primaryLight,
		borderColor: colors.lightGrey,
		borderWidth: 1,
		height: 40,
		borderRadius: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	assignmentSectionHeader: {
		marginLeft: screenWidth * 0.017,
		paddingTop: screenHeight * 0.005,
		paddingBottom: screenHeight * 0.01,
	},
	assignmentSectionHeaderLeftMargin: {
		marginLeft: screenWidth * 0.017,
	},
	completionDateText: {
		flex: 3,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	historyInnerContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	assignmentTypeContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 3,
	},
	ratingContainer: {
		flex: 3,
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	assignmentNameContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	improvementAreasContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		height: screenHeight * 0.03,
	},
	improvementAreaBox: {
		flexDirection: 'row',
		backgroundColor: colors.primaryVeryLight,
	},
	rightSpacer: {
		paddingRight: 5,
	},
	centerText: {
		textAlign: 'center',
	},
	flexEndRow: {
		justifyContent: 'flex-end',
		flexDirection: 'row',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	flexOne: {
		flex: 1,
	},
	topRatingContainer: {
		flexDirection: 'row',
		height: 0.037 * screenHeight,
	},
	horizontalSpacer: {
		width: screenWidth * 0.24,
	},
	smallHorizontalSpacer: {
		width: 20,
	},
	attendanceHeader: {
		paddingTop: 10,
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	textPadding: {
		paddingLeft: 5,
		paddingRight: 10,
	},
	missedTextContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	noClassText: {
		alignItems: 'center',
		justifyContent: 'flex-start',
		alignSelf: 'center',
		flex: 2,
	},
	welcomeImage: {
		width: 0.73 * screenWidth,
		height: 0.22 * screenHeight,
		resizeMode: 'contain',
	},
	microphoneContainer: {
		paddingTop: 5,
		justifyContent: 'flex-end',
		flexDirection: 'row',
	},
	assignmentTypeIcon: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	statusContainer: {
		flexDirection: 'row',
		paddingLeft: screenWidth * 0.02,
		justifyContent: 'center',
		marginVertical: 5,
	},
	assignmentCardContainer: {
		flexDirection: 'row',
		height: 50,
		justifyContent: 'center',
		alignContent: 'center',
	},
	gradeText: {
		paddingLeft: screenWidth * 0.02,
		opacity: 1,
	},
	addAssignmentText: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	smallLeftMargin: {
		marginLeft: 5,
	},
	chartTitleSpacer: {
		height: screenHeight * 0.0075,
	},
});
