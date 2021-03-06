//This class will contain all the functions that interact with the react native firebase
//library
import firebase from "react-native-firebase";
import strings from "./strings";
import { arrayOf } from "prop-types";

export default class FirebaseFunctions {
  //References that'll be used throughout the class's static functions
  static database = firebase.firestore();
  static batch = this.database.batch();
  static storage = firebase.storage();
  static teachers = this.database.collection('teachers');
  static students = this.database.collection('students');
  static classes = this.database.collection('classes');
  static functions = firebase.functions();
  static fcm = firebase.messaging();
  static auth = firebase.auth();
  static analytics = firebase.analytics();

  //-----------------------------
  //Methods that can be called from any other class

  //This function will take in an ID of a teacher and return that teacher object.
  //Will return -1 if the document does not exist
  static async getTeacherByID(ID) {
    let teacher = await this.teachers.doc(ID).get();
    if (teacher.exists) {
      return teacher.data();
    } else {
      return -1;
    }
  }

  //This function will take in an ID of a student and return that student's object
  //Will return -1 if the document does not exist
  static async getStudentByID(ID) {
    let student = await this.students.doc(ID).get();
    if (student.exists) {
      return student.data();
    } else {
      return -1;
    }
  }

  //This function will take in an ID of a class and return that class object
  //Will return -1 if the document does not exist
  static async getClassByID(ID) {
    let classByID = await this.classes.doc(ID).get();
    if (classByID.exists) {
      return classByID.data();
    } else {
      return -1;
    }
  }

  //This function will take in an array of class IDs and return an array of class objects that'll
  //be fetched from firestore
  static async getClassesByIDs(classIDs) {
    let arrayOfClassObjects = [];
    for (let i = 0; i < classIDs.length; i++) {
      const classObject = await this.getClassByID(classIDs[i]);
      arrayOfClassObjects.push(classObject);
    }
    return arrayOfClassObjects;
  }

  //This function will take in an ID of a teacher document, and an updated object, and will update
  //the document in firestore accordingly
  static async updateTeacherObject(ID, newObject) {
    let docRef = this.teachers.doc(ID);
    await docRef.update(newObject);
    return 0;
  }

  //This function will take in an ID of a class document, and an updated object, and will update the
  //document in firestore accordingly
  static async updateClassObject(ID, newObject) {
    let docRef = this.classes.doc(ID);
    await docRef.update(newObject);
    return 0;
  }

  //This function will take in an ID of a student document, and an updated object, and will update the
  //document in firestore accordingly
  static async updateStudentObject(ID, newObject) {
    let docRef = this.students.doc(ID);
    await docRef.update(newObject);
    return 0;
  }

  static async getClassIdsCollection() {
    let classIDs = [];
    let snapshot = await FirebaseFunctions.classes.get();

    snapshot.docs.forEach(doc => {
      //console.log("---- id: " + doc.data().ID)
      classIDs.push(doc.data().ID);
    });
    return classIDs;
  }

  static async updateClassCode() {
    console.log("\n\n\n\n========= migrating class null image ids ========\n");
    let cls = await this.getClassIdsCollection();
    cls.forEach(async classID => {
      let currentClass = await this.getClassByID(classID);
      // if (cls.classInviteCode === undefined) {
      //   let classInviteCode = classID.substring(0, 5);
      //   console.log(`clsinviteCode ${classInviteCode}`);

      //   await this.updateClassObject(classID, {
      //     classInviteCode
      //   });
      // }

      if (
        currentClass.classImageID === undefined ||
        currentClass.classImageID === null
      ) {
        console.log(
          `currentClass ${currentClass.ID}, imgID: ${currentClass.classImageID}`
        );

        await this.updateClassObject(classID, {
          classImageID: 1
        });
      }
    });
  }
  static async updateMe() {
    let cls = await this.getClassIdsCollection();
    //Rewrites all of the versions of this student in all of the classes they are a part of with their
    //new name and profile picture
    cls.forEach(async classID => {
      let currentClass = await this.getClassByID(classID);
      console.log("---- id: " + classID);

      if (
        (currentClass.currentAssignments !== undefined &&
          currentClass.currentAssignments.length > 0) ||
        currentClass.currentAssignment === undefined
      ) {
        console.log("skipping class: " + classID);
        return;
      }

      let currentAssignments = [];
      if (currentClass.currentAssignment !== 'None') {
        //update these students info with new schema
        currentAssignments = [
          {
            name: currentClass.currentAssignment,
            type: currentClass.currentAssignmentType
              ? currentClass.currentAssignmentType
              : strings.Memorization,
            location: currentClass.currentAssignmentLocation
          },
        ];

        console.log(
          "modifying class: " +
            classID +
            ". assignmentName: " +
            currentClass.currentAssignment
        );
      }
      // await this.updateClassObject(classID, {
      //   currentAssignments,
      // });
    });

    return 0;
  }

