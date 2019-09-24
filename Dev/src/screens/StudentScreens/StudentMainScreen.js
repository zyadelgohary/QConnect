//This screen will be the main screen that will display for students as a landing page for when they first
//sign up or log in
import React from 'react';
import QcParentScreen from "../QcParentScreen";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ScrollView, Modal, Alert, Dimensions } from 'react-native';
import studentImages from 'config/studentImages';
import { Rating } from 'react-native-elements';
import colors from 'config/colors'
import strings from 'config/strings';
import TopBanner from 'components/TopBanner'
import FirebaseFunctions from 'config/FirebaseFunctions';
import QcActionButton from 'components/QcActionButton';
import LeftNavPane from './LeftNavPane';
import SideMenu from 'react-native-side-menu';
import LoadingSpinner from 'components/LoadingSpinner';
import { Input } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import QCView from 'components/QCView';
import screenStyle from 'config/screenStyle';
import fontStyles from '../../../config/fontStyles';

class StudentMainScreen extends QcParentScreen {

    state = {
        isLoading: true,
        student: '',
        userID: '',
        currentClass: '',
        currentClassID: '',
        thisClassInfo: '',
        isReady: '',
        modalVisible: false,
        classCode: '',
        classes: ''
    }

    //Joins the class by first testing if this class exists. If the class doesn't exist, then it will
    //alert the user that it does not exist. If the class does exist, then it will join the class, and
    //navigate to the current class screen.
    async joinClass() {

        this.setState({ isLoading: true });
        const { userID, classCode, student } = this.state;

        //Tests if the user is already a part of this class and throws an alert if they are
        if (student.classes.includes(classCode)) {
            Alert.alert(strings.Whoops, strings.ClassAlreadyJoined);
            this.setState({ isLoading: false });
        } else {
            const didJoinClass = await FirebaseFunctions.joinClass(student, classCode);
            if (didJoinClass === -1) {
                Alert.alert(strings.Whoops, strings.IncorrectClassCode);
                this.setState({ isLoading: false, modalVisible: false });
            } else {
                //Refetches the student object to reflect the updated database
                this.setState({
                    isLoading: false,
                    modalVisible: false
                })
                this.props.navigation.push("StudentCurrentClass", {
                    userID,
                });
            }
        }
    }

    //Fetches all the values for the state from the firestore database
    async componentDidMount() {

        super.componentDidMount();

        //Sets the screen name in firebase analytics
        FirebaseFunctions.setCurrentScreen("Student Main Screen", "StudentMainScreen");

        const { userID } = this.props.navigation.state.params;
        const student = await FirebaseFunctions.getStudentByID(userID);
        const { currentClassID } = student;
        if (currentClassID === "") {
            this.setState({
                isLoading: false,
                noCurrentClass: true,
                student,
                userID,
                isOpen: false,
                classes: []
            });
        } else {
            const currentClass = await FirebaseFunctions.getClassByID(currentClassID);
            const thisClassInfo = currentClass.students.find((student) => {
                return student.ID === userID;
            });
            const { isReady } = thisClassInfo;
            const classes = await FirebaseFunctions.getClassesByIDs(student.classes);
            this.setState({
                student,
                userID,
                currentClass,
                currentClassID,
                thisClassInfo,
                isReady,
                isLoading: false,
                isOpen: false,
                classes
            });
        }
    }

    //Returns the correct caption based on the student's average grade
    getRatingCaption() {
        let caption = strings.GetStarted;
        let { averageGrade } = this.state.thisClassInfo;

        if (averageGrade > 4) {
            caption = strings.OutStanding
        }
        else if (averageGrade >= 3) {
            caption = strings.GreatJob
        }
        else if (averageGrade > 0) {
            caption = strings.PracticePerfect
        }

        return caption
    }

