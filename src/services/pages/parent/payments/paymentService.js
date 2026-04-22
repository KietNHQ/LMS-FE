import { parentService } from "../parentService";

// Service for parent payments page.
// TODO: Add API calls when backend endpoints are ready.
export const paymentService = {
  listPayments: parentService.listPayments,
  getPaymentById: parentService.getPaymentById,
  payInvoice: parentService.payInvoice,
  applyDiscountCode: parentService.applyDiscountCode,
  moduleServices: parentService.moduleServices,
  listByModule: parentService.listByModule,
  callByKey: parentService.callByKey,
};

export default paymentService;