  static async fixNullAssignmentLocationsAndTypes() {
    let cls = await this.getClassIdsCollection();
    //Rewrites all of the versions of this student in all of the classes they are a part of with their
    //new name and profile picture
    cls.forEach(async classID => {
      let currentClass = await this.getClassByID(classID);
      //      console.log("---- id: " + classID);

      let arrayOfStudents = currentClass.students;
      if (!arrayOfStudents) {
        return;
      }

      //filter to students with attendance records
      let studentsToFix = arrayOfStudents.filter(
        student =>
          student.currentAssignments !== undefined &&
          student.currentAssignments.find(
            assignment =>
              assignment.type === null || assignment.location === null
          )
      );

      if(studentsToFix.length === 0){
        console.log("this class doesn't need fix: " + classID);
        return;
      }

      let fixedStudents = studentsToFix.map(stud => {
        console.log(
          "found: className" +
            currentClass.name +
            ".\n student name " +
            stud.name +
            ".\n assignment: " +
            JSON.stringify(stud.currentAssignments)
        );

        let fixed = stud.currentAssignments.map(assignment => {
          if (
            assignment === undefined ||
            assignment.type === null ||
            assignment.location === null
          ) {
            if (assignment.type === null) {
              assignment.type = "Memorization";
            }
          }
          return assignment;
        });

        console.log("fixed: " + JSON.stringify(fixed));
        let filtered = fixed.filter(as => as.name !== "None");
        console.log("filtered: " + JSON.stringify(filtered));

        stud.currentAssignments = filtered;

        return stud;
      });

      console.log("\n--------------------------------\nnew Students Array: \n" + JSON.stringify(fixedStudents))
      await this.updateClassObject(classID, {
        students: fixedStudents
      });

      return 0;
    });
  }

  static async updateAttendance() {
    let cls = await this.getClassIdsCollection();
    //Rewrites all of the versions of this student in all of the classes they are a part of with their
    //new name and profile picture
    cls.forEach(async classID => {
      let currentClass = await this.getClassByID(classID);

      let arrayOfStudents = currentClass.students;
      if (!arrayOfStudents) {
        return;
      }

      //filter to students with attendance records
      let studentsToFix = arrayOfStudents.filter(
        student =>
          student.attendanceHistory !== undefined &&
          Object.values(student.attendanceHistory).length > 0
      );

      console.log("555555 length " + studentsToFix.length);

      //update these students info with new schema
      studentsToFix.forEach(async studToFix => {
        let studentIndex = arrayOfStudents.findIndex(student => {
          return student.ID === studToFix.ID;
        });

        console.log(`~~~~fixing student: ${studToFix.ID}`);

        let classesMissed = Object.values(
          arrayOfStudents[studentIndex].attendanceHistory
        ).reduce(function(n, val) {
          return n + (val === false);
        }, 0);
        let classesAttended = Object.values(
          arrayOfStudents[studentIndex].attendanceHistory
        ).reduce(function(n, val) {
          return n + (val === true);
        }, 0);

        // console.log(
        //   `missed: ${classesMissed}, att: ${classesAttended}, hist: ${JSON.stringify(
        //     arrayOfStudents[studentIndex].attendanceHistory
        //   )}dd`
        // );

        if (classesMissed > 0 || classesAttended > 0) {
          arrayOfStudents[studentIndex].classesMissed = classesMissed;
          arrayOfStudents[studentIndex].classesAttended = classesAttended;
        }

        console.log(
          `fixed student: ${JSON.stringify(arrayOfStudents[studentIndex])}`
        );
      });

      await this.updateClassObject(classID, {
        students: arrayOfStudents
      });

      //}
      // await this.updateClassObject(classID, {
      //   currentAssignments,
      // });
    });

    return 0;
  }

