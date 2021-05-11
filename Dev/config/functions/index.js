//This file contains all of the Cloud Functions that will be used by Quran Connect to interact with Cloud Firestore
//and other Firebase functionality
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./qcServiceAccountKey.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://quranconnect-4e4bc.firebaseio.com',
	storageBucket: 'quranconnect-4e4bc.appspot.com',
});

const messaging = admin.messaging();
const storage = admin.storage().bucket();
const firestore = admin.firestore();
const Teachers = firestore.collection('Teachers');
const Classes = firestore.collection('Classes');
const Students = firestore.collection('Students');

// -------------------------- Document Creators, Getters, and Updaters --------------------------

//Method takes in all the required information to create a teacher document, and adds it to Cloud Firestore under
//the Teachers collection.
exports.createTeacher = functions.https.onCall(async (input, context) => {
	const { emailAddress, name, phoneNumber, profileImageID, teacherID } = input;

	const batch = firestore.batch();

	batch.create(Teachers.doc(teacherID), {
		classIDs: [],
		currentClassID: '',
		customImprovementTags: [],
		emailAddress,
		name,
		phoneNumber,
		profileImageID,
		teacherID,
	});
	await batch.commit();
	return 0;
});

//Method takes in all the required information to create a student document, and adds it to Cloud Firestore under
//the Students collection. The isManual field will either be a boolean (false), or it will contain some information
//about the class that the manual student will be apart of
exports.createStudent = functions.https.onCall(async (input, context) => {
	const { emailAddress, isManual, name, phoneNumber, profileImageID, studentID } = input;

	const batch = firestore.batch();
	if (isManual === false) {
		batch.create(Students.doc(studentID), {
			classIDs: [],
			currentClassID: '',
			emailAddress,
			isManual,
			name,
			phoneNumber,
			profileImageID,
			studentID,
		});
		await batch.commit();

		return studentID;
	} else {
		const { classID, classInviteCode } = isManual;
		const newDocument = await Students.add({
			classIDs: [classID],
			currentClassID: classID,
			emailAddress,
			isManual: true,
			name,
			phoneNumber,
			profileImageID,
		});
		const docID = (await newDocument.get()).id;
		await newDocument.update({
			studentID: docID,
		});

		await joinClassByClassInviteCode(classInviteCode, docID);

		return newDocument.id;
	}
});

//Method takes in all the required information to create a class document, and adds it to Cloud Firestore under
//the Classes collection. Returns the new class ID
exports.createClass = functions.https.onCall(async (input, context) => {
	const { classImageID, className, teacherID } = input;

	const newClassDocument = await Classes.add({ classImageID, className, students: [] });
	//Adds the base class invite code, the classID and the teacher's information to the newly created class document
	const result = await firestore.runTransaction(async (transaction) => {
		const teacherDocument = (await transaction.get(Teachers.doc(teacherID))).data();
		await transaction.update(Classes.doc(newClassDocument.id), {
			classID: newClassDocument.id,
			classInviteCode: newClassDocument.id.substring(0, 5),
			teachers: [
				{
					name: teacherDocument.name,
					profileImageID: teacherDocument.profileImageID,
					teacherID,
				},
			],
		});

		await transaction.update(Teachers.doc(teacherID), {
			classIDs: admin.firestore.FieldValue.arrayUnion(newClassDocument.id),
			currentClassID: newClassDocument.id,
		});
		return newClassDocument.id;
	});

	return result;
});

//Method takes in a teacher ID and returns that document's data as an object. If the teacher document doesn't exist,
//method returns -1;
exports.getTeacherByID = functions.https.onCall(async (input, context) => {
	const { teacherID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const document = await transaction.get(Teachers.doc(teacherID));
		if (document.exists) {
			return document.data();
		} else {
			return -1;
		}
	});

	return result;
});

//Method takes in a student ID and returns that document's data as an object. If the student document doesn't exist,
//method returns -1;
exports.getStudentByID = functions.https.onCall(async (input, context) => {
	const { studentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const document = await transaction.get(Students.doc(studentID));
		if (document.exists) {
			return document.data();
		} else {
			return -1;
		}
	});
	return result;
});

//Method takes in a class ID and returns that document's data as an object. If the class document doesn't exist,
//method returns -1;
exports.getClassByID = functions.https.onCall(async (input, context) => {
	const { classID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const document = await transaction.get(Classes.doc(classID));
		if (document.exists) {
			return document.data();
		} else {
			return -1;
		}
	});

	return result;
});