    //Renders the screen
    render() {
        const { userID, isLoading, student, currentClassID, thisClassInfo, isReady, currentClass } = this.state;

        if (isLoading === true) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingSpinner isVisible={true} />
                </View>
            )
        }

        if (this.state.noCurrentClass) {
            return (
                <SideMenu 
                openMenuOffset={Dimensions.get('window').width *  0.7}
                isOpen={this.state.isOpen} menu={<LeftNavPane
                    student={student}
                    userID={userID}
                    classes={this.state.classes}
                    edgeHitWidth={0}
                    navigation={this.props.navigation} />}>
                    <QCView style={screenStyle.container}>
                        <View style={{ flex: 1 }}>
                            <TopBanner
                                LeftIconName="navicon"
                                LeftOnPress={() => this.setState({ isOpen: true })}
                                Title={"Quran Connect"} />

                        </View>
                        <View style={{ flex: 2, justifyContent: 'flex-start', alignItems: 'center', alignSelf: 'center' }}>
                            <Image
                                source={require('assets/emptyStateIdeas/ghostGif.gif')}
                                style={{
                                    width: 300,
                                    height: Dimensions.get('window').height * 0.22,
                                    resizeMode: 'contain',
                                }} />

                            <Text style={[fontStyles.bigTextStyleDarkGrey, { alignSelf: 'center' }]}>
                                {strings.HaventJoinedClassYet}
                            </Text>

                            <QcActionButton
                                text={strings.JoinClass}
                                onPress={() => this.setState({ modalVisible: true })} />
                        </View>
                        <Modal
                            animationType="fade"
                            style={{ alignItems: 'center', justifyContent: 'center' }}
                            transparent={true}
                            presentationStyle="overFullScreen"
                            visible={this.state.modalVisible}
                            onRequestClose={() => {
                            }}>
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                paddingTop: Dimensions.get('window').height / 3
                            }}>
                                <View style={styles.modal}>
                                    {
                                        this.state.isLoading === true ? (
                                            <View>
                                                <LoadingSpinner isVisible={true} />
                                            </View>
                                        ) : (
                                                <View>
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text style={fontStyles.mainTextStyleDarkGrey}>{strings.TypeInAClassCode}</Text>
                                                    </View>
                                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <TextInput
                                                            style={{
                                                                height: Dimensions.get('window').height * 0.07,
                                                                paddingLeft: 7,
                                                                fontSize: 14,
                                                                color: colors.darkGrey,
                                                            }}
                                                            placeholder={strings.TypeInAClassCode}
                                                            onChangeText={classCode => this.setState({ classCode })}
                                                            value={this.state.classCode}
                                                        />
                                                    </View>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                                                        <QcActionButton
                                                            text={strings.Cancel}
                                                            onPress={() => { this.setState({ modalVisible: false }) }} />
                                                        <QcActionButton
                                                            text={strings.Confirm}
                                                            onPress={() => {
                                                                //Joins the class
                                                                this.joinClass();
                                                            }} />
                                                    </View>
                                                </View>

                                            )
                                    }
                                </View>
                            </View>
                        </Modal>
                    </QCView>
                </SideMenu>
            )
        }

        return (
            <SideMenu 
            isOpen={this.state.isOpen} menu={<LeftNavPane
                student={student}
                userID={userID}
                classes={this.state.classes}
                edgeHitWidth={0}
                navigation={this.props.navigation} />}>
                <QCView style={screenStyle.container}>
                    <TopBanner
                        LeftIconName="navicon"
                        LeftOnPress={() => this.setState({ isOpen: true })}
                        Title={currentClass.name}
                    />
                    <View style={styles.topView}>
                        <View style={styles.profileInfo}>
                            <View style={styles.profileInfoTop}>
                                <Image
                                    style={styles.profilePic}
                                    source={studentImages.images[student.profileImageID]} />
                                <View style={styles.profileInfoTopRight}>
                                    <Text numberOfLines={1} style={fontStyles.mainTextStyleBlack}>{student.name.toUpperCase()}</Text>
                                    <View style={{ flexDirection: 'row', height: Dimensions.get('window').height * 0.04 }}>
                                        <Rating readonly={true} startingValue={thisClassInfo.averageRating} imageSize={25} />
                                        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                                            <Text style={fontStyles.bigTextStyleDarkGrey}>{thisClassInfo.averageRating === 0 ? "" : parseFloat(thisClassInfo.averageRating).toFixed(1)}</Text>
                                        </View>
                                    </View>
                                    <Text style={fontStyles.mainTextStylePrimaryDark}>{this.getRatingCaption()}</Text>
                                </View>
                            </View>
                            <View style={styles.profileInfoBottom}>
                                <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', height: Dimensions.get('window').height * 0.09 }}>
                                    <View style={{ paddingTop: Dimensions.get('window').height * 0.005, paddingLeft: Dimensions.get('window').width * 0.3 }}>
                                        <Text numberOfLines={1} style={fontStyles.bigTextStyleDarkGrey}>{thisClassInfo.currentAssignment.toUpperCase()}</Text>
                                    </View>
                                    <View style={{ alignSelf: 'flex-end' }}>
                                        <Text style={fontStyles.bigTextStyleDarkGrey}>{strings.TotalAssignments + " " + thisClassInfo.totalAssignments + "  "}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.middleView, { backgroundColor: (isReady === true ? colors.green : colors.red) }]}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                            //To-Do: Updates the state of the assignment & communicates it with the teacher
                            if (thisClassInfo.currentAssignment !== "None") {
                                FirebaseFunctions.updateStudentAssignmentStatus(currentClassID, userID);
                                this.setState({ isReady: !isReady });
                            } else {
                                Alert.alert(strings.Whoops, strings.CurrentlyNoAssignment);
                            }
                        }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={fontStyles.bigTextStyleBlack}>{" "}</Text>
                                <Text style={fontStyles.bigTextStyleBlack}>{" "}</Text>
                                <Text style={fontStyles.mainTextStyleBlack}>{strings.CurrentAssignment}</Text>
                                <Text style={fontStyles.bigTextStyleBlack}>{" "}</Text>
                                <Text style={fontStyles.bigTextStyleBlack}>{thisClassInfo.currentAssignment}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'row' }}>
                                <Text style={fontStyles.bigTextStyleBlack}>{"  "}</Text>
                                <Text style={fontStyles.mainTextStylePrimaryDark}>{isReady ? strings.Ready : strings.NotReady}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomView}>
                        <ScrollView style={styles.prevAssignments}>
                            <FlatList
                                data={thisClassInfo.assignmentHistory}
                                keyExtractor={(item, index) => item.name + index}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => {
                                        //To-Do: Navigates to more specific evaluation for this assignment
                                        this.props.navigation.push("EvaluationPage", {
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
                                            isStudentSide: true,
                                            evaluationID: item.ID,
                                            readOnly: true,
                                            newAssignment: false,
                                        })
                                    }}>
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
                                                <Text numberOfLines={2} style={fontStyles.smallTextStyleBlack}>{"Notes: " + item.evaluation.notes}</Text>
                                                : <View />
                                            }
                                            {item.evaluation.improvementAreas && item.evaluation.improvementAreas.length > 0 ?
                                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', height: Dimensions.get('window').height * 0.03, }}>
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
            </SideMenu>
        )
    }
}