  //This function will update the student info in both the students collection and the class object of
  //the student inside the classes collection. This method will take in the ID of the student, as well
  //as the information to update
  static async updateStudentProfileInfo(
    userID,
    classes,
    name,
    phoneNumber,
    profileImageID
  ) {
    await this.updateStudentObject(userID, {
      name,
      phoneNumber,
      profileImageID,
    });

    //Rewrites all of the versions of this student in all of the classes they are a part of with their
    //new name and profile picture
    classes.forEach(async eachClass => {
      let currentClass = await this.getClassByID(eachClass.ID);
      let arrayOfStudents = currentClass.students;
      let studentIndex = arrayOfStudents.findIndex(student => {
        return student.ID === userID;
      });
      arrayOfStudents[studentIndex].name = name;
      arrayOfStudents[studentIndex].profileImageID = profileImageID;
      await this.updateClassObject(eachClass.ID, {
        students: arrayOfStudents,
      });
    });

    return 0;
  }

  //This function will take in a new class object, and a teacher object and create a new class
  //that belongs to that teacher in the firestore database. It will do this by creating a new document
  //in the "classes" collection, then linking that class to a certain teacher by relating them through
  //IDs. This method returns the new ID of the class

  static async addNewClass(newClassObject, teacherID) {
    //Adds the new class document and makes sure it has a reference to its own ID
    let newClass = await this.classes.add(newClassObject);
    const ID = (currentClassID = newClass.id + "");
    //Creates a class Invite code and updates it as well as making sure the document has a reference to its own ID
    const updatedClassIC = ID.substring(0, 5);
    await this.updateClassObject(newClass.id, {
      ID,
      classInviteCode: updatedClassIC,
    });
    //Appends the class ID to the array of classes belonging to this teacher
    let ref = this.teachers.doc(teacherID);
    await ref.update({
      currentClassID,
      classes: firebase.firestore.FieldValue.arrayUnion(ID),
    });
    this.logEvent('ADD_NEW_CLASS');
    return ID;
  }

  //This method will disasociate a class from a specific teacher. It will take in the class ID & the teacher ID and disconnect the
  //two. The class object will be still stored in the firestore.
  static async deleteClass(classID, teacherID) {
    const thisClass = await this.getClassByID(classID);
    const arrayOfTeachers = thisClass.teachers;
    const indexOfTeacher = arrayOfTeachers.findIndex(element => {
      return element === teacherID;
    });
    arrayOfTeachers.splice(indexOfTeacher, 1);
    await this.updateClassObject(classID, {
      teachers: arrayOfTeachers,
    });

    const thisTeacher = await this.getTeacherByID(teacherID);
    const arrayOfClasses = thisTeacher.classes;
    const indexOfClass = arrayOfClasses.findIndex(element => {
      return element === classID;
    });
    arrayOfClasses.splice(indexOfClass, 1);
    if (arrayOfClasses.length === 0) {
      await this.updateTeacherObject(teacherID, {
        classes: arrayOfClasses,
        currentClassID: ''
      });
    } else {
      await this.updateTeacherObject(teacherID, {
        classes: arrayOfClasses,
        currentClassID: arrayOfClasses[0],
      });
    }

    return 0;
  }

  //This function will update the assignment status of a particular student within a class. It will
  //simply reverse whatever the property is at the moment (true --> false & vice verca). This property
  //is located within a student object that is within a class object
  static async updateStudentAssignmentStatus(
    classID,
    studentID,
    status,
    index
  ) {
    let currentClass = await this.getClassByID(classID);

    let arrayOfStudents = currentClass.students;
    let studentIndex = arrayOfStudents.findIndex(student => {
      return student.ID === studentID;
    });

    arrayOfStudents[studentIndex].currentAssignments[
      index
    ].isReadyEnum = status;

    await this.updateClassObject(classID, {
      students: arrayOfStudents,
    });
    this.logEvent('UPDATE_ASSIGNMENT_STATUS');

    //Sends a notification to each of the teachers that are teacher this class,
    //letting them know of the updated assignment status
    const message =
      status === 'WORKING_ON_IT'
        ? strings.WorkingOnIt
        : status === 'NEED_HELP'
        ? strings.NeedsHelp
        : strings.Ready;
    currentClass.teachers.forEach(async teacherID => {
      this.functions.httpsCallable("sendNotification")({
        topic: teacherID,
        title: strings.StudentUpdate,
        body:
          arrayOfStudents[studentIndex].name +
          strings.HasChangedAssignmentStatusTo +
          message,
      });
    });

    return 0;
  }

