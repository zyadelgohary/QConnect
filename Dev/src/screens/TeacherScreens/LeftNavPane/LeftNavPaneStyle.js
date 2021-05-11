// This is going to be the StyleSheet for the LeftNavPane file
import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from 'config/dimensions';

export default StyleSheet.create({
	container: {
		paddingVertical: 0.015 * screenHeight,
		paddingHorizontal: 0.024 * screenWidth,
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
