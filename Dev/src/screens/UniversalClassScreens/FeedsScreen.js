import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import FirebaseFunctions from '../../../config/FirebaseFunctions';
import colors from '../../../config/colors';
import strings from '../../../config/strings';
import QCView from 'components/QCView';
import SideMenu from 'react-native-side-menu';
import StudentLeftNavPane from '../StudentScreens/LeftNavPane';
import TeacherLeftNavPane from '../TeacherScreens/LeftNavPane';
import LoadingSpinner from '../../components/LoadingSpinner';
import TopBanner from 'components/TopBanner';
import FeedsObject from '../../components/FeedObject';
import { screenHeight } from '../../../config/dimensions';
import EmojiSelector from '../../components/CustomizedEmojiSelector';
import { FlatList } from 'react-native-gesture-handler';

export default class FeedsScreen extends React.Component {
  state = {
    currentClass: {},
    isOpen: false,
    classes: [],
    isLoading: true,
    userID: '',
    LeftNavPane: {},
    isTeacher: false,
    currentClassID: '',
    teacher: null,
    student: null,
    feedsData: [
      {
        madeByUser: 'jiewfjeo',
        Content: 'Emad gained 50 points!',
        type: 'notification',
        Reactions: [
          {
            emoji: "😋",
            reactedBy: ['Gx6OAwlilxV9OBB7v63wesjpal22']
          }
        ]
      },
      {
        madeByUser: 'Gx6OAwlilxV9OBB7v63wesjpal22',
        Content: {
          assignmentType: 'Memorization',
          start: { ayah: 1, surah: 2, page: 2 },
          end: { ayah: 11, page: 2, surah: 2 }
        },
        type: 'assignment',
        Reactions: []
      },
      {
        madeByUser: 'jiewfjeo',
        Content: 'Emad gained 50 points!',
        type: 'notification',
        Reactions: [
          {
            emoji: "😋",
            reactedBy: ['Gx6OAwlilxV9OBB7v63wesjpal22']
          }
        ]
      }
    ],
    isSelectingEmoji: false,
  };
  async componentDidMount() {
    FirebaseFunctions.setCurrentScreen('Class Feed Screen', 'ClassFeedScreen');

    const { userID } = this.props.navigation.state.params;
    const teacher = await FirebaseFunctions.getTeacherByID(userID);
    let currentClassID;
    let LeftNavPane;
    let classes;
    let userType;
    userType = teacher;
    if (teacher == -1) {
      const student = await FirebaseFunctions.getStudentByID(userID);
      userType = student;
      LeftNavPane = StudentLeftNavPane;
      this.setState({ student, isTeacher: false });
    } else {
      LeftNavPane = TeacherLeftNavPane;
      this.setState({ teacher, isTeacher: true });
    }
    currentClassID = userType.currentClassID;
    classes = await FirebaseFunctions.getClassesByIDs(userType.classes);
    const currentClass = await FirebaseFunctions.getClassByID(currentClassID);
    const { classInviteCode } = currentClass;
    this.setState({
      isLoading: false,
      currentClass,
      currentClassID,
      classInviteCode,
      LeftNavPane,
      userID,
      classes,
    });
  }
  toggleSelectingEmoji() {
    this.setState({ isSelectingEmoji: !this.state.isSelectingEmoji });
  }
  render() {
    const { LeftNavPane } = this.state;
    if (this.state.isLoading) {
      return (
        <View style={localStyles.spinnerContainerStyle}>
          <LoadingSpinner />
        </View>
      );
    }
    if (this.state.isSelectingEmoji) {
      return (
        <EmojiSelector
          theme={colors.primaryLight}
          onEmojiSelected={emoji => {}}
          onBackdropPress={() => this.toggleSelectingEmoji()}
        />
      );
    }
    return (
      <SideMenu
        isOpen={this.state.isOpen}
        menu={
          <LeftNavPane
            teacher={this.state.teacher}
            student={this.state.student}
            userID={this.state.userID}
            classes={this.state.classes}
            edgeHitWidth={0}
            navigation={this.props.navigation}
          />
        }
      >
        <View style={localStyles.containerView}>
          <TopBanner
            LeftIconName="navicon"
            LeftOnPress={() => this.setState({ isOpen: true })}
            Title={this.state.currentClass.name + ' Feed'}
          />
          <ScrollView style={localStyles.scrollViewStyle}>
            <FlatList
              data={this.state.feedsData}
              renderItem={({ index, item, separators }) => (
                <FeedsObject
                  onPressSelectEmoji={() => this.toggleSelectingEmoji()}
                  madeByUser={item.madeByUser}
                  currentUser={
                    this.state.isTeacher
                      ? this.state.teacher
                      : this.state.student
                  }
                  isTeacher={this.state.isTeacher}
                  Content={item.Content}
                  number={index}
                  key={index}
                  type={item.type}
                  Reactions={item.Reactions}
                  imageRequire={require('../../../assets/images/student-icons/boy1.png')}
                />
              )}
            />
          </ScrollView>
        </View>
      </SideMenu>
    );
  }
}
const localStyles = StyleSheet.create({
  containerView: {
    height: screenHeight
  },
  scrollViewStyle: {
    backgroundColor: colors.lightGrey,
  },
  spinnerContainerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
