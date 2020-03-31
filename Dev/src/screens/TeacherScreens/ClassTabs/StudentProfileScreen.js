import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
} from "react-native";
import colors from "config/colors";
import QcActionButton from "components/QcActionButton";
import { Rating } from "react-native-elements";
import strings from "config/strings";
import studentImages from "config/studentImages";
import QcParentScreen from "screens/QcParentScreen";
import FirebaseFunctions from "config/FirebaseFunctions";
import LoadingSpinner from "components/LoadingSpinner";
import QCView from "components/QCView";
import screenStyle from "config/screenStyle";
import fontStyles from "config/fontStyles";
import { screenHeight, screenWidth } from "config/dimensions";
import { LineChart } from "react-native-chart-kit";
import { Icon } from "react-native-elements";

class StudentProfileScreen extends QcParentScreen {
  state = {
    studentID: this.props.navigation.state.params.studentID,
    currentClass: this.props.navigation.state.params.currentClass,
    classID: this.props.navigation.state.params.classID,
    currentAssignments: [],
    classStudent: "",
    isDialogVisible: false,
    isLoading: true,
    hasCurrentAssignment: "",
    classesAttended: "",
    classesMissed: ""
  };

  //Sets the screen for firebase analytics & fetches the correct student from this class
  async componentDidMount() {
    FirebaseFunctions.setCurrentScreen(
      "Student Profile Screen",
      "StudentProfileScreen"
    );
    const { currentClass, studentID } = this.state;
    const student = await currentClass.students.find(eachStudent => {
      return eachStudent.ID === studentID;
    });

    //This constructs an array of the student's past assignments & only includes the "length" field which is how many
    //words that assignment was. The method returns that array which is then passed to the line graph below as the data
    const { assignmentHistory } = student;
    const data = [];
    for (const assignment of assignmentHistory) {
      if (assignment.assignmentLength && assignment.assignmentLength > 0) {
        data.push(assignment);
      }
    }

    this.setState({
      classStudent: student,
      currentAssignments: student.currentAssignments,
      isLoading: false,
      wordsPerAssignmentData: data,
      hasCurrentAssignment:
        student.currentAssignments && student.currentAssignments.length > 0,
      classesAttended: student.classesAttended ? student.classesAttended : "0",
      classesMissed: student.classesMissed ? student.classesMissed : "0"
    });
  }

  setDialogueVisible(visible) {
    this.setState({ isDialogVisible: visible });
  }

  getRatingCaption() {
    let caption = strings.GetStarted;

    const { averageRating } = this.state.classStudent;

    if (averageRating > 4) {
      caption = strings.OutStanding;
    } else if (averageRating >= 3) {
      caption = strings.GreatJob;
    } else if (averageRating > 0) {
      caption = strings.PracticePerfect;
    }

    return caption;
  }

  updateStateWithNewAssignmentInfo(newAssignment, index, currentClass) {
    let updatedStudentInfo = this.state.classStudent;
    if (
      !updatedStudentInfo.currentAssignments ||
      updatedStudentInfo.currentAssignments.length === 0 ||
      updatedStudentInfo.currentAssignments[index] === undefined
    ) {
      updatedStudentInfo = [newAssignment];
    } else {
      updatedStudentInfo.currentAssignments[index] = newAssignment;
    }

    this.setState({
      classStudent: updatedStudentInfo,
      currentClass: currentClass,
      currentAssignments: updatedStudentInfo.currentAssignments,
    });
  }

