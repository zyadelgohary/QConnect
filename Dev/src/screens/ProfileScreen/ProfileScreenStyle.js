// This is going to be the stylesheet for the profile screen for both teachers and students
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
		flex: 1,
	},
	qcviewContainer: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
		width: screenWidth,
		height: screenHeight,
	},
	picContainer: {
		paddingTop: screenHeight * 0.04,
		alignItems: 'center',
		paddingBottom: screenHeight * 0.03,
		marginTop: screenHeight * 0.015,
		marginBottom: screenHeight * 0.015,
		backgroundColor: colors.white,
	},
	profilePic: {
		width: screenHeight * 0.1,
		height: screenHeight * 0.1,
		borderRadius: screenHeight * 0.1,
		marginBottom: screenHeight * 0.01,
	},
	cardStyle: {
		flexDirection: 'row',
		marginRight: screenWidth * 0.017,
		height: screenHeight * 0.07,
		alignItems: 'center',
		justifyContent: 'center',
		justifyContent: 'space-between',
		fontFamily: 'Montserrat-Regular',
		backgroundColor: colors.white,
	},
	buttonsContainer: {
		paddingVertical: screenHeight * 0.015,
		alignItems: 'center',
		justifyContent: 'space-evenly',
		flexDirection: 'row',
		marginTop: screenHeight * 0.015,
		backgroundColor: colors.white,
	},
});
