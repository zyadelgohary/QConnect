//Screen which will provide all of the possible settings for the user to click on
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import colors from 'config/colors';
import { Icon } from 'react-native-elements';
import strings from 'config/strings';
import FirebaseFunctions from 'config/FirebaseFunctions';
import TeacherLeftNavPane from '../../TeacherScreens/LeftNavPane/LeftNavPane';
import StudentLeftNavPane from '../../StudentScreens/LeftNavPane';
import SideMenu from 'react-native-side-menu';
import QCView from 'components/QCView';
import TopBanner from 'components/TopBanner';
import screenStyle from 'config/screenStyle';
import fontStyles from 'config/fontStyles';
import styles from './AllSettingsScreenStyle';

// Creates the functional component
const AllSettingsScreen = (props) => {
	// Declares the state fields for this screen
	const [isOpen, setIsOpen] = useState(false);

	// The useEffect will get called when the screen is mounted and will set the screen in Firebase Analytics
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('All Settings Screen', 'AllSettingsScreen');
	}, []);

	// To save code redundancy, the next variable is code because it is both present in both the teacher
	// and the student side
	const content = (
		<QCView style={screenStyle.container}>
			<View style={styles.container}>
				<TopBanner
					LeftIconName='navicon'
					LeftOnPress={() => setIsOpen(true)}
					Title={strings.Settings}
				/>
				<TouchableOpacity
					style={styles.cardStyle}
					onPress={() => {
						props.navigation.push('CreditsScreen');
					}}>
					<View style={styles.leftMargin}>
						<Text style={fontStyles.bigTextStyleBlack}>{strings.Credits}</Text>
					</View>
					<Icon
						name='angle-right'
						type='font-awesome'
						iconStyle={styles.rightMargin}
						color={colors.primaryDark}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.cardStyle}
					onPress={() => {
						Linking.openURL(
							'https://app.termly.io/document/privacy-policy/d3e756e4-a763-4095-9ec1-3965b609d015'
						);
					}}>
					<View style={styles.leftMargin}>
						<Text style={fontStyles.bigTextStyleBlack}>{strings.PrivacyPolicy}</Text>
					</View>
					<Icon
						name='angle-right'
						type='font-awesome'
						iconStyle={styles.rightMargin}
						color={colors.primaryDark}
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.cardStyle}
					onPress={async () => {
						await FirebaseFunctions.logOut(props.navigation.state.params.userID);
						props.navigation.push('FirstScreenLoader');
					}}>
					<View style={styles.leftMargin}>
						<Text style={fontStyles.bigTextStyleBlack}>{strings.LogOut}</Text>
					</View>
					<Icon
						name='angle-right'
						type='font-awesome'
						iconStyle={styles.rightMargin}
						color={colors.primaryDark}
					/>
				</TouchableOpacity>
			</View>
		</QCView>
	);

	return props.navigation.state.params.isTeacher ? (
		<SideMenu
			isOpen={isOpen}
			menu={
				<TeacherLeftNavPane
					teacher={props.navigation.state.params.teacher}
					teacherID={props.navigation.state.params.userID}
					classes={props.navigation.state.params.classes}
					edgeHitWidth={0}
					navigation={props.navigation}
				/>
			}>
			{content}
		</SideMenu>
	) : (
		<SideMenu
			isOpen={isOpen}
			menu={
				<StudentLeftNavPane
					student={props.navigation.state.params.student}
					userID={props.navigation.state.params.userID}
					classes={props.navigation.state.params.classes}
					edgeHitWidth={0}
					navigation={props.navigation}
				/>
			}>
			{content}
		</SideMenu>
	);
};

// Exports the component
export default AllSettingsScreen;