  //This function is going to return the labels for the graph which will be an array of 5 dates for when the assignments
  //were completed
  getDataLabels() {
    //If the amount of data is 5 or less, then the array returned will just be their completion dates, otherwise,
    //a label will be collected for each 5th of the data
    const { wordsPerAssignmentData } = this.state;
    if (wordsPerAssignmentData.length <= 5) {
      return wordsPerAssignmentData.map(data =>
        data.completionDate.substring(0, data.completionDate.lastIndexOf("/"))
      );
    } else {
      const increment = wordsPerAssignmentData.length % 5;
      const labels = [];
      for (let i = 0; i < wordsPerAssignmentData.length; i += increment) {
        let index = "";
        if (i >= wordsPerAssignmentData.length) {
          index = wordsPerAssignmentData.length - 1;
        } else {
          index = i;
        }
        labels.push(
          wordsPerAssignmentData[index].completionDate.substring(
            0,
            wordsPerAssignmentData[index].completionDate.lastIndexOf("/")
          )
        );
      }
      return labels;
    }
  }

  renderAssignmentsSectionHeader(label, iconName) {
    return (
      <View
        style={{
          alignItems: 'center',
          marginLeft: screenWidth * 0.017,
          flexDirection: 'row',
          paddingTop: screenHeight * 0.007,
          paddingBottom: screenHeight * 0.019,
        }}
      >
        <Icon
          name={iconName}
          type="material-community"
          color={colors.darkGrey}
        />
        <Text
          style={[
            { marginLeft: screenWidth * 0.017 },
            fontStyles.mainTextStyleDarkGrey,
          ]}
        >
          {label.toUpperCase()}
        </Text>
      </View>
    );
  }