// Method takes in a teacherID and returns an array of class documents that belong to that specific teacher
exports.getClassesByTeacherID = functions.https.onCall(async (input, context) => {
	const { teacherID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const teacherDocument = (await transaction.get(Teachers.doc(teacherID))).data();

		const promises = [];
		for (classID of teacherDocument.classIDs) {
			promises.push(transaction.get(Classes.doc(classID)));
		}

		let finalArray = await Promise.all(promises);

		finalArray = finalArray.map((classDoc) => classDoc.data());

		return finalArray;
	});

	return result;
});

// Method takes in a studentID and returns an array of class documents that belong to that specific student
exports.getClassesByStudentID = functions.https.onCall(async (input, context) => {
	const { studentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const studentDocument = (await transaction.get(Students.doc(studentID))).data();

		const promises = [];
		for (classID of studentDocument.classIDs) {
			promises.push(transaction.get(Classes.doc(classID)));
		}

		let finalArray = await Promise.all(promises);

		finalArray = finalArray.map((classDoc) => classDoc.data());

		return finalArray;
	});

	return result;
});

// Method takes in a class ID and a student ID and returns that studen's information specific to that class. If the document
// doesn't exist, the method returns -1
exports.getStudentByClassID = functions.https.onCall(async (input, context) => {
	const { classID, studentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const document = await transaction.get(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
		);
		if (document.exists) {
			return document.data();
		} else {
			return -1;
		}
	});

	return result;
});

// This method is going to take in a classID and is going to return all the class-level student objects
// that are appended with an array called "currentAssignments" which will contain the assignment documents
// for the specified student
exports.getStudentsWithCurrentAssignmentsByClassID = functions.https.onCall(
	async (input, context) => {
		const { classID } = input;

		const result = await firestore.runTransaction(async (transaction) => {
			const promises = [];

			const classLevelStudents = Classes.doc(classID).collection('Students');
			const collectionDocuments = await classLevelStudents.listDocuments();

			for (const document of collectionDocuments) {
				promises.push(getStudentWithCurrentAssignmentsByStudentID(document.id, classID));
			}

			const finalArray = await Promise.all(promises);

			return finalArray;
		});

		return result;
	}
);

//This method is going to take an object containing updates and a teacherID. Then it will update the teacher document
//in Cloud Firestore. If, based on the updates, the Teacher Object also needs to updated in other locations where data
//needs to be consistant, then that will also happen.
exports.updateTeacherByID = functions.https.onCall(async (input, context) => {
	const { teacherID, updates } = input;

	//Checks if the updates contain data that needs to be consistent across both the teacher document and the
	//teacher in the array of teachers in the classes collection
	if (updates.name || updates.profileImageID) {
		await firestore.runTransaction(async (transaction) => {
			const teacherDocument = (await transaction.get(Teachers.doc(teacherID))).data();
			const classIDs = teacherDocument.classIDs;
			const classDocuments = [];
			for (const classID of classIDs) {
				const eachClass = (await transaction.get(Classes.doc(classID))).data();
				classDocuments.push(eachClass);
			}
			for (const eachClass of classDocuments) {
				const updatedClass = eachClass;
				const indexOfTeacher = eachClass.teachers.findIndex(
					(eachTeacher) => eachTeacher.teacherID === teacherID
				);
				if (updates.name) {
					updatedClass.teachers[indexOfTeacher].name = updates.name;
				}
				if (updates.profileImageID) {
					updatedClass.teachers[indexOfTeacher].profileImageID = updates.profileImageID;
				}
				await transaction.update(Classes.doc(eachClass.classID), {
					teachers: updatedClass.teachers,
				});
			}
			await transaction.update(Teachers.doc(teacherID), updates);
		});
	} else {
		const batch = firestore.batch();
		batch.update(Teachers.doc(teacherID), updates);
		await batch.commit();
	}

	return 0;
});

