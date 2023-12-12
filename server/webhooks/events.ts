import { shopGetCategories } from '../../app/_shared/lib/tebex';
import prisma from '../../bot/lib/prisma';
import type { Response } from 'express';
import { TWebhookData } from './types';

type THandleWebhookEvent = {
  data: TWebhookData;
  res: Response;
};
const handleWebhookEvent = async ({ data, res }: THandleWebhookEvent) => {
  try {
    if (data.type === 'payment.completed') {
      const categories = await shopGetCategories();
      if (categories.length <= 0) return res.status(500).send('Could not get category list');

      const products = categories.map((category) => category.packages).flat();
      const productsToSave = [];

      for (const paymentProduct of data.subject.products) {
        const productData = products.find((entry) => entry.id === paymentProduct.id);
        if (!productData) return res.status(500).send('Could not find the product');

        const storeProduct = {
          productId: paymentProduct.id,
          productName: paymentProduct.name,
          description: productData.description,
          image: productData.image,
          totalPrice: paymentProduct.paid_price.amount,
          basePrice: paymentProduct.base_price.amount,
          categoryName: productData.category.name,
          discount: productData.discount,
          expirationDate: paymentProduct.expires_at
            ? typeof paymentProduct.expires_at === 'string'
              ? new Date(paymentProduct.expires_at)
              : paymentProduct.expires_at
            : undefined,
          salesTax: productData.sales_tax,
          quantity: paymentProduct.quantity,
        };
        productsToSave.push(storeProduct);
      }

      const { transaction_id, customer, price_paid, status, fees } = data.subject;

      const dbUser = await prisma.user.findFirst({
        where: { steamId: customer.username.id },
      });
      if (!dbUser || dbUser.steamId !== customer.username.id) return res.status(500).send('Could not find the user');

      const query = await prisma.payment.create({
        data: {
          user: {
            connect: {
              steamId: customer.username.id,
            },
          },
          customerCountry: customer.country,
          customerEmail: customer.email,
          customerSteamId: customer.username.id,
          customerUsername: customer.username.username,
          gatewayFeeAmount: fees.gateway.amount,
          gatewayFeeCurrency: fees.gateway.currency,
          priceAmount: price_paid.amount,
          priceCurrency: price_paid.currency,
          status: status.description,
          transactionId: transaction_id,
          taxFeeAmount: fees.tax.amount,
          taxFeeCurrency: fees.tax.currency,
          products: {
            createMany: {
              data: [...productsToSave],
            },
          },
        },
      });
      await prisma.user.update({
        where: { steamId: customer.username.id },
        data: {
          totalPaid: {
            increment: price_paid.amount,
          },
        },
      });
      if (query?.id) return res.status(200).send('Payment received');
      return res.status(500).send('Failed to store payment');
    }
  } catch (error) {
    console.log('Webhook event error', error);
    res.status(500).send('Server error (3)');
  }
};

export default handleWebhookEvent;
