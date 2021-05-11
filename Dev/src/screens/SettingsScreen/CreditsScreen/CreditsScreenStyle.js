// This is going to contain the StyleSheet for the credits screen
import { StyleSheet } from 'react-native';
import { screenWidth, screenHeight } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: colors.lightGrey,
        flex: 1,
        alignItems: 'center',
    },
    creditsContainer: {
        flexDirection: 'column',
        width: screenWidth * 0.9,
        backgroundColor: colors.white,
        borderRadius: screenHeight * 0.03,
        paddingLeft: screenWidth * 0.036,
        paddingRight: screenWidth * 0.036,
        paddingTop: screenHeight * 0.022,
        paddingBottom: screenHeight * 0.022,
        marginLeft: screenWidth * 0.05,
        marginRight: screenWidth * 0.05,
        marginTop: screenHeight * 0.03,
        marginBottom: screenHeight * 0.03
    }
})