import Cart from "../dao/models/cart.model.js";
import Product from "../dao/models/product.model.js";
import User from "../dao/models/user.model.js";
import { sendPurchaseEmail } from "./email.service.js";

class TicketService {
  constructor() {
    this.tickets = [];
  }

  async createTicket(ticketData, purchaserName) {
    if (!ticketData.products || ticketData.products.length === 0) {
      throw new Error("No hay productos en el ticket");
    }

    const code = `TICKET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const ticket = {
      id: Date.now().toString(),
      code,
      products: ticketData.products,
      amount: ticketData.amount || 0,
      purchaser: ticketData.purchaser,
      createdAt: new Date(),
    };

    this.tickets.push(ticket);

    try {
      await sendPurchaseEmail(ticket.purchaser, ticket.products, ticket.amount, purchaserName, ticket.code);
      console.log(`✅ Email de compra enviado a: ${ticket.purchaser}`);
    } catch (err) {
      console.error("Error enviando email de ticket:", err);
    }

    return ticket;
  }

  async checkoutCart(cartId, userEmail) {
    const cart = await Cart.findById(cartId).populate("products.product");
    if (!cart) throw new Error("Carrito no encontrado");

    const user = await User.findOne({ email: userEmail });
    if (!user) throw new Error("Usuario no encontrado");

    if (!cart.products || cart.products.length === 0) {
      throw new Error("El carrito está vacío");
    }

    const purchasedProducts = [];
    const remainingProducts = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = item.product;
      const qty = item.quantity;

      if (product.stock >= qty) {
        product.stock -= qty;
        await product.save();

        purchasedProducts.push({
          title: product.title,
          quantity: qty,
          price: product.price,
        });

        totalAmount += product.price * qty;
      } else {
        remainingProducts.push(item);
      }
    }

    cart.products = remainingProducts;
    await cart.save();

    if (purchasedProducts.length === 0) {
      throw new Error("No hay productos disponibles para la compra");
    }

    const ticket = await this.createTicket(
      {
        products: purchasedProducts,
        amount: totalAmount,
        purchaser: user.email,
      },
      `${user.first_name} ${user.last_name}`
    );

    return ticket;
  }
}

export default TicketService;
