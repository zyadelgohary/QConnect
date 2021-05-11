// This screen will contain the functions that are used with images in the AddManualStudentsScreen
import studentImages from 'config/studentImages';

const getRandomGenderNeutralImage = () => {
	index = Math.floor(Math.random() * Math.floor(studentImages.genderNeutralImages.length));
	imageIndex = studentImages.genderNeutralImages[index];
	return imageIndex;
};

const getRandomMaleImage = () => {
	index = Math.floor(Math.random() * Math.floor(studentImages.maleImages.length));
	imageIndex = studentImages.maleImages[index];
	return imageIndex;
};

const getRandomFemaleImage = () => {
	index = Math.floor(Math.random() * Math.floor(studentImages.femaleImages.length));
	imageIndex = studentImages.femaleImages[index];
	return imageIndex;
};


const getHighlightedImages = () => {
    const defaultImageID = getRandomGenderNeutralImage();
	// get a second gender neutral image, make sure it is different than the first one
	do {
		secondGenericImageId = getRandomGenderNeutralImage();
	} while (secondGenericImageId === defaultImageID);

	//initialize the array of suggested images
	let proposedImages = [
		defaultImageID,
		secondGenericImageId,
		getRandomFemaleImage(),
		getRandomMaleImage(),
	];
	return proposedImages;
};

export {
	getRandomGenderNeutralImage,
	getRandomMaleImage,
	getRandomFemaleImage,
	getHighlightedImages,
};
