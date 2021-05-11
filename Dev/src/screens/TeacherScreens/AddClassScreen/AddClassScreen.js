// This is going to be the screen where a teacher will be able to add a new class to their classes
import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, Alert } from 'react-native';
import classImages from 'config/classImages';
import QcActionButton from 'components/QcActionButton';
import ImageSelectionModal from 'components/ImageSelectionModal';
import LoadingSpinner from 'components/LoadingSpinner';
import FirebaseFunctions from 'config/FirebaseFunctions';
import strings from 'config/strings';
import TopBanner from 'components/TopBanner';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import styles from './AddClassScreenStyle';

// Creates the functional component
const AddClassScreen = (props) => {
	// Declares the state fields for this screen
	const [className, setClassName] = useState('');
	const [classImageID, setClassImageID] = useState(Math.floor(Math.random() * 10));
	const [modalVisible, setModalVisible] = useState(false);
	const [teacherID, setTeacherID] = useState(props.navigation.state.params.teacherID);
	const [isLoading, setIsLoading] = useState(false);

	// The useEffect method acts as a componentDidMount and gets called when the component is mounted first. It will
	// set the screen in Firebase Analytics
	useEffect(() => {
		FirebaseFunctions.setCurrentScreen('Add Class', 'AddClassScreen');
	}, []);

	// This method is going to add a new class based on the teacher's entered information to Cloud Firestore
	const addNewClass = async () => {
		setIsLoading(true);
		console.log(1);
		if (className.trim().length === 0) {
			Alert.alert(strings.Whoops, strings.PleaseMakeSureAllFieldsAreFilledOut);
			setIsLoading(false);
			return;
		}
		const newClassID = await FirebaseFunctions.call('createClass', {
			classImageID,
			className,
			teacherID,
		});
		const newClass = await FirebaseFunctions.call('getClassByID', {
			classID: newClassID,
		});
		props.navigation.push('ShareClassCode', {
			classInviteCode: newClass.classInviteCode,
			classID: newClassID,
			teacherID,
			currentClass: newClass,
		});
	};

	// Renders the UI of the screen
	if (isLoading === true) {
		return (
			<View style={styles.loadingScreen}>
				<LoadingSpinner isVisible={true} />
			</View>
		);
	}

	return (
		<QCView style={screenStyle.container}>
			<View style={styles.flexOne}>
				<TopBanner
					LeftIconName='angle-left'
					LeftOnPress={() => props.navigation.goBack()}
					Title={strings.AddNewClass}
				/>

				<ImageSelectionModal
					visible={modalVisible}
					images={classImages.images}
					cancelText={strings.Cancel}
					setModalVisible={(visible) => {
						setModalVisible(visible);
					}}
					onImageSelected={(imageId) => {
						setClassImageID(imageId);
						setModalVisible(false);
					}}
				/>

				<View style={styles.picContainer}>
					<Image
						style={styles.profilePic}
						source={classImages.images[classImageID]}
						ResizeMode='contain'
					/>
					<TouchableText text={strings.EditClassImage} onPress={() => setModalVisible(true)} />
				</View>

				<View style={styles.bottomContainer}>
					<TextInput
						style={styles.textInputStyle}
						autoCorrect={false}
						placeholder={strings.WriteClassNameHere}
						onChangeText={(classInput) => setClassName(classInput)}
					/>

					<QcActionButton
						disabled={isLoading}
						text={strings.AddClass}
						onPress={() => {
							addNewClass();
						}}
					/>
				</View>
			</View>
		</QCView>
	);
};

// Exports the component
export default AddClassScreen;
