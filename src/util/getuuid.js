import { v4 as uuidv4 } from "uuid";
import * as Random from "expo-random";

export default async function getuuid() {
  return uuidv4({ random: await Random.getRandomBytesAsync(16) });
}
