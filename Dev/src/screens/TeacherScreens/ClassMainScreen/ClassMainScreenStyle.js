// This file will be the StyleSheet for the ClassMainScreen file
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
		flex: 3,
	},
	AddStudentButton: {
		height: screenHeight * 0.04,
		alignItems: 'flex-end',
		paddingRight: screenWidth * 0.025,
	},
	loadingSpinner: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	topBannerContainer: {
		flex: 1,
		width: screenWidth,
	},
	noClassNoStudentsContainer: {
		alignItems: 'center',
		justifyContent: 'flex-start',
		alignSelf: 'center',
		flex: 2,
	},
	noClassNoStudentsImage: {
		width: 0.73 * screenWidth,
		height: 0.22 * screenHeight,
		resizeMode: 'contain',
	},
	addStudentsTouchableText: {
		paddingTop: 10,
	},
	sectionTitle: {
		alignItems: 'center',
		marginLeft: screenWidth * 0.017,
		flexDirection: 'row',
		paddingTop: screenHeight * 0.025,
	},
	sectionTitleTextStyle: {
		marginLeft: screenWidth * 0.017,
	},
});
