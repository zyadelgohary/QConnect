import React from 'react';
import { View, Image, Text, StyleSheet, ScrollView, FlatList, TouchableHighlight, TouchableOpacity, Alert, Dimensions } from 'react-native';
import colors from 'config/colors';
import { Rating } from 'react-native-elements';
import strings from 'config/strings';
import studentImages from 'config/studentImages';
import QcParentScreen from 'screens/QcParentScreen';
import AssignmentEntryComponent from 'components/AssignmentEntryComponent';
import FirebaseFunctions from 'config/FirebaseFunctions';
import LoadingSpinner from 'components/LoadingSpinner';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import fontStyles from '../../../../config/fontStyles';

class StudentProfileScreen extends QcParentScreen {

  state = {
    studentID: this.props.navigation.state.params.studentID,
    currentClass: this.props.navigation.state.params.currentClass,
    classID: this.props.navigation.state.params.classID,
    currentAssignment: '',
    classStudent: '',
    isDialogVisible: false,
    isLoading: true,
    hasCurrentAssignment: ''
  }

  //Sets the screen for firebase analytics & fetches the correct student from this class
  async componentDidMount() {

    FirebaseFunctions.setCurrentScreen("Student Profile Screen", "StudentProfileScreen");
    const { currentClass, studentID } = this.state;
    const student = await currentClass.students.find((eachStudent) => {
      return eachStudent.ID === studentID;
    });

    this.setState({
      classStudent: student,
      currentAssignment: student.currentAssignment,
      isLoading: false,
      hasCurrentAssignment: student.currentAssignment === 'None' ? false : true
    });

  }

  //method updates the current assignment of the student
  editAssignment(newAssignmentName) {

    if (newAssignmentName.trim() === "") {
      Alert.alert(strings.Whoops, strings.PleaseEnterAnAssignmentName);
    } else {

      const { classID, studentID } = this.state;
      //Updates the local state then pushes to firestore
      this.setState({
        isDialogVisible: false,
        currentAssignment: newAssignmentName,
        hasCurrentAssignment: newAssignmentName === 'None' ? false : true
      });
      FirebaseFunctions.updateStudentCurrentAssignment(classID, studentID, newAssignmentName);
    }

  }

  setDialogueVisible(visible) {
    this.setState({ isDialogVisible: visible })
  }

  getRatingCaption() {
    let caption = strings.GetStarted;

    const { averageRating } = this.state.classStudent;

    if (averageRating > 4) {
      caption = strings.OutStanding
    }
    else if (averageRating >= 3) {
      caption = strings.GreatJob
    }
    else if (averageRating > 0) {
      caption = strings.PracticePerfect
    }

    return caption
  }


