// This is going to be the StyleSheet for the ShareClassCodeScreenStyle
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';
import fontStyles from 'config/fontStyles';

export default StyleSheet.create({
	topSpacer: {
		height: screenHeight * 0.15,
	},
	classCode: {
		height: screenHeight * 0.2,
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	shareButton: {
		height: screenHeight * 0.1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	addStudentsManually: {
		height: screenHeight * 0.1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	touchableText: {
		height: screenHeight * 0.15,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	italicText: {
		fontStyle: 'italic',
	},
	underLineItalicText: {
		fontStyle: 'italic',
		textDecorationLine: 'underline',
		textDecorationColor: colors.primaryDark,
	},
	doneButton: {
		height: screenHeight * 0.1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	classCodeContainer: {
		flex: 1,
		alignSelf: 'center',
		justifyContent: 'flex-start',
	},
	marginBottom: {
		marginBottom: 10,
	},
	classCodeDescription: {
		...fontStyles.mainTextStyleDarkGrey,
		textAlign: 'center',
		paddingHorizontal: screenWidth * 0.1,
	},
	bottomSpacer: {
		flex: 1,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: screenWidth * 0.01,
	},
});