  //This method will take in an audio file and a studentID, and will upload the audio file to that path
  static async uploadAudio(file, fileID) {
    await this.storage.ref('audioFiles/' + fileID).putFile(file);
    return 0;
  }

  static async submitRecordingAudio(file, studentID, classID, assignmentIndex) {
    try {
      const uuidv4 = require("uuid/v4");
      const audioFileID = uuidv4().substring(0, 13);

      await this.uploadAudio(file, audioFileID);

      let currentClass = await this.getClassByID(classID);
      let arrayOfStudents = currentClass.students;
      let studentIndex = arrayOfStudents.findIndex(student => {
        return student.ID === studentID;
      });
      let sent = new Date();

      if (
        arrayOfStudents[studentIndex].currentAssignments === undefined ||
        arrayOfStudents[studentIndex].currentAssignments.length === 0 ||
        arrayOfStudents[studentIndex].currentAssignments[assignmentIndex] ===
          undefined
      ) {
        this.logEvent('SUBMIT_RECORDING_FAILED', {
          error: 'ASSIGNMENT_NOT_FOUND'
        });
        return -1;
      }

      arrayOfStudents[studentIndex].currentAssignments[
        assignmentIndex
      ].submission = {
        audioFileID,
        sent
      };

      await this.updateClassObject(classID, {
        students: arrayOfStudents,
      });
    } catch (error) {
      this.logEvent('SUBMIT_RECORDING_FAILED', { error });
      console.log(
        'error siubmitting recording audio: ' + JSON.stringify(error)
      );
      return -1;
    }

    return 0;
  }

  //This method will take in a student ID and return the audio file associated with that studentID. If an audio
  //file doesn't exist, then the method will return -1.
  static async downloadAudioFile(audioFileID) {
    try {
      const file = this.storage.ref('audioFiles/' + audioFileID);
      const download = await file.getDownloadURL();
      return download;
    } catch (error) {
      this.logEvent('DOWNLOAD_AUDIO_FAILED', { audioFileID, error });
      return -1;
    }
  }

  //This method will update the currentAssignment property of a student within a class.
  //To locate the correct student, the method will take in params of the classID, the studentID,
  //and finally, the name of the new assignment which it will set the currentAssignment property
  //to

  static async updateStudentCurrentAssignment(
    classID,
    studentID,
    newAssignmentName,
    assignmentType,
    assignmentLocation,
    assignmentIndex
  ) {
    let currentClass = await this.getClassByID(classID);
    let arrayOfStudents = currentClass.students;
    let studentIndex = arrayOfStudents.findIndex(student => {
      return student.ID === studentID;
    });
    arrayOfStudents[studentIndex].currentAssignments[assignmentIndex] = {
      name: newAssignmentName,
      type: assignmentType,
      location: assignmentLocation,
      isReadyEnum: "NOT_STARTED"
    };

    await this.updateClassObject(classID, {
      students: arrayOfStudents,
    });
    this.logEvent('UPDATE_CURRENT_ASSIGNMENT');

    //Notifies that student that their assignment has been updated
    this.functions.httpsCallable("sendNotification")({
      topic: studentID,
      title: strings.AssignmentUpdate,
      body: strings.YourTeacherHasUpdatedYourCurrentAssignment,
    });
    return 0;
  }

