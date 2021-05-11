// This is going to be the StyleSheet for the AddClassScreen
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	loadingScreen: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	picContainer: {
		paddingVertical: screenHeight * 0.033,
		alignItems: 'center',
		marginVertical: screenHeight * 0.015,
		backgroundColor: colors.white,
	},
	profilePic: {
		width: screenHeight * 0.1,
		height: screenHeight * 0.1,
		borderRadius: (screenHeight * 0.1) / 2,
		marginBottom: screenHeight * 0.01,
	},
	bottomContainer: {
		paddingTop: screenHeight * 0.022,
		flex: 1,
		backgroundColor: colors.white,
		alignItems: 'center',
		flex: 1,
	},
	textInputStyle: {
		marginLeft: screenWidth * 0.02,
		marginTop: screenHeight * 0.01,
		paddingVertical: screenHeight * 0.01,
		paddingLeft: screenWidth * 0.03,
		width: screenWidth * 0.95,
		backgroundColor: colors.veryLightGrey,
		borderRadius: 1,
    },
    flexOne: {
        flex: 1
    }
});