//This method is going to take an object containing updates and a studentID. Then it will update the student document
//in Cloud Firestore. If, based on the updates, the Student Object also needs to updated in other locations where data
//needs to be consistant, then that will also happen.
exports.updateStudentByID = functions.https.onCall(async (input, context) => {
	const { studentID, updates } = input;

	//Checks if the updates contain data that needs to be consistent across both the student document and the
	//student in the array of students in the classes collection
	if (updates.name || updates.profileImageID) {
		await firestore.runTransaction(async (transaction) => {
			const studentDocument = (await transaction.get(Students.doc(studentID))).data();
			const classIDs = studentDocument.classIDs;
			const classDocuments = [];
			for (classID of classIDs) {
				const eachClass = (await transaction.get(Classes.doc(classID))).data();
				classDocuments.push(eachClass);
			}
			for (const eachClass of classDocuments) {
				const updatedClass = eachClass;
				const indexOfStudent = eachClass.students.findIndex(
					(eachStudent) => eachStudent.studentID === studentID
				);
				if (updates.name) {
					updatedClass.students[indexOfStudent].name = updates.name;
					await transaction.update(
						Classes.doc(eachClass.classID)
							.collection('Students')
							.doc(studentID),
						{
							name: updates.name,
						}
					);
				}
				if (updates.profileImageID) {
					updatedClass.students[indexOfStudent].profileImageID = updates.profileImageID;
					await transaction.update(
						Classes.doc(eachClass.classID)
							.collection('Students')
							.doc(studentID),
						{
							profileImageID: updates.profileImageID,
						}
					);
				}
				await transaction.update(Classes.doc(eachClass.classID), {
					students: updatedClass.students,
				});
			}
			await transaction.update(Students.doc(studentID), updates);
		});
	} else {
		const batch = firestore.batch();
		batch.update(Students.doc(studentID), updates);
		await batch.commit();
	}

	return 0;
});

//This method is going to take an object containing updates and a classID. Then it will update the class document
//in Cloud Firestore.
exports.updateClassByID = functions.https.onCall(async (input, context) => {
	const { classID, updates } = input;
	const batch = firestore.batch();
	batch.update(Classes.doc(classID), updates);
	await batch.commit();
	return 0;
});

//This method is going to take in a classID and remove it's reference from a teacherID which will also be passed in as
//a parameter. It will also update the teacher's currentClassID if it is set to the class that needs to be disconnected
exports.disconnectTeacherFromClass = functions.https.onCall(async (input, context) => {
	const { teacherID, classID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const teacherDocument = (await transaction.get(Teachers.doc(teacherID))).data();

		await transaction.update(Classes.doc(classID), {
			teachers: admin.firestore.FieldValue.arrayRemove({
				name: teacherDocument.name,
				profileImageID: teacherDocument.profileImageID,
				teacherID,
			}),
		});

		if (teacherDocument.currentClassID === classID) {
			if (teacherDocument.classIDs.length > 1) {
				const newClassID = teacherDocument.classIDs.find((eachClassID) => eachClassID !== classID);
				await transaction.update(Teachers.doc(teacherID), {
					classIDs: admin.firestore.FieldValue.arrayRemove(classID),
					currentClassID: newClassID,
				});
			} else {
				await transaction.update(Teachers.doc(teacherID), {
					classIDs: admin.firestore.FieldValue.arrayRemove(classID),
					currentClassID: '',
				});
			}
		} else {
			await transaction.update(Teachers.doc(teacherID), {
				classes: admin.firestore.FieldValue.arrayRemove(classID),
			});
		}
		return 0;
	});

	return result;
});

//-------------------------- Join Class Functions --------------------------

//This method is going to take in a studentID and a classInviteCode as parameters. It is then going to connect
//the two documents by adding the classID to the array of the student's classes. Then it will add the student snippet
//object to the class document. Then it creates the student document in the Students subcollection under the class document
//and fills in the proper information. If it is an incorrect classInviteCode, the method will return -1;
exports.joinClassByClassInviteCode = functions.https.onCall(async (input, context) => {
	const { classInviteCode, studentID } = input;

	const result = await joinClassByClassInviteCode(classInviteCode, studentID);

	return result;
});