  //renders a past assignment info card
  renderHistoryItem(item, index, thisClassInfo) {
    return (
      <TouchableOpacity
        onPress={() => {
          //To-Do: Navigates to more specific evaluation for this assignment
          this.props.navigation.push('EvaluationPage', {
            classID: this.state.currentClassID,
            studentID: this.state.userID,
            classStudent: thisClassInfo,
            assignmentName: item.name,
            completionDate: item.completionDate,
            rating: item.evaluation.rating,
            notes: item.evaluation.notes,
            improvementAreas: item.evaluation.improvementAreas,
            userID: this.state.userID,
            evaluationObject: item.evaluation,
            submission: item.submission,
            isStudentSide: true,
            evaluationID: item.ID,
            readOnly: true,
            newAssignment: false,
          });
        }}
      >
        <View style={styles.prevAssignmentCard} key={index}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View
              style={{
                flex: 3,
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}
            >
              <Text style={fontStyles.mainTextStylePrimaryDark}>
                {item.completionDate}
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 3,
              }}
            >
              <Text
                numberOfLines={1}
                style={[
                  fontStyles.mainTextStyleBlack,
                  {
                    color:
                      item.assignmentType === strings.Reading ||
                      item.assignmentType === strings.Read
                        ? colors.grey
                        : item.assignmentType === strings.Memorization ||
                          item.assignmentType === strings.Memorize ||
                          item.assignmentType == null
                        ? colors.darkGreen
                        : colors.darkishGrey,
                  },
                ]}
              >
                {item.assignmentType ? item.assignmentType : strings.Memorize}
              </Text>
            </View>
            <View
              style={{
                flex: 3,
                justifyContent: 'center',
                alignItems: 'flex-end'
              }}
            >
              <Rating
                readonly={true}
                startingValue={item.evaluation.rating}
                imageSize={17}
              />
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text numberOfLines={1} style={fontStyles.bigTextStyleBlack}>
              {item.name}
            </Text>
          </View>
          {item.evaluation.notes ? (
            <Text numberOfLines={2} style={fontStyles.smallTextStyleDarkGrey}>
              {'Notes: ' + item.evaluation.notes}
            </Text>
          ) : (
            <View />
          )}
          {item.evaluation.improvementAreas &&
          item.evaluation.improvementAreas.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                height: screenHeight * 0.03,
              }}
            >
              <Text style={fontStyles.smallTextStyleDarkGrey}>
                {strings.ImprovementAreas}
              </Text>
              {item.evaluation.improvementAreas.map((tag, cnt) => {
                return (
                  <Text key={tag}>
                    {cnt > 0 ? ', ' : ''}
                    {tag}
                  </Text>
                );
              })}
            </View>
          ) : (
            <View />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  //---------- main UI render ===============================
  render() {
    const {
      classStudent,
      isLoading,
      classID,
      studentID,
      currentClass,
      currentAssignments,
      classesAttended,
      classesMissed,
      wordsPerAssignmentData
    } = this.state;
    let { assignmentHistory, averageRating, name } = classStudent;

    //If the screen is loading, a spinner will display
    if (isLoading === true) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LoadingSpinner isVisible={true} />
        </View>
      );
    }

    //Sorts the assignments by date completed
    if (classStudent) {
      assignmentHistory = assignmentHistory.reverse();
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView containerStyle={styles.studentInfoContainer}>
          <View style={styles.profileInfo}>
            <View style={styles.profileInfoTop}>
              <View style={{ width: screenWidth * 0.24 }} />
              <View style={styles.profileInfoTopRight}>
                <Text numberOfLines={1} style={fontStyles.bigTextStyleBlack}>
                  {name.toUpperCase()}
                </Text>
                <View
                  style={{ flexDirection: "row", height: 0.037 * screenHeight }}
                >
                  <Rating
                    readonly={true}
                    startingValue={averageRating}
                    imageSize={25}
                  />
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={fontStyles.bigTextStyleDarkGrey}>
                      {averageRating === 0
                        ? ""
                        : parseFloat(averageRating).toFixed(1)}
                    </Text>
                  </View>
                </View>
                <Text style={fontStyles.mainTextStylePrimaryDark}>
                  {this.getRatingCaption()}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginRight: screenWidth * 0.02,
                marginHorizontal: screenHeight * 0.05,
              }}
            >
              <TouchableHighlight
                onPress={() => {
                  this.props.navigation.push('MushafAssignmentScreen', {
                    newAssignment: true,
                    popOnClose: true,
                    isTeacher: true,
                    assignToAllClass: false,
                    userID: this.props.navigation.state.params.userID,
                    classID,
                    studentID,
                    currentClass,
                    assignmentIndex: classStudent.currentAssignments
                      ? classStudent.currentAssignments.length
                      : undefined,
                    imageID: classStudent.profileImageID,
                    onSaveAssignment: this.updateStateWithNewAssignmentInfo.bind(
                      this
                    )
                  });
                }}
              >
                <Text style={fontStyles.bigTextStylePrimaryDark}>
                  {strings.AddAssignment}
                </Text>
              </TouchableHighlight>
            </View>
            <View style={styles.profileInfoBottom}>
              <View style={styles.profileInfoTopLeft}>
                <Image
                  style={styles.profilePic}
                  source={studentImages.images[classStudent.profileImageID]}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  paddingTop: 20,
                  justifyContent: "flex-start"
                }}
              >
                <Text
                  style={[
                    fontStyles.smallTextStyleBlack,
                    { paddingHorizontal: 10 }
                  ]}
                >
                  Classes attended: {classesAttended}
                </Text>
                <Text style={fontStyles.smallTextStyleBlack}>
                  Classes missed: {classesMissed}
                </Text>
              </View>
            </View>
          </View>
          {(currentAssignments === undefined ||
            currentAssignments.length === 0) &&
          (assignmentHistory === undefined ||
            assignmentHistory.length === 0) ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'flex-start',
                alignSelf: 'center',
                flex: 2,
              }}
            >
             <Text style={fontStyles.hugeTextStylePrimaryDark}>
                {strings.NoClass}
              </Text>
              
              <Image
                source={require('assets/emptyStateIdeas/welcome-girl.png')}
                style={{
                  width: 0.73 * screenWidth,
                  height: 0.22 * screenHeight,
                  resizeMode: 'contain'
                }}
              />
             
              <QcActionButton
                text={strings.AddAssignment}
                onPress={() => {
                  this.props.navigation.push('MushafAssignmentScreen', {
                    newAssignment: true,
                    popOnClose: true,
                    isTeacher: true,
                    assignToAllClass: false,
                    userID: this.props.navigation.state.params.userID,
                    classID,
                    studentID,
                    currentClass,
                    assignmentIndex: classStudent.currentAssignments
                      ? classStudent.currentAssignments.length
                      : undefined,
                    imageID: classStudent.profileImageID,
                    onSaveAssignment: this.updateStateWithNewAssignmentInfo.bind(
                      this
                    )
                  });
                }}
              />
            </View>
          ) : (
            <View />
          )}
          {wordsPerAssignmentData.length > 0 ? (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={fontStyles.bigTextStyleBlack}>
                {strings.WordsPerAssignment}
              </Text>
              <View style={{ height: screenHeight * 0.0075 }} />
              <LineChart
                data={{
                  labels:
                    wordsPerAssignmentData.length > 1
                      ? [
                          wordsPerAssignmentData[0].completionDate.substring(
                            0,
                            wordsPerAssignmentData[0].completionDate.lastIndexOf(
                              "/"
                            )
                          ),
                          wordsPerAssignmentData[
                            wordsPerAssignmentData.length - 1
                          ].completionDate.substring(
                            0,
                            wordsPerAssignmentData[
                              wordsPerAssignmentData.length - 1
                            ].completionDate.lastIndexOf("/")
                          ),
                        ]
                      : [
                          wordsPerAssignmentData[0].completionDate.substring(
                            0,
                            wordsPerAssignmentData[0].completionDate.lastIndexOf(
                              "/"
                            )
                          ),
                        ],
                  datasets: [
                    {
                      data: wordsPerAssignmentData.map(
                        data => data.assignmentLength
                      ),
                    },
                  ],
                }}
                fromZero={true}
                withInnerLines={false}
                chartConfig={{
                  backgroundColor: colors.primaryDark,
                  backgroundGradientFrom: colors.lightGrey,
                  backgroundGradientTo: colors.primaryDark,
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primaryDark,
                  labelColor: (opacity = 1) => colors.black,
                  style: {
                    borderRadius: 16,
                  },
                }}
                width={screenWidth}
                height={220}
              />
            </View>
          ) : (
            <View />
          )}
          {this.state.classStudent.currentAssignments &&
          this.state.classStudent.currentAssignments.length > 0 ? (
            this.renderAssignmentsSectionHeader(
              strings.CurrentAssignments,
              "book-open-outline"
            )
          ) : (
            <View />
          )}
          <FlatList
            style={{ flexGrow: 0 }}
            extraData={
              currentAssignments
                ? currentAssignments.map(value => value.name)
                : []
            }
            data={currentAssignments}
            keyExtractor={(item, index) =>
              item.name + index + Math.random() * 10
            }
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.currentAssignment,
                  {
                    backgroundColor:
                      item.isReadyEnum === "WORKING_ON_IT"
                        ? colors.workingOnItColorBrown
                        : item.isReadyEnum === "READY"
                        ? colors.green
                        : item.isReadyEnum === "NOT_STARTED"
                        ? colors.primaryVeryLight
                        : colors.red,
                  },
                ]}
              >
                <View style={styles.middleView}>
                  <Text style={fontStyles.bigTextStyleBlack}>
                    {item.type ? item.type : strings.Memorize}
                  </Text>
                  <Text
                    style={[
                      fontStyles.bigTextStyleBlack,
                      { paddingTop: screenHeight * 0.04 }
                    ]}
                  >
                    {item.name.toUpperCase()}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    paddingLeft: screenWidth * 0.02,
                    justifyContent: "space-between"
                  }}
                >
                  <Text style={fontStyles.mainTextStylePrimaryDark}>
                    {item.isReadyEnum === "READY" && strings.Ready}
                    {item.isReadyEnum === "WORKING_ON_IT" &&
                      strings.WorkingOnIt}
                    {item.isReadyEnum === "NOT_STARTED" && strings.NotStarted}
                    {item.isReadyEnum === "NEED_HELP" && strings.NeedHelp}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingRight: screenWidth * 0.02,
                      justifyContent: "space-between"
                    }}
                  >
                    <TouchableHighlight
                      onPress={() => {
                        this.props.navigation.push('MushafAssignmentScreen', {
                          popOnClose: true,
                          isTeacher: true,
                          assignToAllClass: false,
                          userID: this.props.navigation.state.params.userID,
                          classID,
                          studentID,
                          currentClass,
                          assignmentLocation: item.location,
                          assignmentType: item.type,
                          assignmentName: item.name,
                          assignmentIndex: index,
                          imageID: classStudent.profileImageID,
                          onSaveAssignment: this.updateStateWithNewAssignmentInfo.bind(
                            this
                          )
                        });
                      }}
                    >
                      <Text style={fontStyles.mainTextStylePrimaryDark}>
                        {strings.EditAssignment}
                      </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      onPress={() => {
                        this.props.navigation.push("EvaluationPage", {
                          classID: classID,
                          studentID: studentID,
                          assignmentName: item.name,
                          userID: this.props.navigation.state.params.userID,
                          classStudent: classStudent,
                          assignmentLocation: item.location,
                          assignmentLength: item.location.length,
                          assignmentType: item.type,
                          submission: item.submission,
                          newAssignment: true,
                          readOnly: false
                        });
                      }}
                    >
                      <View style={{ paddingLeft: screenWidth * 0.02 }}>
                        <Text style={fontStyles.mainTextStylePrimaryDark}>
                          {strings.Grade}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            )}
          />
          <ScrollView>
            {assignmentHistory &&
              assignmentHistory.length > 0 &&
              this.renderAssignmentsSectionHeader(
                strings.PastAssignments,
                "history"
              )}
            <FlatList
              data={assignmentHistory}
              keyExtractor={(item, index) => item.name + index}
              renderItem={({ item, index }) => {
                return this.renderHistoryItem(item, index, currentClass);
              }}
            />
          </ScrollView>
        </ScrollView>
      </View>
    );
  }
}

