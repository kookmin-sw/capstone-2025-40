import {initializeApp} from "firebase/app";
import {getStorage} from "firebase/storage";
import settings from "./settings";

const app = initializeApp(settings.FIREBASE_CONFIG);
const storage = getStorage(app);

export {storage};