  static async updateClassAssignment(
    classID,
    newAssignmentName,
    assignmentType,
    assignmentLocation,
    assignmentIndex
  ) {
    if (assignmentIndex === undefined) {
      this.logEvent('UpdateClassAssignment_IndexIsUndefined');
      //fallback to update first assignment
      //this is potentially dangerous,.. consider throwing instead.
      assignmentIndex = 0;
    }

    let currentClass = await this.getClassByID(classID);
    let arrayOfStudents = currentClass.students;
    let updatedAssignment = {
      name: newAssignmentName,
      type: assignmentType,
      location: assignmentLocation,
      isReadyEnum: 'NOT_STARTED'
    };

    arrayOfStudents.forEach(student => {
      if (
        student.currentAssignments === undefined ||
        student.currentAssignments.length === 0
      ) {
        student.currentAssignments = [{ ...updatedAssignment }];
      } else if (student.currentAssignments[assignmentIndex] === undefined) {
        this.logEvent("INVALID_ASSIGNMENT_INDEX", { assignmentIndex });
        student.currentAssignments.push({ ...updatedAssignment });
      } else {
        student.currentAssignments[assignmentIndex] = updatedAssignment;
      }

      try {
        //Notifies that student that their assignment has been updated
        this.functions.httpsCallable('sendNotification')({
          topic: student.ID,
          title: strings.AssignmentUpdate,
          body: strings.YourTeacherHasUpdatedYourCurrentAssignment
        });
      } catch (error) {
        //todo: log event when this happens
        this.logEvent(
          "FAILED_TO_SEND_NOTIFICATIONS. Error: " + error.toString()
        );
      }
    });

    //todo: update the below to support multiple assignments
    let currentAssignments = currentClass.currentAssignments;
    if (currentAssignments === undefined || currentAssignments.length === 0) {
      currentAssignments = [{ ...updatedAssignment }];
    } else if (currentAssignments[assignmentIndex] === undefined) {
      //todo: show error here?
      this.logEvent(
        "INVALID_ASSIGNMENT_INDEX. Falling back to adding the assignment as new",
        { assignmentIndex }
      );
      currentAssignments.push({ ...updatedAssignment });
    } else {
      currentAssignments[assignmentIndex] = updatedAssignment;
    }

    await this.updateClassObject(classID, {
      students: arrayOfStudents,
      currentAssignments
    });
    return 0;
  }

  //This function will complete a current assignment that belongs to a certain student within a class
  //It will take params of a studentID, a classID, and an evaluation object that it will add
  //to the array of the student's assignment history. Also increments the total assignment
  //count by 1. Then it calculates the new average grade for the student.
  static async completeCurrentAssignment(
    classID,
    studentID,
    evaluationDetails
  ) {
    let currentClass = await this.getClassByID(classID);

    let arrayOfStudents = currentClass.students;
    let studentIndex = arrayOfStudents.findIndex(student => {
      return student.ID === studentID;
    });

    arrayOfStudents[studentIndex].totalAssignments =
      arrayOfStudents[studentIndex].totalAssignments + 1;
    arrayOfStudents[studentIndex].assignmentHistory.push(evaluationDetails);

    let avgGrade = 0;
    arrayOfStudents[studentIndex].assignmentHistory.forEach(assignment => {
      avgGrade += assignment.evaluation.rating;
    });
    avgGrade /= arrayOfStudents[studentIndex].totalAssignments;
    arrayOfStudents[studentIndex].averageRating = avgGrade;
    arrayOfStudents[studentIndex].isReadyEnum = 'WORKING_ON_IT';

    let indexOfAssignment = arrayOfStudents[
      studentIndex
    ].currentAssignments.findIndex(element => {
      return (
        element.name === evaluationDetails.name &&
        element.type === evaluationDetails.type
      );
    });

    arrayOfStudents[studentIndex].currentAssignments.splice(
      indexOfAssignment,
      1
    );

    await this.updateClassObject(classID, {
      students: arrayOfStudents,
    });
    this.analytics.logEvent('COMPLETE_CURRENT_ASSIGNMENT', {
      improvementAreas: evaluationDetails.improvementAreas,
    });

    //Notifies that student that their assignment has been graded
    this.functions.httpsCallable("sendNotification")({
      topic: studentID,
      title: strings.AssignmentGraded,
      body: strings.YourAssignmentHasBeenGraded,
    });
    return 0;
  }

  //This function will take in an assignment details object and overwrite an old evaluation with the new data.
  //It will take in a classID, a studentID, and an evaluationID in order to locate the correct evaluation object
  static async overwriteOldEvaluation(
    classID,
    studentID,
    evaluationID,
    newEvaluation
  ) {
    let currentClass = await this.getClassByID(classID);
    let arrayOfStudents = currentClass.students;
    let studentIndex = arrayOfStudents.findIndex(student => {
      return student.ID === studentID;
    });

    let copyOfEvaluationObjectIndex = arrayOfStudents[
      studentIndex
    ].assignmentHistory.findIndex(assignment => {
      return assignment.ID === evaluationID;
    });

    arrayOfStudents[studentIndex].assignmentHistory[
      copyOfEvaluationObjectIndex
    ].evaluation = newEvaluation;

    await this.updateClassObject(classID, {
      students: arrayOfStudents,
    });
    this.analytics.logEvent('OVERWRITE_PAST_EVALUATION', {
      improvementAreas: newEvaluation.improvementAreas,
    });

    return 0;
  }

