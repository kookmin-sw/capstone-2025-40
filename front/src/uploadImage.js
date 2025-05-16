// uploadImage.js
import imageCompression from "browser-image-compression";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {storage} from "./firebase";

const uploadImage = async (file, pathAndName) => {
	try {
		// 이미지 압축 옵션
		const options = {
			maxSizeMB: 0.5, // 최대 용량(MB)
			maxWidthOrHeight: 1024, // 최대 가로/세로
			useWebWorker: true,
		};

		// 압축 실행
		const compressedFile = await imageCompression(file, options);
		const fileRef = ref(storage, pathAndName || `quest-photos/${Date.now()}_${compressedFile.name}`);
		await uploadBytes(fileRef, compressedFile);
		const downloadURL = await getDownloadURL(fileRef);
		return downloadURL;
	} catch (error) {
		console.error("이미지 업로드 실패:", error);
		throw error;
	}
};

export default uploadImage;
