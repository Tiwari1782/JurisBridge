const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Case = require('../models/Case');
const { AppError } = require('../middleware/errorHandler');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { caseId, amount } = req.body;

    if (!caseId || !amount) {
      return next(new AppError('Case ID and amount are required', 400));
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return next(new AppError('Case not found', 404));

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `case_${caseId.slice(-8)}`,
      notes: { caseId, userId: req.user.id },
    });

    // Save pending payment
    const payment = await Payment.create({
      caseId,
      userId: req.user.id,
      lawyerId: caseDoc.lawyerId,
      amount,
      razorpayOrderId: order.id,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        prefill: {
          name: req.user.name,
          email: req.user.email,
          contact: req.user.phone || '',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, caseId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError('Payment verification failed — invalid signature', 400));
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'completed',
      },
      { new: true }
    );

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    console.log(`✅ Payment verified: ₹${payment.amount} for case ${caseId}`);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payments for a case
// @route   GET /api/payments/case/:caseId
// @access  Private
const getCasePayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ caseId: req.params.caseId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, getCasePayments };