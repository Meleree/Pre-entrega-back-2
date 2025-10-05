import Ticket from '../dao/models/ticket.model.js'; // ✅ default import

export default class TicketRepository {
  async create(ticketData) {
    const ticket = new Ticket(ticketData);
    return ticket.save();
  }

  async getAll() {
    return Ticket.find().populate('purchaser').lean();
  }

  async getById(id) {
    return Ticket.findById(id).populate('purchaser').lean();
  }
}
