// This will be the screen that can be accessed in order to share the class code with students. A touchable
// text will also be available if the teacher wants to create a manual student. This screen will be accessed
// from clicking the "+" sign once the ClassMainScreen is editable, when a new class is created, and when
// the teacher first signs up for the app.
import React, { useState, useEffect } from 'react';
import { View, Text, Share, TouchableOpacity } from 'react-native';
import fontStyles from 'config/fontStyles';
import screenStyle from 'config/screenStyle';
import { screenHeight, screenWidth } from 'config/dimensions';
import strings from 'config/strings';
import QcActionButton from 'components/QcActionButton';
import FirebaseFunctions from 'config/FirebaseFunctions';
import QCView from 'components/QCView';
import colors from 'config/colors';
import { Icon } from 'react-native-elements';
import styles from './ShareClassCodeScreenStyle';

// Creates the functional component
const ShareClassCodeScreen = (props) => {
	// Fetches all the correct fields from the props
	const { classInviteCode, classID, currentClass, teacherID } = props.navigation.state.params;

	// Renders the UI of the screen
	return (
		<QCView style={screenStyle.container}>
			<View style={styles.topSpacer}>
				<Icon name='mortar-board' type='octicon' color={colors.grey} size={screenHeight * 0.15} />
			</View>
			<View style={styles.classCode}>
				<View style={styles.classCodeContainer}>
					<Text style={[fontStyles.bigTextStyleBlack, styles.marginBottom]}>
						{strings.YourClassCode}
					</Text>
				</View>
				<View style={styles.classCodeContainer}>
					<Text
						style={{
							...fontStyles.hugeTextStylePrimaryDark,
							textAlign: 'center',
							fontFamily: 'Courier-Bold',
						}}>
						{classInviteCode.replace('0', '\u00D8')}
					</Text>
					<View style={styles.marginBottom} />
					<Text style={styles.classCodeDescription}>{strings.ClassCodeDescription}</Text>
				</View>
				<View style={styles.bottomSpacer} />
			</View>

			<View style={styles.shareButton}>
				<QcActionButton
					text={strings.ShareCode}
					onPress={() => {
						FirebaseFunctions.logEvent('TEACHER_SHARE_CLASS_CODE');
						Share.share({
							message:
								strings.JoinMyClass +
								classInviteCode +
								('\niOS: ' +
									'https://apps.apple.com/us/app/quran-connect/id1459057386' +
									'\nAndroid: ' +
									'https://play.google.com/store/apps/details?id=com.yungdevz.quranconnect'),
						});
					}}
				/>
			</View>
			<View style={styles.addStudentsManually}>
				<TouchableOpacity
					style={styles.touchableText}
					onPress={() => {
						props.navigation.push('AddManualStudents', {
							teacherID,
							classID,
							currentClass,
						});
					}}>
					<Text style={[fontStyles.bigTextStylePrimaryDark, styles.italicText]}>{strings.Or}</Text>
					<Text style={[fontStyles.bigTextStylePrimaryDark, styles.underLineItalicText]}>
						{strings.AddStudentsManually}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.doneButton}>
				<QcActionButton
					text={strings.Done}
					onPress={() =>
						props.navigation.push('TeacherCurrentClass', {
							teacherID,
							classID,
						})
					}
				/>
			</View>
		</QCView>
	);
};

// Exports the component
export default ShareClassCodeScreen;