//This method is going to take in a studentID and a classID and is going to disconnect that student from the class. All of their
//information will still be saved in the subcollections, they just won't have access to that class anymore. Also updates the
//student's "currentClassID" field if necessary
exports.disconnectStudentFromClass = functions.https.onCall(async (input, context) => {
	const { classID, studentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const studentDocument = (await transaction.get(Students.doc(studentID))).data();

		await transaction.update(Classes.doc(classID), {
			students: admin.firestore.FieldValue.arrayRemove({
				name: studentDocument.name,
				profileImageID: studentDocument.profileImageID,
				studentID,
			}),
		});

		if (studentDocument.isManual === true) {
			await transaction.delete(Students.doc(studentID));
		} else {
			await transaction.update(Students.doc(studentID), {
				classIDs: admin.firestore.FieldValue.arrayRemove(classID),
			});
			if (studentDocument.currentClassID === classID) {
				if (studentDocument.classIDs.length > 1) {
					const classIDToUpdateTo = studentDocument.classIDs.find(
						(newClassIDs) => newClassIDs !== classID
					);
					await transaction.update(Students.doc(studentID), {
						currentClassID: classIDToUpdateTo,
					});
				} else {
					await transaction.update(Students.doc(studentID), {
						currentClassID: '',
					});
				}
			}
		}

		return 0;
	});

	return result;
});

//-------------------------- Assignment Functions --------------------------

//This method is going to take in assignment details and a studentID and a classID as parameters, and is going to add
//that assignment as a document to the student's assingments subcollection. The method is going to return
//the newly created assignment document's ID
exports.addAssignmentByStudentID = functions.https.onCall(async (input, context) => {
	const { classID, studentID, location, name, type } = input;

	const assignmentID = await addAssignmentByStudentID(classID, studentID, location, name, type);
	return assignmentID;
});

//This method is going to take in assignment details and a classID as parameters. It is then going to add that
//assignment as new document for every single one of the students in their assignments subcollection.
exports.addAssignmentByClassID = functions.https.onCall(async (input, context) => {
	const { classID, location, name, type } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const classDocument = (await transaction.get(Classes.doc(classID))).data();
		const promises = [];
		for (const studentObject of classDocument.students) {
			promises.push(
				addAssignmentByStudentID(classID, studentObject.studentID, location, name, type)
			);
		}
		await Promise.all(promises);

		return 0;
	});

	return result;
});

//This method is going to take in a classID, a studentID, and an assignmentID and some details about an assignment stored in
//in an object. It will then update that assignment for that student in the subcollection. If the updates includes
//the status, then a notificaion will be sent to the teacher
exports.updateAssignmentByAssignmentID = functions.https.onCall(async (input, context) => {
	const { studentID, classID, assignmentID, updates } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const classDocument = (await transaction.get(Classes.doc(classID))).data();
		const studentDocument = (await transaction.get(Students.doc(studentID))).data();

		await transaction.update(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
				.collection('Assignments')
				.doc(assignmentID),
			updates
		);

		if (updates.status) {
			for (const teacher of classDocument.teachers) {
				sendNotification(
					teacher.teacherID,
					'Status Update',
					studentDocument.name + ' has updated their status for an assignment.'
				);
			}
		}

		return 0;
	});

	return result;
});

//This method is going to take in a studentID, a classID, and an assignmentID. It will then return that assignment document
//if it exists. If it does not exist, -1 is returned;
exports.getAssignmentByID = functions.https.onCall(async (input, context) => {
	const { studentID, classID, assignmentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const document = await transaction.get(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
				.collection('Assignments')
				.doc(assignmentID)
		);

		if (document.exists) {
			return document.data();
		} else {
			return -1;
		}
	});

	return result;
});

