// This is going to contain the StyleSheet for the AllSettingsScreen
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
	},
	cardStyle: {
		flexDirection: 'row',
		height: screenHeight * 0.055,
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: screenHeight * 0.033,
		fontFamily: 'Montserrat-Regular',
        backgroundColor: colors.white,
        marginTop: screenHeight * 0.03
    },
    rightMargin: {
        marginRight: screenWidth * 0.05
    },
    leftMargin: {
        marginLeft: screenWidth * 0.017
    }
});