  //This method will take in a classID & a specific date as well as an array of absent students
  //It will then save the attendance for each student that day. The attendace will be saved in the class version
  //of the student object because attendance is per class
  static async saveAttendanceForClass(absentStudents, selectedDate, classID) {
    let currentClass = await this.getClassByID(classID);
    let arrayOfStudents = currentClass.students;
    arrayOfStudents.forEach((student, index) => {
      //If the attendance already exists, then the code will automatically replace
      //the old attendance with this one
      let copyOfStudent = student;
      let { attendanceHistory } = copyOfStudent;

      //if the student attendance status changes, then updates their attendance tally
      let oldState = attendanceHistory[selectedDate];
      let newState = !absentStudents.includes(student.ID);

      //only update attendance tally if attendance indeed changed
      if (oldState !== newState) {
        if (newState === true) {
          copyOfStudent.classesAttended
            ? (copyOfStudent.classesAttended += 1)
            : (copyOfStudent.classesAttended = 1);
          if (oldState === false) {
            //if the student was marked as absent before and now is present, decrement (correct) classes missed
            copyOfStudent.classesMissed && copyOfStudent.classesMissed > 0
              ? (copyOfStudent.classesMissed -= 1)
              : (copyOfStudent.classesMissed = 0);
          }
        } else if (newState === false) {
          copyOfStudent.classesMissed
            ? (copyOfStudent.classesMissed += 1)
            : (copyOfStudent.classesMissed = 1);
          if (oldState === true) {
            //if the student was marked as absent before and now is present, decrement (correct) classes missed
            copyOfStudent.classesAttended && copyOfStudent.classesAttended > 0
              ? (copyOfStudent.classesAttended -= 1)
              : (copyOfStudent.classesAttended = 0);
          }
        }
        attendanceHistory[selectedDate] = absentStudents.includes(student.ID)
          ? false
          : true;
        copyOfStudent.attendanceHistory = attendanceHistory;
        arrayOfStudents[index] = copyOfStudent;
      }
    });

    await this.updateClassObject(classID, {
      students: arrayOfStudents,
    });
    this.logEvent('SAVE_ATTENDANCE');

    return 0;
  }

  //This function takes in a date as a parameter and returns an array of students that were absent for this specifc
  //date. If a particular student does not have an attendance saved for this date, then they will not be added to the
  //array of absent students. To locate the particular class to return the attendance to, the classID will also be
  //a paremeter
  static async getAbsentStudentsByDate(date, classID) {
    let absentStudents = [];
    let currentClass = await this.getClassByID(classID);

    currentClass.students.forEach(student => {
      let studentAttendanceHistory = student.attendanceHistory;
      if (studentAttendanceHistory[date] === false) {
        absentStudents.push(student.ID);
      }
    });
    this.logEvent('GET_ATTENDANCE_BY_DATE');

    return absentStudents;
  }

  //This method will allow a student to join a class. It will take in a student object and a classID.
  //It will add that student to the array of students within the class object. Then it will add
  //the classID to the array of classes withint the student object. Then it will finally update
  //the "currentClassID" property within the student object. If the class does not exist, the method
  //will return a value of -1, otherwise it will return 0;
  static async joinClass(student, classInviteCode) {
    const studentID = student.ID;
    const classToJoin = await this.classes
      .where("classInviteCode", "==", classInviteCode)
      .get();
    if (
      classToJoin == undefined ||
      classToJoin.docs == undefined ||
      classToJoin.docs[0] == undefined ||
      !classToJoin.docs[0].exists
    ) {
      return -1;
    }
    //alert(classToJoin.docs[0].data().teachers);

    const studentObject = {
      ID: studentID,
      assignmentHistory: [],
      attendanceHistory: {},
      averageRating: 0,
      currentAssignment: "None",
      isReadyEnum: 'WORKING_ON_IT',
      profileImageID: student.profileImageID,
      name: student.name,
      totalAssignments: 0,
    };

    await this.updateClassObject(classToJoin.docs[0].id, {
      students: firebase.firestore.FieldValue.arrayUnion(studentObject),
    });
    //alert(classToJoin.docs[0].data().teachers);

    await this.updateStudentObject(studentID, {
      classes: firebase.firestore.FieldValue.arrayUnion(classToJoin.docs[0].id),
      currentClassID: classToJoin.docs[0].id,
    });
    this.logEvent('JOIN_CLASS');

    //Sends a notification to the teachers of that class saying that a student has joined the class
    //alert(classToJoin.docs[0].data().teachers);
    classToJoin.docs[0].data().teachers.forEach(teacherID => {
      this.functions.httpsCallable("sendNotification", {
        topic: teacherID,
        title: strings.NewStudent,
        body: student.name + strings.HasJoinedYourClass,
      });
    });
    return studentObject;
  }