//This method is going to take in an evalutation object, a studentID, a classID, and an assignmentID and will set the
//evaluation for that assignment to that object. If this is a new evaluation, then a completion date field will also
//be added to the document. And the average rating and total assignments for the student will be updated.
//The assignment status will also be set to COMPLETE. If this is simply an evaluation update, then the only thing
//that will happen is that the evaluation will be updated along with the student's average rating
exports.submitEvaluationByAssignmentID = functions.https.onCall(async (input, context) => {
	const { evaluation, studentID, classID, assignmentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const studentObject = (await transaction.get(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
		)).data();
		const assignmentObject = (await transaction.get(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
				.collection('Assignments')
				.doc(assignmentID)
		)).data();

		// This if statement checks if this assignment has been already graded, and based on that, either created
		// a new assignment evaluation, or overwrites the old one.
		if (assignmentObject.evaluation) {
			//Performs the calculation to figure out the new average grade
			let sum = studentObject.averageRating * studentObject.totalAssignments;
			sum -= assignmentObject.evaluation.rating;
			sum += evaluation.rating;

			const newAverageRating = sum / studentObject.totalAssignments;
			await transaction.update(
				Classes.doc(classID)
					.collection('Students')
					.doc(studentID),
				{ averageRating: newAverageRating }
			);
			await transaction.update(
				Classes.doc(classID)
					.collection('Students')
					.doc(studentID)
					.collection('Assignments')
					.doc(assignmentID),
				{
					evaluation,
				}
			);

			return 0;
		} else {
			//Performs the calculation to figure out the new average grade for the student.
			let sum = studentObject.averageRating * studentObject.totalAssignments;
			sum += evaluation.rating;

			const newAverageRating = sum / (studentObject.totalAssignments + 1);

			//Gets the date string to be logged as the completion date for the assignment
			const completionDate = convertDateToString(new Date());

			await transaction.update(
				Classes.doc(classID)
					.collection('Students')
					.doc(studentID),
				{
					averageRating: newAverageRating,
					totalAssignments: admin.firestore.FieldValue.increment(1),
				}
			);
			await transaction.update(
				Classes.doc(classID)
					.collection('Students')
					.doc(studentID)
					.collection('Assignments')
					.doc(assignmentID),
				{
					evaluation,
					completionDate,
					status: 'COMPLETED',
				}
			);

			return 0;
		}
	});

	sendNotification(studentID, 'Assignment Graded', 'Your teacher has graded your assignment.');

	return result;
});

//This method is going to take in a studentID and a classID. It will then return all the completed assignments for that student
//as an array. If the student doesn't have any completed assignments, then the method returns an empty array. This method takes
//in a second parameter: limit. If this parameter is a number, then the method will only return that number of assignments sorted
//by completion date. If that parameter is not a number, then the method returns ALL of the student's past assignments sorted
//by completion date
exports.getCompletedAssignmentsByStudentID = functions.https.onCall(async (input, context) => {
	const { classID, studentID, limit } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const assignmentsQuery = Classes.doc(classID)
			.collection('Students')
			.doc(studentID)
			.collection('Assignments')
			.where('status', '==', 'COMPLETED');

		let finalDocs = [];

		if (typeof limit === 'number') {
			finalDocs = await transaction.get(assignmentsQuery.limit(limit));
		} else {
			finalDocs = await transaction.get(assignmentsQuery);
		}

		finalDocs = finalDocs.docs.map((doc) => doc.data());

		//Sortst them by completionDate
		finalDocs.sort((a, b) => {
			return new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime();
		});

		return finalDocs;
	});

	return result;
});

//This method is going to take in an assignmentID, studentID, and classID and attempt to download the audio file associated
//with the submission from Firebase Storage. If either there is no submission associated with the passed in assignmentID,
//then the function will return -1;
exports.downloadAudioByAssignmentID = functions.https.onCall(async (input, context) => {
	const { studentID, classID, assignmentID } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const assignmentDocument = (await transaction.get(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
				.collection('Assignments')
				.doc(assignmentID)
		)).data();

		if (assignmentDocument.submission) {
			const uri = storage.file('audioFiles/' + studentID + classID + assignmentID);
			const exists = uri.exists();
			if (exists[0] === true) {
				const downloadURL = await uri.getSignedUrl({ action: 'read', expires: '03-17-2025' });
				const finalDownloadURL = await downloadURL[0];
				return finalDownloadURL;
			} else {
				return -1;
			}
		} else {
			return -1;
		}
	});

	return result;
});

// -------------------------- Practice Log Functions --------------------------

//This function is going to take in a day in the format YYYY-MM-DD which will be the beginning of a specific week, and it will
//add the practice log for that week which will also be passed in as parameter. If there is already a practice log for that
//week, it will be replaced with this new one. Otherwise, a new document will be created containing it.
exports.addPracticeLogForStudentByWeek = functions.https.onCall(async (input, context) => {
	const { studentID, classID, day, practiceLog } = input;

	const batch = firestore.batch();

	const document = Classes.doc(classID)
		.collection('Students')
		.doc(studentID)
		.collection('DailyPracticeLogs')
		.doc(day);

	batch.set(document, practiceLog);
	await batch.commit();

	return 0;
});