  //---------- main UI render ===============================
  render() {
    const { classStudent, isLoading, classID, studentID, hasCurrentAssignment } = this.state;
    const { currentAssignment, assignmentHistory, averageRating, name } = classStudent;

    //If the screen is loading, a spinner will display
    if (isLoading === true) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner isVisible={true} />
        </View>
      )
    }

    return (
      <QCView style={screenStyle.container}>

        <AssignmentEntryComponent
          visible={this.state.isDialogVisible}
          onSubmit={(inputText) =>
            this.editAssignment(inputText)}
          assignment={currentAssignment}
          onCancel={() => this.setDialogueVisible(false)}
        />
        <View style={styles.studentInfoContainer}>

          <View style={styles.profileInfo}>

            <View style={styles.profileInfoTop}>
              <View style={{ width: 100 }}>

              </View>
              <View style={styles.profileInfoTopRight}>
                <Text numberOfLines={1} style={fontStyles.bigTextStyleBlack}>{name.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', height: 25 }}>
                  <Rating readonly={true} startingValue={averageRating} imageSize={25} />
                  <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={fontStyles.bigTextStyleDarkGrey}>{averageRating === 0 ? "" : parseFloat(averageRating).toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={fontStyles.mainTextStylePrimaryDark}>{this.getRatingCaption()}</Text>
              </View>
            </View>

            <View style={styles.profileInfoBottom}>
              <View style={styles.profileInfoTopLeft}>
                <Image
                  style={styles.profilePic}
                  source={studentImages.images[classStudent.profileImageID]} />
              </View>
              <View style={{ flex: 1, flexDirection: 'column', height: 59 }}>
                <Text numberOfLines={1} style={fontStyles.bigTextStyleDarkGrey}>{this.state.currentAssignment.toUpperCase()}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableHighlight
                    onPress={() => { this.setState({ isDialogVisible: true }) }} >
                    <Text style={fontStyles.mainTextStylePrimaryDark}>{strings.EditAssignment}</Text>
                  </TouchableHighlight>

                  {hasCurrentAssignment ? <TouchableHighlight onPress={() =>
                    this.props.navigation.push("EvaluationPage", {
                      classID: classID,
                      studentID: studentID,
                      assignmentName: this.state.currentAssignment,
                      userID: this.props.navigation.state.params.userID,
                      classStudent: classStudent,
                      newAssignment: true,
                      readOnly: false,
                    })} >
                    <View style={{ paddingLeft: Dimensions.get('window').width * 0.02 }}>
                      <Text style={fontStyles.mainTextStylePrimaryDark}>{strings.Grade}</Text>
                    </View>
                  </TouchableHighlight> : <View />}
                </View>
              </View>
            </View>

          </View>

          <ScrollView style={styles.prevAssignments}>

            <FlatList
              data={assignmentHistory}
              keyExtractor={(item, index) => item.name + index}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => this.props.navigation.push("EvaluationPage", {
                  classID: classID,
                  studentID: studentID,
                  classStudent: classStudent,
                  assignmentName: item.name,
                  completionDate: item.completionDate,
                  rating: item.evaluation.rating,
                  notes: item.evaluation.notes,
                  improvementAreas: item.evaluation.improvementAreas,
                  userID: this.props.navigation.state.params.userID,
                  evaluationObject: item.evaluation,
                  evaluationID: item.ID,
                  readOnly: true,
                  newAssignment: false,
                })}>
                  <View style={styles.prevAssignmentCard} key={index}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Text style={fontStyles.mainTextStylePrimaryDark}>{item.completionDate}</Text>
                      </View>
                      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 3 }}>
                        <Text numberOfLines={1} style={fontStyles.bigTextStyleBlack}>{item.name}</Text>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                        <Rating readonly={true} startingValue={item.evaluation.rating} imageSize={17} />
                      </View>
                    </View>
                    {item.evaluation.notes ?
                      <Text numberOfLines={2} style={fontStyles.smallTextStyleBlack}>{strings.NotesColon + item.evaluation.notes}</Text>
                      : <View />
                    }
                    {item.evaluation.improvementAreas && item.evaluation.improvementAreas.length > 0 ?
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-start', height: Dimensions.get('window').height * 0.03 }}>
                        <Text style={fontStyles.smallTextStyleBlack}>{strings.ImprovementAreas}</Text>
                        {item.evaluation.improvementAreas.map((tag) => { return (<Text key={tag} style={styles.corner}>{tag}</Text>) })}
                      </View>
                      : <View />
                    }
                  </View>
                </TouchableOpacity>
              )}
            />
          </ScrollView>
        </View>
      </QCView>
    );
  }
};

//styles for the entire page
const styles = StyleSheet.create({
  ratingDescText: {
    fontSize: 18,
    fontFamily: 'light',
    color: colors.primaryDark
  },
  assignmentTextSmall: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: colors.black,
    paddingTop: 2
  },
  ratingText: {
    fontSize: 24,
    fontFamily: 'Montserrat-Regular',
    color: colors.darkGrey,
    marginLeft: 10,
  },
  container: {
    flexDirection: "column",
    backgroundColor: colors.lightGrey,
    flex: 1
  },
  studentInfoContainer: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
    flex: 1,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    justifyContent: "flex-end"
  },
  profileInfo: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    marginBottom: 10
  },
  nonButtons: {
    flexDirection: 'column'
  },
  corner: {
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    marginRight: 5,
    marginTop: 5,
  },
  profileInfoTop: {
    paddingHorizontal: 10,
    paddingTop: 10,
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
  },
  profileInfoTopLeft: {
    flexDirection: 'column',
    marginLeft: 3,
    marginTop: -66,
    alignItems: 'center',
    width: 100
  },
  profileInfoTopRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingBottom: 5,
  },
  profileInfoBottom: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderBottomColor: colors.grey,
    borderBottomWidth: 1
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    paddingBottom: 10
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevAssignments: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    marginLeft: 7,
    marginRight: 7,


  },
  prevAssignmentCard: {
    flexDirection: 'column',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    height: 90,
    padding: 5,
  },
});

export default StudentProfileScreen;