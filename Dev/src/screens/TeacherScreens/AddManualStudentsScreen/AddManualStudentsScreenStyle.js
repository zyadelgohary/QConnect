// This is going to be the styles for the AddManualStudentsScreen style
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
		flex: 1,
	},
	addStudentsView: {
		backgroundColor: colors.white,
		paddingTop: screenHeight * 0.05,
	},
	enterStudentNameText: {
		paddingLeft: screenWidth * 0.05,
		flex: 0.5,
		alignSelf: 'flex-start',
	},
	studentNameTextInput: {
		marginLeft: screenWidth * 0.02,
		paddingLeft: screenWidth * 0.03,
		width: screenWidth * 0.95,
		backgroundColor: colors.veryLightGrey,
		height: screenHeight * 0.06,
		borderRadius: 1,
	},
	doneButton: {
		alignItems: 'center',
		justifyContent: 'center',
		height: screenHeight * 0.125,
	},
	qcviewContainer: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
		width: screenWidth,
		height: screenHeight,
	},
	textBottomMargin: {
		marginBottom: 3,
	},
	studentNameContainer: {
		flex: 0.7,
		alignSelf: 'flex-start',
	},
	profileImageContainer: {
		flex: 1,
	},
	addStudentButton: {
		flex: 2,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
});
