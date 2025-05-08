import {initializeApp} from "firebase/app";
import {getStorage} from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import settings from "./settings";

const app = initializeApp(settings.FIREBASE_CONFIG);
const storage = getStorage(app);
const messaging = getMessaging(app);

export {storage, messaging, getToken, onMessage};
