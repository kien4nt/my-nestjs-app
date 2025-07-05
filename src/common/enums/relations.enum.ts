export enum AdminRelation {
  STORES = 'stores',
}

export enum StoreRelation {
  ADMIN = 'admin',
  CHILD_SHOPS = 'childShops',
  PARENT_GROUP = 'parentGroup',
  RECEIVED_DELIVERIES = 'receivedDeliveries',
  SENT_DELIVERIES = 'sentDeliveries',
  LATEST_DELIVERY = 'latestDelivery',
}

export enum DeliveryHistoryRelation {
  RECEIVER_STORE = 'receiverStore',
  SENDER_STORE = 'senderStore',
}

export enum LatestDeliveryRelation {
  STORE = 'store',
}
