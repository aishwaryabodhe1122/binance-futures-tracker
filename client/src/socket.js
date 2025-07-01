import { io } from "socket.io-client";

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:4000";

const socket = io(BACKEND);
export default socket;