//Styles for the entire container along with the top banner
const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        backgroundColor: colors.lightGrey,
        flex: 1
    },
    topView: {
        flex: 2.3,
        flexDirection: 'column',
        backgroundColor: colors.white
    },
    profileInfoTop: {
        paddingHorizontal: 10,
        paddingTop: 10,
        flexDirection: 'row',
        height: Dimensions.get('window').height * 0.125,
        borderBottomColor: colors.lightGrey,
        borderBottomWidth: 1,
    },
    profileInfoTopLeft: {
        flexDirection: 'column',
        marginLeft: 3,
        alignItems: 'center',
        width: 100
    },
    profileInfoTopRight: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingLeft: Dimensions.get('window').width * 0.075,
        paddingBottom: 5,
    },
    profileInfoBottom: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        height: Dimensions.get('window').height * 0.11,
        borderBottomColor: colors.grey,
        borderBottomWidth: 1
    },
    profilePic: {
        width: Dimensions.get('window').height * 0.1,
        height: Dimensions.get('window').height * 0.1,
        borderRadius: 50,
    },
    middleView: {
        flex: 1,
    },
    bottomView: {
        flex: 3
    },
    studentNameStyle: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 18,
        color: colors.black,
    },
    prevAssignmentCard: {
        flexDirection: 'column',
        borderBottomColor: colors.lightGrey,
        borderBottomWidth: 1,
        height: Dimensions.get('window').height * 0.13,
        padding: 5,
    },
    profileInfo: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        marginBottom: 10,
    },
    notesText: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: colors.black
    },
    subText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        color: colors.primaryDark
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
    prevAssignments: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        flex: 1
    },
    profileInfo: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        marginBottom: 10
    },
    bigText: {
        fontSize: 24,
        fontFamily: 'Montserrat-Regular',
    },
    subText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        color: colors.primaryDark
    },
    assignmentTextSmall: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: colors.black,
        paddingTop: 2
    },
    modal: {
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: Dimensions.get('window').height * 0.25,
        width: Dimensions.get('window').width * 0.75,
        borderWidth: 1,
        borderRadius: 2,
        borderColor: colors.grey,
        borderBottomWidth: 1,
        shadowColor: colors.darkGrey,
        shadowOffset: { width: 0, height: Dimensions.get('window').height * 0.003 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 2,
    },
});

export default StudentMainScreen;