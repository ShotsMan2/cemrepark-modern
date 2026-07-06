export const OrderStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

const transitions = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: []
};

export class OrderStateMachine {
  constructor(initialState = OrderStatus.PENDING) {
    if (!Object.values(OrderStatus).includes(initialState)) {
      throw new Error(`Invalid initial state: ${initialState}`);
    }
    this.currentState = initialState;
  }

  canTransitionTo(nextState) {
    const allowed = transitions[this.currentState];
    return allowed && allowed.includes(nextState);
  }

  transitionTo(nextState) {
    if (!this.canTransitionTo(nextState)) {
      throw new Error(`Invalid transition: Cannot transition from ${this.currentState} to ${nextState}`);
    }
    this.currentState = nextState;
    return this.currentState;
  }

  getState() {
    return this.currentState;
  }
}
