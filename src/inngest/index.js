import { inngest } from "./client.js";
import { 
  chatProcessor,
  safetyDetector
} from "./functions.js";

export const functions = [
  chatProcessor,
  safetyDetector
];
export { inngest };
