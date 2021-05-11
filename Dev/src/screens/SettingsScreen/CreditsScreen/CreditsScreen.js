// This will be the credits screen where information about any resources used in the app is displayed
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Linking } from 'react-native';
import colors from 'config/colors';
import strings from 'config/strings';
import QcParentScreen from 'screens/QcParentScreen';
import FirebaseFunctions from 'config/FirebaseFunctions';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import fontStyles from 'config/fontStyles';
import styles from './CreditsScreenStyle';

// Declares the functional component
const CreditsScreen = (props) => {
	// The useEffect method is going to be called when the screen is mounted and will set
	// the screen in Firebase Analytics
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Credits Screen', 'CreditsScreen');
	}, []);

	// Renders the UI of the screen
	return (
		<QCView style={screenStyle.container}>
			<ScrollView style={styles.creditsContainer} contentContainerStyle={{}}>
				<Text style={fontStyles.mainTextStyleBlack}>{strings.FirstScreenImageCredits}</Text>
				<Text
					style={fontStyles.mainTextStylePrimaryDark}
					onPress={() => {
						Linking.openURL('https://www.freepik.com/free-photos-vectors/computer');
					}}>
					{strings.AvatarCredits}
				</Text>
			</ScrollView>
		</QCView>
	);
};

// Exports the component
export default CreditsScreen;