//This function is going to take in a day in the format YYYY-MM-DD which will be the beginning of a specific week, and it will
//fetch the document that contains pratice logs for that entire week given a specific studentID and a classID.
//If there is no log for that week i.e. the document doesn't exist, the function will return -1
exports.getPracticeLogForStudentByWeek = functions.https.onCall(async (input, context) => {
	const { studentID, classID, day } = input;
	const result = await firestore.runTransaction(async (transaction) => {
		const document = await transaction.get(
			Classes.doc(classID)
				.collection('Students')
				.doc(studentID)
				.collection('DailyPracticeLogs')
				.doc(day)
		);

		if (document.exists) {
			return document.data();
		} else {
			return {};
		}
	});

	return result;
});

//-------------------------- Attendance Functions --------------------------

//This method is going to take in a classID and a day string in the format YYYY-MM-DD and an object containing key-value pairs of
//students and their attendance for that specific day. If there is already an attendance that exists and is saved to that
//day, then the method will override that document with the new updated attendance for that day. If there isn't an
//exisitng attendance for the day, then a new document will be added for that day containing the attendance.
exports.saveAttendanceForClassByDay = functions.https.onCall(async (input, context) => {
	const { classID, day, attendanceObject } = input;
	const result = await firestore.runTransaction(async (transaction) => {
		const attendanceDocumentRef = Classes.doc(classID)
			.collection('Attendance')
			.doc(day);
		const attendanceDocument = await transaction.get(attendanceDocumentRef);
		const attendanceData = attendanceDocument.data();

		if (!attendanceDocument.exists) {
			for (const studentID of Object.keys(attendanceObject)) {
				if (attendanceObject[studentID] === true) {
					await transaction.update(
						Classes.doc(classID)
							.collection('Students')
							.doc(studentID),
						{
							classesAttended: admin.firestore.FieldValue.increment(1),
						}
					);
				} else {
					await transaction.update(
						Classes.doc(classID)
							.collection('Students')
							.doc(studentID),
						{
							classesMissed: admin.firestore.FieldValue.increment(1),
						}
					);
				}
			}
		} else {
			for (const studentID of Object.keys(attendanceObject)) {
				if (attendanceObject[studentID] === true && attendanceData[studentID] === false) {
					await transaction.update(
						Classes.doc(classID)
							.collection('Students')
							.doc(studentID),
						{
							classesAttended: admin.firestore.FieldValue.increment(1),
							classesMissed: admin.firestore.FieldValue.increment(-1),
						}
					);
				} else if (attendanceObject[studentID] === false && attendanceData[studentID] === true) {
					await transaction.update(
						Classes.doc(classID)
							.collection('Students')
							.doc(studentID),
						{
							classesAttended: admin.firestore.FieldValue.increment(-1),
							classesMissed: admin.firestore.FieldValue.increment(1),
						}
					);
				}
			}
		}

		await transaction.set(attendanceDocumentRef, attendanceObject);
		return 0;
	});

	return result;
});

//This method is going to take a classID and a day string in the format YYYY-MM-DD and is going to return an array
//an object that contains keys which are each studentID, and a boolean value for that student which indicates whether
//the student was there or not. true means they were present, while false means they were not. If there is no attendance data
//for that day, an empty object will be returned.
exports.getAttendanceForClassByDay = functions.https.onCall(async (input, context) => {
	const { classID, day } = input;

	const result = await firestore.runTransaction(async (transaction) => {
		const attendanceDocument = await transaction.get(
			Classes.doc(classID)
				.collection('Attendance')
				.doc(day)
		);
		if (attendanceDocument.exists) {
			return attendanceDocument.data();
		} else {
			return {};
		}
	});

	return result;
});

// -------------------------- Email & Notifications --------------------------

//Method sends a notification with a custom title and body to a specific topic (user)
exports.sendNotification = functions.https.onCall(async (input, context) => {
	const { topic, title, body } = input;
	await sendNotification(topic, title, body);
	return 0;
});

// -------------------------- Helper Functions --------------------------

//This method will take in a date object, and will convert it to a string in the format YYYY-MM-DD
const convertDateToString = (dateObject) => {
	let year = dateObject.getFullYear();
	let month = dateObject.getMonth() + 1;
	let day = dateObject.getDate();
	if (month < 10) {
		month = '0' + month;
	}
	if (day < 10) {
		day = '0' + day;
	}
	const dateString = year + '-' + month + '-' + day;

	return dateString;
};

//This method will serve as the global function for sending notifications to a specific topic (user)
const sendNotification = async (topic, title, body) => {
	await messaging.sendToTopic(topic, {
		notification: {
			title,
			body,
		},
	});
};

