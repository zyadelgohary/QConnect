// This is going to be the StyleSheet for the ClassAttendanceScreen
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';
import colors from 'config/colors';

export default StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: colors.lightGrey,
		flex: 1,
	},
	saveAttendance: {
		alignItems: 'center',
		backgroundColor: colors.lightGrey,
		flex: 1,
		width: screenWidth,
	},
	present: {
		paddingLeft: 5,
		paddingRight: 5,
	},
	absent: {
		paddingRight: 5,
	},
	topBannerContainer: {
		flex: 1,
		width: screenWidth,
	},
	emptyClassContainer: {
		flex: 2,
		justifyContent: 'flex-start',
		alignItems: 'center',
		alignSelf: 'center',
	},
	emptyClassImage: {
		width: 0.73 * screenWidth,
		height: 0.22 * screenHeight,
		resizeMode: 'contain',
	},
	saveAttendanceButton: {
		paddingRight: 0.073 * screenWidth,
	},
	attendanceTextContainer: {
		paddingTop: 10,
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	attendanceText: {
		paddingLeft: 5,
		paddingRight: 10,
    },
    presentAbsentText: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    }
});
