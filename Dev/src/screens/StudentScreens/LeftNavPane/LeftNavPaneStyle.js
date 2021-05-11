// This is going to contain the StyleSheet for the LeftNavPane belonging to the student
import { StyleSheet } from 'react-native';
import colors from 'config/colors';
import { screenHeight, screenWidth } from 'config/dimensions';

export default StyleSheet.create({
	modal: {
		backgroundColor: colors.white,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		height: 300,
		width: screenWidth * 0.75,
		borderWidth: screenHeight * 0.003,
		borderRadius: screenHeight * 0.003,
		borderColor: colors.grey,
		shadowColor: colors.darkGrey,
		shadowOffset: { width: 0, height: screenHeight * 0.003 },
		shadowOpacity: 0.8,
		shadowRadius: screenHeight * 0.0045,
		elevation: screenHeight * 0.003,
	},
	CodeInputCell: {
		width: 40,
		height: 40,
		lineHeight: 38,
		fontSize: 24,
		borderWidth: 2,
		borderColor: '#00000030',
		textAlign: 'center',
	},
	OnCellFocus: {
		backgroundColor: '#fff',
    },
    AppTitleContainer: {
        paddingTop: 0.015 * screenHeight,
        paddingBottom: 0.015 * screenHeight,
        paddingLeft: screenWidth * 0.025,
        paddingRight: screenWidth * 0.025,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    WelcomeGirlPic: {
        width: 50,
        height: 100,
        resizeMode: 'contain',
        marginTop: 20,
    },
    classCodeBottomMargin: {
        marginBottom: 20 
    },
    codeInputBottomMargin: {
        marginBottom: 60 
    },
    codeInputBorderWidth: {
        borderWidth: 1.5
    }
});