//This method will serve as the global function for joining a class using a classInviteCode
const joinClassByClassInviteCode = async (classInviteCode, studentID) => {
	const result = await firestore.runTransaction(async (transaction) => {
		const query = await transaction.get(Classes.where('classInviteCode', '==', classInviteCode));
		if (query.docs.length === 0) {
			return -1;
		}
		const classDocument = query.docs[0].data();
		const studentDocument = (await transaction.get(Students.doc(studentID))).data();
		const subCollectionStudentDoc = await transaction.get(
			Classes.doc(classDocument.classID)
				.collection('Students')
				.doc(studentID)
		);

		await transaction.update(Students.doc(studentID), {
			classIDs: admin.firestore.FieldValue.arrayUnion(classDocument.classID),
			currentClassID: classDocument.classID,
		});
		await transaction.update(Classes.doc(classDocument.classID), {
			students: admin.firestore.FieldValue.arrayUnion({
				name: studentDocument.name,
				studentID,
				profileImageID: studentDocument.profileImageID,
			}),
		});

		//Checks to see if that student already had data in that class
		if (!subCollectionStudentDoc.exists) {
			await transaction.set(
				Classes.doc(classDocument.classID)
					.collection('Students')
					.doc(studentID),
				{
					averageRating: 0,
					classesMissed: 0,
					classesAttended: 0,
					name: studentDocument.name,
					profileImageID: studentDocument.profileImageID,
					studentID,
					totalAssignments: 0,
				}
			);
		} else {
			await transaction.update(
				Classes.doc(classDocument.classID)
					.collection('Students')
					.doc(studentID),
				{
					name: studentDocument.name,
					profileImageID: studentDocument.profileImageID,
				}
			);
		}

		for (const teacher of classDocument.teachers) {
			const { teacherID } = teacher;
			sendNotification(
				teacherID,
				'New Student',
				studentDocument.name + ' has joined ' + classDocument.className
			);
		}

		return classDocument.classID;
	});

	return result;
};

//This method will serve as the global function for adding an assignment for a specific student
const addAssignmentByStudentID = async (classID, studentID, location, name, type) => {
	const newBatch = firestore.batch();
	const assignmentDate = convertDateToString(new Date());

	const newDocument = await Classes.doc(classID)
		.collection('Students')
		.doc(studentID)
		.collection('Assignments')
		.add({
			assignmentDate,
			location,
			name,
			type,
			status: 'NOT_STARTED',
		});

	newBatch.update(
		Classes.doc(classID)
			.collection('Students')
			.doc(studentID)
			.collection('Assignments')
			.doc(newDocument.id),
		{ assignmentID: newDocument.id }
	);

	await newBatch.commit();

	sendNotification(studentID, 'New Assignment', 'Your teacher has added a new assignment for you.');
	return newDocument.id;
};

// This global function is going to take in a student ID and a class ID and is going to return that student's object
// along with array titled currentAssignments, containing the student's current assignments.
const getStudentWithCurrentAssignmentsByStudentID = async (studentID, classID) => {
	const studentDocument = Classes.doc(classID)
		.collection('Students')
		.doc(studentID);
	const assignmentsNeedHelp = studentDocument
		.collection('Assignments')
		.where('status', '==', 'NEED_HELP')
		.get();
	const assignmentsReady = studentDocument
		.collection('Assignments')
		.where('status', '==', 'READY')
		.get();
	const assignmentsWorkingOnIt = studentDocument
		.collection('Assignments')
		.where('status', '==', 'WORKING_ON_IT')
		.get();
	const assignmentsNotStarted = studentDocument
		.collection('Assignments')
		.where('status', '==', 'NOT_STARTED')
		.get();

	const functionResults = await Promise.all([
		studentDocument.get(),
		assignmentsNeedHelp,
		assignmentsReady,
		assignmentsWorkingOnIt,
		assignmentsNotStarted,
	]);

	const studentObject = functionResults[0].data();
	studentObject.currentAssignments = functionResults[1].docs
		.map((doc) => doc.data())
		.concat(functionResults[2].docs.map((doc) => doc.data()))
		.concat(functionResults[3].docs.map((doc) => doc.data()))
		.concat(functionResults[4].docs.map((doc) => doc.data()));

	return studentObject;
};
