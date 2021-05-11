import React from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
  FlatList
} from "react-native";
import colors from "config/colors";
import FontLoadingComponent from "./FontLoadingComponent";
import fontStyles from "config/fontStyles";
import { screenHeight, screenWidth } from "config/dimensions";
import { ListItem } from "react-native-elements";
import strings from 'config/strings';
import { Avatar, Icon } from "react-native-elements";

/*Class represents the student card that will show up in the list of students
 *from the teachers view.
 *Each card will have a student name, a profile picture for the student, and the student's
 *current assignment.
 *The card will also be able to be pressed which controls the color of the card (Student Status)
 */
export default class StudentMultiAssignmentsCard extends FontLoadingComponent {
  render() {
    //The properties of the component.
    const {
      studentName,
      profilePic,
      currentAssignments,
      background,
      onPress,
      comp,
      compOnPress,
      status
    } = this.props;

    let assignmentTypes = [];
    assignmentTypes['memorization'] = {
      color: colors.darkGreen,
      iconName: 'brain',
      iconType: 'material-community',
      name: strings.Memorize
    };

    assignmentTypes['read'] = {
      color: colors.magenta,
      iconName: 'book-open',
      iconType: 'feather',
      name: strings.Read
    };

    assignmentTypes['revision'] = {
      color: colors.blue,
      iconName: 'redo',
      iconType: 'evilicon',
      name: strings.Review
    };

    return (
      //The style of the card as a whole. Inside the card, you have the image,
      //student name, and student assignment
      <TouchableOpacity
        style={[styles.cardStyle, { backgroundColor: colors.white }]}
        borderColor={colors.black}
        //The on press function is for when the teacher clicks the card, the color of it
        //should change depending on the behavior (i.e attendance screen)
        onPress={() => {
          onPress();
        }}
      >
        <View style={styles.infoStyle}>
          <View
            style={{ flexDirection: 'row', marginTop: 10, marginBottom: 3 }}
          >
            <ListItem
              key={studentName}
              title={studentName}
              titleStyle={[fontStyles.mediumTextStyleDarkestGrey, { flex: 1 }]}
              chevron
              containerStyle={{
                flex: 1,
                borderRadius: 2,
                marginLeft: 3,
                width: screenWidth * 0.95
              }}
              contentContainerStyle={{
                flex: 2
              }}
              leftAvatar={{ source: profilePic, size: "medium" }}
              //convert status to shorter strings to fit in the single line ListItem
              rightTitle={strings.GoToProfile}
              rightTitleStyle={[fontStyles.smallestTextStyleDarkGrey]}
            />
          </View>
          {currentAssignments.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                paddingLeft: 18,
                paddingBottom: 10,
              }}
            >
              <Text style={[fontStyles.mainTextStyleDarkGrey]}>
                {currentAssignments.length === 1
                  ? strings.CurrentAssignment + ":"
                  : strings.CurrentAssignments + ":"}
              </Text>
            </View>
          )}
          {currentAssignments.length > 0 ? (
            currentAssignments.map((assignment, index) => (
              <TouchableOpacity
                onPress={() => this.props.onAssignmentPress(assignment.assignmentID)}
              >
                <ListItem
                  key={assignment.name}
                  title={assignment.name}
                  titleStyle={[
                    fontStyles.mediumTextStyleDarkestGrey,
                    { flex: 1 },
                  ]}
                  subtitle={
                    assignment.status === "NEED_HELP"
                      ? strings.NeedHelpNonCap
                      : assignment.status === "READY"
                      ? strings.ReadyNonCap
                      : assignment.status === "WORKING_ON_IT"
                      ? strings.WorkingOnItNonCap
                      : undefined
                  }
                  subtitleStyle={[
                    fontStyles.smallTextStyleDarkGrey,
                    assignment.status === "NEED_HELP"
                      ? { color: colors.darkRed }
                      : assignment.status === "READY"
                      ? { color: colors.darkGreen }
                      : assignment.status === "WORKING_ON_IT"
                      ? { color: colors.primaryDark }
                      : {}
                  ]}
                  chevron={assignment.submission ? false : true}
                  containerStyle={{
                    flex: 1,
                    width: screenWidth * 0.95,
                    borderRadius: 2,
                    marginLeft: 3,
                  }}
                  contentContainerStyle={{
                    flex: 1
                  }}
                  badge={
                    assignment.submission
                      ? {
                          badgeStyle: {
                            backgroundColor: 'rgba(255,255,250,0.1)'
                          },
                          value: (
                            <View
                              style={{
                                position: "absolute",
                                zIndex: 10,
                                bottom: 0,
                                right: 0
                              }}
                            >
                              <Icon
                                size={15}
                                name="microphone"
                                type="material-community"
                                color={colors.darkRed}
                              />
                            </View>
                          )
                        }
                      : undefined
                  }
                  leftElement={
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 40,
                      }}
                    >
                      <Avatar
                        rounded
                        icon={{
                          name: assignmentTypes[assignment.type].iconName,
                          type: assignmentTypes[assignment.type].iconType,
                          color: colors.white,
                        }}
                        overlayContainerStyle={{
                          backgroundColor:
                            assignmentTypes[assignment.type].color,
                        }}
                      />
                      <Text
                        style={[
                          fontStyles.smallestTextStyleDarkGrey,
                          { width: 45, textAlign: 'center', paddingTop: 3 },
                        ]}
                      >
                        {assignmentTypes[assignment.type].name}
                      </Text>
                    </View>
                  }
                  //convert status to shorter strings to fit in the single line ListItem
                  rightTitle="Open"
                  rightTitleStyle={[
                    fontStyles.smallestTextStyleDarkGrey,
                    { width: 25 }
                  ]}
                  bottomDivider={
                    index !== currentAssignments.length - 1 ? true : false
                  }
                  topDivider={index === 0 ? true : false}
                />
              </TouchableOpacity>
            ))
          ) : (
            <ListItem
              key="NewAssignment"
              // title={strings.NeedAssignment}
              // titleStyle={[fontStyles.mediumTextStyleDarkestGrey, { flex: 1 }]}
              chevron
              containerStyle={{
                flex: 1,
                borderRadius: 2,
                marginLeft: 3,
                width: screenWidth * 0.8
              }}
              contentContainerStyle={{
                flex: 2
              }}
              //convert status to shorter strings to fit in the single line ListItem
              title={strings.AddAssignment}
              titleStyle={fontStyles.smallTextStyleDarkGrey}
              onPress={() => this.props.onAssignmentPress(-1)}
            />
          )}
        </View>
        {comp ? (
          <View style={styles.removeStudentStyle}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: screenHeight * 0.2,
                width: screenWidth * 0.2,
              }}
              onPress={() => {
                compOnPress();
              }}
            >
              {comp}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.removeStudentStyle} />
        )}
      </TouchableOpacity>
    );
  }
}

/*
 *Makes sure properties that are passed into component are valid. The student name must be a string,
 *the source of the image must be a number, the current assignment is also a string, and the onPress
 *must be a function
 */
StudentMultiAssignmentsCard.propTypes = {
  studentName: PropTypes.string.isRequired,
  profilePic: PropTypes.number.isRequired,
  currentAssignments: PropTypes.array,
  onPress: PropTypes.func.isRequired
};

//Styles that control the look of the card, and everything within it
const styles = StyleSheet.create({
  cardStyle: {
    flexDirection: "row",
    marginRight: screenWidth * 0.017,
    minHeight: screenHeight * 0.112,
    alignItems: "center",
    marginLeft: screenWidth * 0.017,
    marginTop: screenHeight * 0.01,
    fontFamily: "Montserrat-Regular",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  removeStudentStyle: {
    flexDirection: "row",
    justifyContent: "center",
    marginRight: screenWidth * 0.05,
    flex: 1,
  },
  infoStyle: {
    flexDirection: "column",
    justifyContent: "center",
    fontFamily: "Montserrat-Regular",
    flex: 4,
  },
  profilePicStyle: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    borderRadius: screenWidth * 0.06,
    marginLeft: screenWidth * 0.05,
  }
});
