//This will be the screen that can be accessed in order to share the class code with students. A touchable
//text will also be available if the teacher wants to create a manual student. This screen will be accessed
//from clicking the "+" sign once the ClassMainScreen is editable, when a new class is created, and when
//the teacher first signs up for the app.
import React, { Component } from 'react';
import { View, Text, StyleSheet, Share, TouchableOpacity } from 'react-native';
import fontStyles from 'config/fontStyles';
import screenStyle from 'config/screenStyle';
import { screenHeight, screenWidth } from 'config/dimensions';
import strings from 'config/strings';
import QcActionButton from "components/QcActionButton";
import FirebaseFunctions from 'config/FirebaseFunctions';
import QCView from 'components/QCView';
import colors from 'config/colors';

class ShareClassCodeScreen extends Component {

    render() {

        const { userID, currentClassID, currentClass } = this.props.navigation.state.params;

        return (
            <QCView style={screenStyle.container}>
                <View style={styles.topSpacer}></View>
                <View style={styles.classCode}>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'flex-start' }}>
                        <Text style={fontStyles.hugeTextStyleBlack}>{strings.YourClassCode}</Text>
                    </View>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center' }}>
                        <Text style={fontStyles.hugeTextStylePrimaryDark}>{currentClassID}</Text>
                    </View>
                </View>
                <View style={styles.shareButton}>
                    <QcActionButton
                        text={strings.ShareCode}
                        onPress={() => {
                            FirebaseFunctions.logEvent("TEACHER_SHARE_CLASS_CODE");
                            Share.share(
                                {
                                    message: strings.JoinMyClass + currentClassID + (
                                        '\niOS: ' + 'https://apps.apple.com/us/app/quran-connect/id1459057386' +
                                        '\nAndroid: ' + 'https://play.google.com/store/apps/details?id=com.yungdevz.quranconnect')
                                }
                            )
                        }} />
                </View>
                <View style={styles.addStudentsManually}>
                    <TouchableOpacity
                        style={styles.touchableText}
                        onPress={() => {
                            this.props.navigation.push("AddManualStudents", {
                                userID,
                                classID: currentClassID,
                                currentClass
                            })
                        }}>
                        <Text style={[fontStyles.bigTextStylePrimaryDark, styles.italicText]}>{strings.Or}</Text>
                        <Text style={[fontStyles.bigTextStylePrimaryDark, styles.underLineItalicText]}>{strings.AddStudentsManually}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.doneButton}>
                    <QcActionButton
                        text={strings.Done}
                        onPress={() => this.props.navigation.push('TeacherCurrentClass', {
                            userID
                        })} />
                </View>
            </QCView>
        )
    }
}

const styles = StyleSheet.create({
    topSpacer: {
        height: screenHeight * 0.15
    },
    classCode: {
        height: screenHeight * 0.15,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    shareButton: {
        height: screenHeight * 0.25,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    addStudentsManually: {
        height: screenHeight * 0.15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    touchableText: {
        height: screenHeight * 0.15,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    italicText: {
        fontStyle: 'italic'
    },
    underLineItalicText: {
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        textDecorationColor: colors.primaryDark
    },
    doneButton: {
        height: screenHeight * 0.1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ShareClassCodeScreen;