  //This function will be responsible for adding a student manually from a teacher's side. It will
  //create a student object in the database & link it to the class like it would a normal student.
  //The only difference here is that an account will not be created/associated with this student
  //object. Additionally, it will have a property called "isManual" that indicates that this is a manual
  //object, and not an actual student account. The function will take in a student name & a profile pic
  //& a class ID and will return the newly created student object. (the class version)
  static async addManualStudent(name, profileImageID, classID) {
    const studentObject = {
      classes: [classID],
      currentClassID: classID,
      emailAddress: '',
      name,
      phoneNumber: '',
      profileImageID,
      isManual: true,
      classesMissed: 0,
      classesAttended: 0,
    };
    const studentAdded = await this.students.add(studentObject);
    const studentID = studentAdded.id;
    await this.updateStudentObject(studentID, {
      ID: studentID,
    });
    const student = await this.getStudentByID(studentID);

    const classToJoin = await this.classes.doc(classID).get();
    if (!classToJoin.exists) {
      return -1;
    }

    const studentClassObject = {
      ID: studentID,
      assignmentHistory: [],
      attendanceHistory: {},
      averageRating: 0,
      currentAssignments: [],
      isReadyEnum: 'WORKING_ON_IT',
      profileImageID: student.profileImageID,
      name: student.name,
      isManual: true,
      totalAssignments: 0,
    };

    await this.updateClassObject(classID, {
      students: firebase.firestore.FieldValue.arrayUnion(studentClassObject),
    });

    this.logEvent('MANUAL_STUDENT_ADDITION');

    return studentClassObject;
  }

  //This function will take in a student ID & a class ID and remove the connection between that student
  //and the class
  static async removeStudent(classID, studentID) {
    //First removes the student from the class
    let theClass = await this.getClassByID(classID);
    let arrayOfClassStudents = theClass.students;
    let indexOfStudent = arrayOfClassStudents.findIndex(student => {
      return student.ID === studentID;
    });
    arrayOfClassStudents.splice(indexOfStudent, 1);
    await this.updateClassObject(classID, {
      students: arrayOfClassStudents,
    });

    //Then removes the class's reference from the student's array of classes.
    //If it's a manual student, it deletes the whole object
    let theStudent = await this.getStudentByID(studentID);
    if (theStudent.isManual && theStudent.isManual === true) {
      await this.students.doc(studentID).delete();
    } else {
      let arrayOfStudentClasses = theStudent.classes;
      let indexOfClass = arrayOfStudentClasses.findIndex(eachClass => {
        return eachClass === classID;
      });
      arrayOfClassStudents.splice(indexOfClass, 1);
      if (arrayOfClassStudents.length > 0) {
        await this.updateStudentObject(studentID, {
          classes: arrayOfClassStudents,
          currentClassID: arrayOfClassStudents[0],
        });
      } else {
        await this.updateStudentObject(studentID, {
          classes: arrayOfClassStudents,
          currentClassID: ''
        });
      }
      this.logEvent('TEACHER_REMOVE_STUDENT');
    }

    return 0;
  }

  //This function will take a name of an event and log it to firebase analytics (not async)
  static logEvent(eventName, eventArgs) {
    if (eventArgs !== undefined) {
      this.analytics.logEvent(eventName, eventArgs);
    } else {
      this.analytics.logEvent(eventName);
    }
  }

  //This function will take in the name of a screen as well as the name of the class and set the
  //current screen to those inputs in firebase analytics (not async)
  static setCurrentScreen(screenName, screenClass) {
    this.analytics.setCurrentScreen(screenName, screenClass);
  }
}
