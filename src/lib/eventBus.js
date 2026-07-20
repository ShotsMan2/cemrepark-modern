import { EventEmitter } from "events";

class EventBus extends EventEmitter {}

const eventBus = new EventBus();

export const EVENTS = {
  ORDER_PLACED: "ORDER_PLACED",
  ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
  USER_REGISTERED: "USER_REGISTERED",
};

export default eventBus;