//styles for the entire page
const styles = StyleSheet.create({
  studentInfoContainer: {
    marginVertical: 0.005 * screenHeight,
    backgroundColor: colors.white,
    flex: 1,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    justifyContent: "flex-end"
  },
  currentAssignment: {
    height: 150,
    borderWidth: 0.5,
    borderColor: colors.grey,
    marginBottom: 5,
  },
  middleView: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: screenHeight * 0.0112,
  },
  profileInfo: {
    flexDirection: "column",
    backgroundColor: colors.white,
    marginBottom: 0.001 * screenHeight,
    paddingBottom: screenHeight * 0.01,
  },
  corner: {
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderRadius: screenHeight * 0.004,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.012,
    marginRight: screenHeight * 0.012,
    marginVertical: screenHeight * 0.004,
  },
  profileInfoTop: {
    paddingHorizontal: screenWidth * 0.024,
    paddingTop: screenHeight * 0.015,
    flexDirection: "row"
  },
  profileInfoTopLeft: {
    flexDirection: "column",
    marginLeft: 0.007 * screenWidth,
    marginTop: -0.097 * screenHeight,
    alignItems: "center",
    width: 0.24 * screenWidth,
  },
  profileInfoTopRight: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: screenWidth * 0.05,
    paddingBottom: 0.007 * screenHeight,
  },
  profileInfoBottom: {
    flexDirection: "column",
    paddingHorizontal: 0.024 * screenWidth,
    paddingBottom: screenHeight * 0.02,
    borderBottomColor: colors.grey,
    borderBottomWidth: 1,
  },
  profilePic: {
    width: 0.1 * screenHeight,
    height: 0.1 * screenHeight,
    borderRadius: 0.075 * screenHeight,
    paddingBottom: 0.015 * screenHeight,
  },
  prevAssignments: {
    flexDirection: "column",
    backgroundColor: colors.white,
    marginHorizontal: 0.017 * screenWidth,
  },
  prevAssignmentCard: {
    flexDirection: "column",
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    paddingHorizontal: screenWidth * 0.007,
    paddingVertical: screenHeight * 0.005,
  },
});

export default StudentProfileScreen;
